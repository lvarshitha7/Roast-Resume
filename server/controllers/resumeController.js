const OpenAI = require('openai');
const multer  = require('multer');
const Resume  = require('../models/Resume');
const { extractText }       = require('../utils/fileParser');
const { uploadFileBuffer }  = require('../utils/cloudinary');

// ─── OpenAI Client ────────────────────────────────────────────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Multer (Memory Storage) ──────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF and DOCX files are accepted.'));
    }
  },
}).single('resume');

// Wrap multer in a promise so we can use async/await
const runMulter = (req, res) =>
  new Promise((resolve, reject) => {
    upload(req, res, (err) => (err ? reject(err) : resolve()));
  });

// ─── OpenAI Prompt ────────────────────────────────────────────────────────────
const buildPrompt = (resumeText, targetRole) => `
You are an expert resume reviewer and career coach. Analyze the following resume for the role of "${targetRole}".

Return ONLY a valid JSON object (no markdown, no extra text) with exactly this structure:
{
  "overallScore": <integer 0-100>,
  "sections": [
    {
      "name": "<section name>",
      "score": <integer 0-100>,
      "feedback": "<specific constructive feedback>",
      "fix": "<concrete actionable fix suggestion>"
    }
  ],
  "missingKeywords": ["<keyword1>", "<keyword2>", ...],
  "strengths": ["<strength1>", "<strength2>", ...]
}

Rules:
- Evaluate these sections (if present): Summary/Objective, Skills, Work Experience, Education, Projects, Certifications, Achievements
- missingKeywords: list 5-15 important keywords/skills for "${targetRole}" that are absent from the resume
- strengths: list 3-6 genuine strengths found in the resume
- Be honest, specific, and actionable. Scores should reflect real quality.
- overallScore should be a weighted average considering all sections

RESUME TEXT:
---
${resumeText.substring(0, 12000)}
---
`;

// ─── Parse & Validate AI Response ─────────────────────────────────────────────
const parseAIResponse = (raw) => {
  let parsed;

  // Strip possible markdown code fences
  const cleaned = raw.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON. Please try again.');
  }

  const { overallScore, sections, missingKeywords, strengths } = parsed;

  if (
    typeof overallScore !== 'number' ||
    !Array.isArray(sections) ||
    !Array.isArray(missingKeywords) ||
    !Array.isArray(strengths)
  ) {
    throw new Error('AI response missing required fields.');
  }

  return {
    overallScore: Math.min(100, Math.max(0, Math.round(overallScore))),
    sections: sections.map((s) => ({
      name:     String(s.name || '').trim(),
      score:    Math.min(100, Math.max(0, Math.round(Number(s.score) || 0))),
      feedback: String(s.feedback || '').trim(),
      fix:      String(s.fix || '').trim(),
    })),
    missingKeywords: missingKeywords.map((k) => String(k).trim()).filter(Boolean),
    strengths:       strengths.map((s) => String(s).trim()).filter(Boolean),
  };
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/resume/analyze
 * Accepts: multipart/form-data { resume: File, targetRole: string }
 * Returns: AI feedback JSON (not persisted)
 */
const analyzeResume = async (req, res, next) => {
  try {
    await runMulter(req, res);

    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    const targetRole = (req.body?.targetRole || '').trim();
    if (!targetRole) {
      return res.status(400).json({ error: 'targetRole is required.' });
    }

    // 1. Extract text
    const extractedText = await extractText(req.file.buffer, req.file.mimetype);

    // 2. Call OpenAI
    const completion = await openai.chat.completions.create({
      model:       'gpt-3.5-turbo',
      temperature: 0.3,
      max_tokens:  2000,
      messages: [
        {
          role:    'system',
          content: 'You are an expert resume reviewer. Always respond with valid JSON only.',
        },
        {
          role:    'user',
          content: buildPrompt(extractedText, targetRole),
        },
      ],
    });

    const rawResponse = completion.choices[0]?.message?.content || '';
    const aiFeedback  = parseAIResponse(rawResponse);

    return res.status(200).json({
      success: true,
      data: {
        fileName:     req.file.originalname,
        targetRole,
        extractedText: extractedText.substring(0, 500) + '…', // preview only
        aiFeedback,
        fileSize:   req.file.size,
        mimeType:   req.file.mimetype,
      },
    });
  } catch (err) {
    // Multer errors
    if (err instanceof multer.MulterError) {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? 'File size exceeds 5 MB limit.'
        : err.message;
      return res.status(400).json({ error: msg });
    }
    next(err);
  }
};

/**
 * POST /api/resume/save
 * Body: { fileName, targetRole, aiFeedback, extractedText, fileSize, mimeType }
 * File: multipart resume (re-upload for Cloudinary)
 */
const saveResume = async (req, res, next) => {
  try {
    await runMulter(req, res);

    const {
      fileName, targetRole, extractedText,
      aiFeedback: aiFeedbackRaw, fileSize, mimeType,
    } = req.body;

    if (!fileName || !targetRole || !extractedText || !aiFeedbackRaw) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    let aiFeedback;
    try {
      aiFeedback = typeof aiFeedbackRaw === 'string'
        ? JSON.parse(aiFeedbackRaw)
        : aiFeedbackRaw;
    } catch {
      return res.status(400).json({ error: 'Invalid aiFeedback JSON.' });
    }

    // Upload to Cloudinary if file provided
    let cloudinaryUrl    = null;
    let cloudinaryPublicId = null;

    if (req.file) {
      const result = await uploadFileBuffer(req.file.buffer, req.file.originalname);
      cloudinaryUrl      = result.url;
      cloudinaryPublicId = result.publicId;
    }

    const resume = await Resume.create({
      fileName,
      targetRole,
      cloudinaryUrl,
      cloudinaryPublicId,
      extractedText,
      aiFeedback,
      fileSize: fileSize ? Number(fileSize) : 0,
      mimeType: mimeType || '',
    });

    return res.status(201).json({
      success: true,
      data:    resume,
    });
  } catch (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

/**
 * GET /api/resume/history
 * Query params: page (default 1), limit (default 10), role (filter)
 */
const getHistory = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.role) {
      filter.targetRole = { $regex: req.query.role, $options: 'i' };
    }

    const [total, resumes] = await Promise.all([
      Resume.countDocuments(filter),
      Resume.find(filter, '-extractedText')  // exclude heavy field from list
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        resumes,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/resume/history/:id
 * Returns a single resume record (with full extractedText)
 */
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id).lean();
    if (!resume) {
      return res.status(404).json({ error: 'Resume record not found.' });
    }
    return res.status(200).json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/resume/history/:id
 */
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume record not found.' });
    }

    // Remove from Cloudinary
    if (resume.cloudinaryPublicId) {
      const { deleteFile } = require('../utils/cloudinary');
      await deleteFile(resume.cloudinaryPublicId).catch((e) =>
        console.warn('Cloudinary delete warning:', e.message)
      );
    }

    await resume.deleteOne();
    return res.status(200).json({ success: true, message: 'Deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeResume,
  saveResume,
  getHistory,
  getResumeById,
  deleteResume,
};

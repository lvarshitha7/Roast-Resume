const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer  = require('multer');
const Resume  = require('../models/Resume');
const { extractText }      = require('../utils/fileParser');
const { uploadFileBuffer } = require('../utils/s3');

// ─── Gemini Client ────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-flash-lite-latest',
  generationConfig: {
    temperature:      0.3,
    maxOutputTokens:  2048,
    responseMimeType: 'application/json',
  },
});

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

// ─── Gemini Prompt ────────────────────────────────────────────────────────────
const buildPrompt = (resumeText, targetRole) => `
You are a brutally honest expert resume reviewer. Analyze the following resume for the role of "${targetRole}".

Return ONLY a valid JSON object (no markdown, no extra text) with exactly this structure:
{
  "overallScore": <number 0.0-10.0, one decimal place>,
  "sections": [
    {
      "name": "<section name>",
      "score": <number 0.0-10.0, one decimal place>,
      "issue": "<what is specifically wrong or weak — be direct and critical>",
      "reason": "<why this is a problem for the '${targetRole}' role — explain the impact>",
      "fix": "<concrete, actionable suggestion to improve this section immediately>"
    }
  ],
  "missingKeywords": ["<keyword1>", "<keyword2>", ...],
  "strengths": ["<strength1>", "<strength2>", ...]
}

Rules:
- Evaluate ALL present sections: Summary/Objective, Skills, Work Experience, Education, Projects, Certifications, Achievements
- Scores are out of 10 (e.g. 7.5), not 100
- overallScore: weighted average of all sections
- issue: be direct and specific — name the actual problem (e.g. "No quantified achievements", "Summary is generic")
- reason: explain the recruiter/hiring impact clearly
- fix: give a specific, immediately actionable suggestion
- missingKeywords: 5-15 keywords/skills critical for "${targetRole}" missing from the resume
- strengths: 3-6 genuine positives found in the resume

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

  // Clamp score to 0-10 range (handle both 0-100 and 0-10 responses)
  const normalise = (n) => {
    const num = parseFloat(n) || 0;
    // If model returned 0-100 range, divide by 10
    return num > 10 ? Math.round((num / 10) * 10) / 10 : Math.round(num * 10) / 10;
  };

  return {
    overallScore: Math.min(10, Math.max(0, normalise(overallScore))),
    sections: sections.map((s) => ({
      name:   String(s.name   || '').trim(),
      score:  Math.min(10, Math.max(0, normalise(s.score))),
      issue:  String(s.issue  || s.feedback || '').trim(),
      reason: String(s.reason || '').trim(),
      fix:    String(s.fix    || '').trim(),
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

    // 2. Call Gemini
    const prompt = [
      'You are an expert resume reviewer. Always respond with valid JSON only.',
      buildPrompt(extractedText, targetRole),
    ].join('\n\n');

    const geminiResult = await geminiModel.generateContent(prompt);
    const rawResponse  = geminiResult.response.text();
    const aiFeedback   = parseAIResponse(rawResponse);

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
    // Gemini API errors — surface a useful message
    const geminiMsg = err?.message || '';
    if (err.status === 429 || geminiMsg.includes('429')) {
      return res.status(429).json({ error: 'AI quota exceeded. Please try again in a moment.' });
    }
    if (geminiMsg.includes('not found') || geminiMsg.includes('404')) {
      return res.status(502).json({ error: 'AI model unavailable. Please try again later.' });
    }
    if (err.status === 400 || err.status === 403 || geminiMsg.includes('API key')) {
      return res.status(502).json({ error: 'AI service error. Check your Gemini API key.' });
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

    // Upload to S3 if file provided
    let s3Url = null;
    let s3Key = null;

    if (req.file) {
      const result = await uploadFileBuffer(req.file.buffer, req.file.originalname);
      s3Url = result.url;
      s3Key = result.key;
    }

    const resume = await Resume.create({
      fileName,
      targetRole,
      s3Url,
      s3Key,
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

    // Remove from S3
    if (resume.s3Key) {
      const { deleteFile } = require('../utils/s3');
      await deleteFile(resume.s3Key).catch((e) =>
        console.warn('S3 delete warning:', e.message)
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

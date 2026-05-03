const express  = require('express');
const router   = express.Router();
const {
  analyzeResume,
  saveResume,
  getHistory,
  getResumeById,
  deleteResume,
} = require('../controllers/resumeController');

// POST /api/resume/analyze  — extract + AI analyze (no DB write)
router.post('/analyze', analyzeResume);

// POST /api/resume/save     — save result + upload to Cloudinary
router.post('/save', saveResume);

// GET  /api/resume/history  — paginated list
router.get('/history', getHistory);

// GET  /api/resume/history/:id — single record
router.get('/history/:id', getResumeById);

// DELETE /api/resume/history/:id
router.delete('/history/:id', deleteResume);

module.exports = router;

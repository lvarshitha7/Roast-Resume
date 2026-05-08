const express  = require('express');
const router   = express.Router();
const {
  analyzeResume,
  saveResume,
  getHistory,
  getResumeById,
  deleteResume,
} = require('../controllers/resumeController');
const mongoose = require('mongoose');

// Middleware: returns 503 when MongoDB is not connected
const requireMongo = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database is currently unavailable. Resume analysis still works — only saving/history requires a DB connection.',
    });
  }
  next();
};

// POST /api/resume/analyze  — AI analyze only (no DB write — always works)
router.post('/analyze', analyzeResume);

// POST /api/resume/save     — save result + upload to Cloudinary (needs DB)
router.post('/save', requireMongo, saveResume);

// GET  /api/resume/history  — paginated list (needs DB)
router.get('/history', requireMongo, getHistory);

// GET  /api/resume/history/:id — single record (needs DB)
router.get('/history/:id', requireMongo, getResumeById);

// DELETE /api/resume/history/:id (needs DB)
router.delete('/history/:id', requireMongo, deleteResume);

module.exports = router;

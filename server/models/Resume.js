const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  score:    { type: Number, required: true, min: 0, max: 100 },
  feedback: { type: String, required: true },
  fix:      { type: String, required: true },
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: [true, 'fileName is required'],
    trim: true,
    maxlength: [255, 'fileName too long'],
  },
  targetRole: {
    type: String,
    required: [true, 'targetRole is required'],
    trim: true,
    maxlength: [100, 'targetRole too long'],
  },
  s3Url: {
    type: String,
    default: null,
  },
  s3Key: {
    type: String,
    default: null,
  },
  extractedText: {
    type: String,
    required: true,
    maxlength: [50000, 'Resume text too long'],
  },
  aiFeedback: {
    overallScore:    { type: Number, required: true, min: 0, max: 100 },
    sections:        { type: [sectionSchema], default: [] },
    missingKeywords: { type: [String], default: [] },
    strengths:       { type: [String], default: [] },
  },
  fileSize:   { type: Number, default: 0 },   // bytes
  mimeType:   { type: String, default: '' },
  createdAt:  { type: Date, default: Date.now, index: true },
}, {
  timestamps: false,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Text index for searching history
resumeSchema.index({ targetRole: 1, createdAt: -1 });

// Trim extractedText before save to save storage
resumeSchema.pre('save', function (next) {
  if (this.extractedText) {
    this.extractedText = this.extractedText.substring(0, 50000);
  }
  next();
});

module.exports = mongoose.model('Resume', resumeSchema);

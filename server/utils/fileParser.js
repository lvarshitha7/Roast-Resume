const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');

/**
 * Extract plain text from an in-memory file buffer.
 * @param {Buffer} buffer   - File buffer
 * @param {string} mimetype - MIME type of the file
 * @returns {Promise<string>} Extracted text
 */
const extractText = async (buffer, mimetype) => {
  const isDocx =
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword';

  const isPdf = mimetype === 'application/pdf';

  if (isPdf) {
    const data = await pdfParse(buffer);
    if (!data.text || data.text.trim().length < 50) {
      throw new Error('Could not extract readable text from the PDF. The file may be scanned or image-based.');
    }
    return data.text.trim();
  }

  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer });
    if (!result.value || result.value.trim().length < 50) {
      throw new Error('Could not extract readable text from the DOCX. The file may be empty or corrupted.');
    }
    return result.value.trim();
  }

  throw new Error(`Unsupported file type: ${mimetype}. Please upload a PDF or DOCX file.`);
};

module.exports = { extractText };

const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
  secure:      true,
});

/**
 * Upload a buffer to Cloudinary as a raw file.
 * @param {Buffer} buffer       - File buffer
 * @param {string} originalName - Original file name (used as public_id base)
 * @param {string} folder       - Cloudinary folder
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadFileBuffer = (buffer, originalName, folder = 'resumeflame/resumes') => {
  return new Promise((resolve, reject) => {
    const sanitizedName = originalName
      .replace(/\.[^/.]+$/, '')            // remove extension
      .replace(/[^a-zA-Z0-9_-]/g, '_')    // sanitize
      .substring(0, 80);

    const publicId = `${folder}/${sanitizedName}_${Date.now()}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id:     publicId,
        resource_type: 'raw',
        overwrite:     false,
        tags:          ['resumeflame', 'resume'],
      },
      (error, result) => {
        if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    // Convert buffer to readable stream
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary by publicId.
 */
const deleteFile = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
};

module.exports = { uploadFileBuffer, deleteFile, cloudinary };

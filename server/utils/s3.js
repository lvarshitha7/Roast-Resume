const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

// ─── S3 Client ────────────────────────────────────────────────────────────────
const s3 = new S3Client({
  region:      process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_BUCKET_NAME;

/**
 * Upload a buffer to S3.
 * @param {Buffer} buffer       - File buffer
 * @param {string} originalName - Original file name
 * @param {string} folder       - S3 key prefix / folder
 * @returns {Promise<{ url: string, key: string }>}
 */
const uploadFileBuffer = async (buffer, originalName, folder = 'resumes') => {
  const sanitizedName = originalName
    .replace(/\.[^/.]+$/, '')          // remove extension
    .replace(/[^a-zA-Z0-9_-]/g, '_')  // sanitize
    .substring(0, 80);

  const ext = originalName.match(/\.[^/.]+$/)?.[0] || '';
  const key = `${folder}/${sanitizedName}_${Date.now()}${ext}`;

  const upload = new Upload({
    client: s3,
    params: {
      Bucket:      BUCKET,
      Key:         key,
      Body:        buffer,
      ContentType: ext === '.pdf' ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  });

  const result = await upload.done();

  // Build a consistent public URL
  const url = result.Location ||
    `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { url, key };
};

/**
 * Delete a file from S3 by its key.
 * @param {string} key - S3 object key
 */
const deleteFile = async (key) => {
  if (!key) return;
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
};

module.exports = { uploadFileBuffer, deleteFile, s3 };

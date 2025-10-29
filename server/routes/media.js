const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const { initCloudinary, cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

initCloudinary();
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

function uploadToCloudinary(buffer, filename, folder, mime) {
  return new Promise((resolve, reject) => {
    const isVideo = mime?.startsWith('video/');
    const resource_type = isVideo ? 'video' : 'image';

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || 'products',
        resource_type,
        format: isVideo ? 'mp4' : 'webp',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        // Delivery optimization
        transformation: isVideo
          ? [{ quality: 'auto', fetch_format: 'auto' }]
          : [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          duration: result.duration,
        });
      }
    );

    stream.end(buffer);
  });
}

// Upload multiple files
router.post('/upload', auth, requireAdmin, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' });
    const { folder } = req.body;

    const results = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, file.originalname, folder, file.mimetype))
    );

    res.json({ assets: results });
  } catch (err) {
    console.error('Media upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Delete asset by publicId
router.delete('/:publicId', auth, requireAdmin, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { type = 'image' } = req.query; // image | video
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: type });
    res.json({ result });
  } catch (err) {
    console.error('Media delete error:', err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

module.exports = router;

// Public: return the migration-output mapping so client can resolve legacy paths
router.get('/map', async (req, res) => {
  try {
    const mapPath = path.join(__dirname, '..', 'scripts', 'migration-output.json');
    if (!fs.existsSync(mapPath)) return res.json({ assets: {} });
    const raw = fs.readFileSync(mapPath, 'utf8');
    let data = {};
    try { data = JSON.parse(raw); } catch (_) { data = {}; }
    res.json({ assets: data });
  } catch (err) {
    console.error('Read media map error:', err);
    res.status(500).json({ message: 'Failed to read media map' });
  }
});

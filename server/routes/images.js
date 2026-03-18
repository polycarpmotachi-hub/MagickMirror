const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const gm = require('gm').subClass({ imageMagick: true });
const { applyTransformations } = require('../services/imageProcessor');

const router = express.Router();

const UPLOAD_DIR = path.resolve(__dirname, '..', process.env.UPLOAD_DIR || './tmp');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const imageId = uuidv4();
    req.imageId = imageId;
    cb(null, `${imageId}_original${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// POST /api/images/upload
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const imageId = path.basename(req.file.filename).split('_original')[0];
  const filePath = req.file.path;

  gm(filePath).identify((err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read image metadata' });
    }
    res.json({
      imageId,
      width: data.size ? data.size.width : null,
      height: data.size ? data.size.height : null,
      format: data.format || 'unknown',
      size: req.file.size,
    });
  });
});

// POST /api/images/:imageId/transform
router.post('/:imageId/transform', async (req, res) => {
  const { imageId } = req.params;
  const transforms = req.body || {};

  const files = await fs.readdir(UPLOAD_DIR);
  const originalFile = files.find(
    (f) => f.startsWith(imageId) && f.includes('_original')
  );

  if (!originalFile) {
    return res.status(404).json({ error: 'Image not found' });
  }

  const inputPath = path.join(UPLOAD_DIR, originalFile);

  try {
    const buffer = await applyTransformations(inputPath, transforms, 'JPEG');
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'no-store');
    res.send(buffer);
  } catch (err) {
    console.error('Transform error:', err);
    res.status(500).json({ error: 'Image transformation failed', detail: err.message });
  }
});

// GET /api/images/:imageId/download?format=jpeg|png|webp
router.get('/:imageId/download', async (req, res) => {
  const { imageId } = req.params;
  const format = (req.query.format || 'jpeg').toUpperCase();
  const mimeMap = { JPEG: 'image/jpeg', PNG: 'image/png', WEBP: 'image/webp' };
  const extMap = { JPEG: 'jpg', PNG: 'png', WEBP: 'webp' };

  const validFormats = ['JPEG', 'PNG', 'WEBP'];
  if (!validFormats.includes(format)) {
    return res.status(400).json({ error: 'Invalid format. Use jpeg, png, or webp.' });
  }

  const files = await fs.readdir(UPLOAD_DIR);
  const originalFile = files.find(
    (f) => f.startsWith(imageId) && f.includes('_original')
  );

  if (!originalFile) {
    return res.status(404).json({ error: 'Image not found' });
  }

  const inputPath = path.join(UPLOAD_DIR, originalFile);
  let transforms = {};
  try {
    transforms = JSON.parse(req.query.transforms || '{}');
  } catch {
    transforms = {};
  }

  try {
    const buffer = await applyTransformations(inputPath, transforms, format);
    res.set('Content-Type', mimeMap[format]);
    res.set(
      'Content-Disposition',
      `attachment; filename="edited.${extMap[format]}"`
    );
    res.send(buffer);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Image processing failed', detail: err.message });
  }
});

// DELETE /api/images/:imageId
router.delete('/:imageId', async (req, res) => {
  const { imageId } = req.params;

  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const toDelete = files.filter((f) => f.startsWith(imageId));
    await Promise.all(toDelete.map((f) => fs.remove(path.join(UPLOAD_DIR, f))));
    res.status(204).send();
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete image files' });
  }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const imagesRouter = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './tmp';

// Ensure tmp directory exists
fs.ensureDirSync(path.resolve(__dirname, UPLOAD_DIR));

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/images', imagesRouter);

app.listen(PORT, () => {
  console.log(`MagickMirror server running on http://localhost:${PORT}`);
});

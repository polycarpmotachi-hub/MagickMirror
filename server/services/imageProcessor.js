const gm = require('gm').subClass({ imageMagick: true });

const DEFAULT_TRANSFORMS = {
  brightness: 100,
  contrast: 0,
  resize: { width: null, height: null, lockAspect: true },
  rotate: 0,
  flip: null,
  grayscale: false,
  blur: 0,
  sharpen: 0,
};

/**
 * Apply a chain of transformations to an image.
 * @param {string} inputPath - Absolute path to the source image
 * @param {object} transforms - Transform parameters
 * @param {string} outputFormat - 'JPEG', 'PNG', or 'WEBP'
 * @returns {Promise<Buffer>}
 */
function applyTransformations(inputPath, transforms = {}, outputFormat = 'JPEG') {
  const t = { ...DEFAULT_TRANSFORMS, ...transforms };

  return new Promise((resolve, reject) => {
    let img = gm(inputPath);

    // 1. Resize
    if (t.resize && (t.resize.width || t.resize.height)) {
      const w = t.resize.width || '';
      const h = t.resize.height || '';
      if (t.resize.lockAspect) {
        img = img.resize(w || null, h || null);
      } else {
        img = img.resize(w, h, '!');
      }
    }

    // 2. Rotate
    if (t.rotate && t.rotate !== 0) {
      img = img.rotate('white', t.rotate);
    }

    // 3. Flip / Flop
    if (t.flip === 'vertical') {
      img = img.flip();
    } else if (t.flip === 'horizontal') {
      img = img.flop();
    }

    // 4. Grayscale
    if (t.grayscale) {
      img = img.colorspace('Gray');
    }

    // 5. Brightness (modulate: brightness%, saturation%, hue%)
    if (t.brightness !== 100) {
      img = img.modulate(t.brightness, 100, 100);
    }

    // 6. Contrast (-10 to +10)
    if (t.contrast && t.contrast !== 0) {
      const steps = Math.abs(Math.round(t.contrast));
      for (let i = 0; i < steps; i++) {
        if (t.contrast > 0) {
          img = img.contrast('+contrast');
        } else {
          img = img.contrast('-contrast');
        }
      }
    }

    // 7. Blur
    if (t.blur && t.blur > 0) {
      img = img.blur(0, t.blur);
    }

    // 8. Sharpen
    if (t.sharpen && t.sharpen > 0) {
      img = img.sharpen(0, t.sharpen);
    }

    img.toBuffer(outputFormat, (err, buffer) => {
      if (err) return reject(err);
      resolve(buffer);
    });
  });
}

module.exports = { applyTransformations };

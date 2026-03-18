import { useState } from 'react';
import styles from './Canvas.module.css';

export default function Canvas({ originalUrl, previewUrl, isLoading }) {
  const [showOriginal, setShowOriginal] = useState(false);

  const displayUrl = showOriginal ? originalUrl : (previewUrl || originalUrl);

  if (!originalUrl) {
    return (
      <div className={styles.placeholder} data-testid="canvas-placeholder">
        <p>Upload an image to get started</p>
      </div>
    );
  }

  return (
    <div className={styles.canvasWrap} data-testid="canvas">
      <div className={styles.imageContainer}>
        {isLoading && (
          <div className={styles.loadingOverlay} data-testid="loading-overlay">
            <span className={styles.spinner} />
          </div>
        )}
        <img
          src={displayUrl}
          alt="Edited preview"
          className={styles.image}
          data-testid="preview-image"
        />
      </div>
      {originalUrl && previewUrl && originalUrl !== previewUrl && (
        <div className={styles.toggleBar}>
          <button
            className={`${styles.toggleBtn} ${!showOriginal ? styles.active : ''}`}
            onClick={() => setShowOriginal(false)}
          >
            Edited
          </button>
          <button
            className={`${styles.toggleBtn} ${showOriginal ? styles.active : ''}`}
            onClick={() => setShowOriginal(true)}
          >
            Original
          </button>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { downloadImage } from '../../api/imageApi';
import styles from './DownloadButton.module.css';

export default function DownloadButton({ imageId, transforms }) {
  const [format, setFormat] = useState('jpeg');
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    if (!imageId) return;
    setIsDownloading(true);
    try {
      await downloadImage(imageId, transforms, format);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className={styles.wrap} data-testid="download-wrap">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value)}
        className={styles.select}
        disabled={!imageId}
        data-testid="format-select"
      >
        <option value="jpeg">JPEG</option>
        <option value="png">PNG</option>
        <option value="webp">WebP</option>
      </select>
      <button
        className={styles.btn}
        onClick={handleDownload}
        disabled={!imageId || isDownloading}
        data-testid="download-btn"
      >
        {isDownloading ? 'Saving…' : '⬇ Download'}
      </button>
    </div>
  );
}

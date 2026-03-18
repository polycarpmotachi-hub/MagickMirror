import { useRef, useState } from 'react';
import styles from './Uploader.module.css';

export default function Uploader({ onUpload, isUploading }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    onUpload(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleChange(e) {
    handleFile(e.target.files[0]);
    e.target.value = '';
  }

  return (
    <div
      className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      data-testid="dropzone"
    >
      {isUploading ? (
        <div className={styles.uploading}>
          <span className={styles.spinner} />
          <span>Uploading…</span>
        </div>
      ) : (
        <>
          <div className={styles.icon}>🖼️</div>
          <p className={styles.label}>Drag &amp; drop an image here</p>
          <p className={styles.sub}>or</p>
          <button
            className={styles.btn}
            onClick={() => inputRef.current?.click()}
            data-testid="choose-file-btn"
          >
            Choose File
          </button>
          <p className={styles.hint}>JPEG, PNG, WebP, GIF, TIFF — up to 50 MB</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.fileInput}
        onChange={handleChange}
        data-testid="file-input"
      />
    </div>
  );
}

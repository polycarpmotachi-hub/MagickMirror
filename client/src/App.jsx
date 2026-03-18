import { useState, useEffect, useRef, useCallback } from 'react';
import Uploader from './components/Uploader/Uploader';
import Canvas from './components/Canvas/Canvas';
import Toolbar, { DEFAULT_TRANSFORMS } from './components/Toolbar/Toolbar';
import DownloadButton from './components/DownloadButton/DownloadButton';
import { uploadImage, getTransformPreviewUrl, deleteImage } from './api/imageApi';
import styles from './App.module.css';

export default function App() {
  const [imageId, setImageId] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [transforms, setTransforms] = useState({ ...DEFAULT_TRANSFORMS });
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  const prevImageId = useRef(null);

  // Cleanup previous image when a new one is uploaded
  useEffect(() => {
    if (prevImageId.current && prevImageId.current !== imageId) {
      deleteImage(prevImageId.current);
    }
    prevImageId.current = imageId;
  }, [imageId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevImageId.current) deleteImage(prevImageId.current);
    };
  }, []);

  // Debounced transform effect
  const applyTransform = useCallback(
    (id, t) => {
      if (!id) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setIsTransforming(true);
        setError(null);
        try {
          const url = await getTransformPreviewUrl(id, t);
          setPreviewUrl(url);
        } catch (err) {
          setError(err.message || 'Transform failed');
        } finally {
          setIsTransforming(false);
        }
      }, 250);
    },
    []
  );

  useEffect(() => {
    if (imageId) {
      applyTransform(imageId, transforms);
    }
  }, [imageId, transforms, applyTransform]);

  async function handleUpload(file) {
    setIsUploading(true);
    setError(null);
    setPreviewUrl(null);
    setOriginalUrl(null);
    setTransforms({ ...DEFAULT_TRANSFORMS });

    try {
      const data = await uploadImage(file);
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setImageId(data.imageId);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <span className={styles.logo}>🪞</span>
        <h1 className={styles.title}>MagickMirror</h1>
        <span className={styles.tagline}>Photo Editor</span>
      </header>

      <main className={styles.main}>
        <div className={styles.sidebar}>
          <Uploader onUpload={handleUpload} isUploading={isUploading} />

          {error && (
            <div className={styles.error} data-testid="error-banner">
              ⚠ {error}
            </div>
          )}

          <Toolbar
            transforms={transforms}
            onChange={setTransforms}
            disabled={!imageId}
          />

          <DownloadButton imageId={imageId} transforms={transforms} />
        </div>

        <div className={styles.canvasArea}>
          <Canvas
            originalUrl={originalUrl}
            previewUrl={previewUrl}
            isLoading={isTransforming}
          />
        </div>
      </main>
    </div>
  );
}

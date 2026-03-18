let currentPreviewUrl = null;

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/api/images/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }

  return res.json();
}

export async function getTransformPreviewUrl(imageId, transforms) {
  const res = await fetch(`/api/images/${imageId}/transform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transforms),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Transform failed' }));
    throw new Error(err.error || 'Transform failed');
  }

  const blob = await res.blob();

  if (currentPreviewUrl) {
    URL.revokeObjectURL(currentPreviewUrl);
  }

  currentPreviewUrl = URL.createObjectURL(blob);
  return currentPreviewUrl;
}

export async function downloadImage(imageId, transforms, format = 'jpeg') {
  const transformsParam = encodeURIComponent(JSON.stringify(transforms));
  const url = `/api/images/${imageId}/download?format=${format}&transforms=${transformsParam}`;

  const a = document.createElement('a');
  a.href = url;
  a.download = `edited.${format === 'jpeg' ? 'jpg' : format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function deleteImage(imageId) {
  if (!imageId) return;
  await fetch(`/api/images/${imageId}`, { method: 'DELETE' }).catch(() => {});
}

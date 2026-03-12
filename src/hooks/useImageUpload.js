import { useState, useRef } from 'react';
import { uploadImageToDrive } from '../services/api/googleDriveService';

/**
 * Manages image selection and on-submit sequential uploads to Google Drive.
 *
 * Before submit: driver freely adds/removes with zero network calls (pure local state).
 * On submit:     caller calls uploadAll() → images upload sequentially with live progress.
 * During upload: isSubmitting=true → ImageUploadSection hides X buttons and Add.
 * After upload:  folder URL is saved and can be retrieved with getFolderUrl() for post-submission use.
 */
export function useImageUpload({ uploadType, driverName, opportunityId }) {
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const folderUrlRef = useRef(null);

  const addImages = (files) => {
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      status: 'pending',
    }));
    setImages(prev => [...prev, ...newImages]);
    return newImages;
  };

  const removeImage = (id) => {
    if (isSubmitting) return; // locked — upload in progress
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  /** Upload all pending images sequentially. Awaitable — resolves when all are done/failed. */
  const uploadAll = async () => {
    const toUpload = images.filter(img => img.status === 'pending');
    if (toUpload.length === 0) return;
    setIsSubmitting(true);
    try {
      for (const img of toUpload) {
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'uploading' } : i));
        try {
          const res = await uploadImageToDrive(img.file, { uploadType, driverName, opportunityId });
          const url = res?.file?.parent_folder_url;
          if (url && !folderUrlRef.current) folderUrlRef.current = url;
          setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'done' } : i));
        } catch {
          setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'error' } : i));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFolderUrl = () => folderUrlRef.current;

  return { images, addImages, removeImage, uploadAll, getFolderUrl, isSubmitting };
}

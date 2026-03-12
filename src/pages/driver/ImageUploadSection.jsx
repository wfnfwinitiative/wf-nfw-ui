import { useRef, useState } from 'react';
import { Camera, Image, X, Loader2, Check, AlertCircle } from 'lucide-react';

/**
 * Renders a photo grid with per-image upload status overlays and a progress bar.
 *
 * Before submit (locked=false): images are local only — driver can freely add/remove.
 * During submit  (locked=true):  uploads are in progress — X and Add are hidden.
 */
export function ImageUploadSection({ images, onAdd, onRemove, sectionRef, locked = false }) {
  const fileInputRef = useRef(null);
  const [viewingImage, setViewingImage] = useState(null);

  const doneCount = images.filter(i => i.status === 'done').length;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) onAdd(files);
    e.target.value = '';
  };

  return (
    <div ref={sectionRef} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-700 flex items-center gap-1">
          <Image className="w-3 h-3" />
          Photos ({images.length})
        </h3>
        {!locked && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 bg-primary-600 text-white rounded text-xs hover:bg-primary-700"
          >
            <Camera className="w-3 h-3" />
            Add
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Progress bar — only visible while submitting */}
      {locked && images.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
          <span>{doneCount}/{images.length} uploaded</span>
          {doneCount === images.length ? (
            <span className="text-green-600 font-medium">All uploaded ✓</span>
          ) : (
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(doneCount / images.length) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square">
              <img
                src={img.preview}
                alt={img.name}
                onClick={() => img.status === 'done' && setViewingImage(img)}
                className={`w-full h-full object-cover rounded transition-opacity ${
                  img.status === 'done' ? 'cursor-pointer hover:opacity-90'
                  : locked ? 'opacity-60'
                  : ''
                }`}
              />
              {img.status === 'uploading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
              {img.status === 'done' && (
                <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              {img.status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/50 rounded">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
              )}
              {!locked && (
                <button
                  onClick={() => onRemove(img.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-2">No photos. Tap "Add" to capture.</p>
      )}

      {/* Fullscreen viewer */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={viewingImage.preview}
            alt={viewingImage.name}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

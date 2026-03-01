'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  artworkId: number;
  currentImagePath?: string;
  onUploadSuccess: (imagePath: string) => void;
}

export default function ImageUpload({ artworkId, currentImagePath, onUploadSuccess }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/artworks/${artworkId}/image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadSuccess(data.imagePath);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    } else {
      setError('Please drop an image file');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this local image? The artwork will fall back to the Wikimedia URL.')) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await fetch(`/api/artworks/${artworkId}/image`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }

      onUploadSuccess(''); // Clear the image path
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!currentImagePath ? (
        // Upload area
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-accent-ochre bg-accent-ochre/10'
              : 'border-gray-300 dark:border-gray-700 hover:border-accent-ochre'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id={`image-upload-${artworkId}`}
          />

          <div className="space-y-3">
            <div className="text-4xl">📤</div>

            {uploading ? (
              <div>
                <p className="text-gray-600 dark:text-gray-400 font-semibold">Uploading...</p>
                <div className="mt-3 w-32 h-2 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-ochre animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">
                  Drop an image here, or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  JPG, PNG, WebP, AVIF • Max 10MB
                </p>
                <label
                  htmlFor={`image-upload-${artworkId}`}
                  className="inline-block px-6 py-3 bg-accent-ochre text-white rounded-lg hover:bg-accent-ochre/90 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
              </>
            )}
          </div>
        </div>
      ) : (
        // Replace/Delete controls
        <div className="flex gap-3">
          <label
            htmlFor={`image-upload-${artworkId}`}
            className="px-4 py-2 bg-accent-sage text-white rounded-lg hover:bg-accent-sage/90 transition-colors cursor-pointer"
          >
            {uploading ? 'Uploading...' : 'Replace Image'}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id={`image-upload-${artworkId}`}
          />
          <button
            onClick={handleDelete}
            disabled={uploading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Delete Local Image
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400 text-sm">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}
    </div>
  );
}

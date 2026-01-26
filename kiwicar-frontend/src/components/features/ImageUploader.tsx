import { useState, useCallback, useRef } from 'react';
import { Upload, X, GripVertical, Image as ImageIcon, Camera, Star } from 'lucide-react';
import { cn } from '@/utils';
import type { UploadedPhoto } from '@/stores/listingWizardStore';
import Spinner from '@/components/common/Spinner';

interface ImageUploaderProps {
  photos: UploadedPhoto[];
  onAdd: (photo: UploadedPhoto) => void;
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  maxPhotos?: number;
  minPhotos?: number;
  className?: string;
}

export default function ImageUploader({
  photos,
  onAdd,
  onRemove,
  onReorder,
  maxPhotos = 10,
  minPhotos = 3,
  className,
}: ImageUploaderProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const remainingSlots = maxPhotos - photos.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;

        const id = Math.random().toString(36).slice(2);

        // Create preview URL
        const url = URL.createObjectURL(file);

        onAdd({
          id,
          url,
          file,
          isUploading: false, // In real app, would be true until upload completes
        });
      }
    },
    [photos.length, maxPhotos, onAdd]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);

      if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleDropOnPhoto = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== targetIndex) {
        onReorder(draggedIndex, targetIndex);
      }
      setDraggedIndex(null);
    },
    [draggedIndex, onReorder]
  );

  const canAddMore = photos.length < maxPhotos;
  const needsMore = photos.length < minPhotos;

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => canAddMore && fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-colors',
          isDraggingOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400',
          canAddMore ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={!canAddMore}
        />

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-1">
            {canAddMore ? 'Drop photos here or click to upload' : 'Maximum photos reached'}
          </p>
          <p className="text-sm text-gray-500">
            {needsMore
              ? `Add at least ${minPhotos - photos.length} more photo${minPhotos - photos.length > 1 ? 's' : ''}`
              : `${photos.length} of ${maxPhotos} photos`}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            JPG, PNG, or WebP up to 5MB each
          </p>
        </div>
      </div>

      {/* Mobile camera button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={!canAddMore}
        className={cn(
          'mt-4 w-full md:hidden flex items-center justify-center gap-2 py-3 px-4',
          'bg-gray-100 rounded-lg text-gray-700 font-medium',
          !canAddMore && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Camera className="h-5 w-5" />
        Take Photo
      </button>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Your Photos ({photos.length}/{maxPhotos})
            </h3>
            <p className="text-xs text-gray-500">Drag to reorder • First photo is the cover</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnPhoto(e, index)}
                className={cn(
                  'relative aspect-square rounded-lg overflow-hidden group',
                  'border-2 transition-all',
                  draggedIndex === index
                    ? 'opacity-50 border-primary-500'
                    : 'border-transparent hover:border-gray-300'
                )}
              >
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Cover badge */}
                {index === 0 && (
                  <div className="absolute top-1 left-1 px-2 py-0.5 bg-primary-600 text-white text-xs font-medium rounded flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Cover
                  </div>
                )}

                {/* Uploading overlay */}
                {photo.isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Spinner className="text-white" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onRemove(photo.id)}
                      className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Remove photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Drag handle */}
                <div className="absolute bottom-1 right-1 p-1 bg-black/50 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                  <GripVertical className="h-4 w-4" />
                </div>
              </div>
            ))}

            {/* Add more button */}
            {canAddMore && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center text-gray-400 hover:text-gray-500 transition-colors"
              >
                <ImageIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Photo tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Photo Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Take photos in good lighting, preferably outdoors</li>
          <li>• Include exterior shots from all angles</li>
          <li>• Capture the interior, dashboard, and odometer</li>
          <li>• Show any damage or wear clearly</li>
        </ul>
      </div>
    </div>
  );
}

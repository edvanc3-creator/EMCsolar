import React, { useState } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

interface PhotoUploadProps {
  onPhotosChange: (photos: string[]) => void;
  initialPhotos?: string[];
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotosChange, initialPhotos = [] }) => {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotos((prev) => {
          const next = [...prev, base64];
          onPhotosChange(next);
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      onPhotosChange(next);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group">
            <img src={photo} alt={`Upload ${index}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <label className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors text-zinc-400 hover:text-emerald-600 hover:border-emerald-200">
          <Camera size={24} />
          <span className="text-xs font-medium">Adicionar Foto</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        </label>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

const ALLOWED_IMAGE_DOMAINS = [
  'i.imgur.com',
  'imgur.com',
  'drive.google.com',
  'lh3.googleusercontent.com',
  'images.unsplash.com',
  'via.placeholder.com',
];

function isValidPhotoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_IMAGE_DOMAINS.some(domain => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
}

interface AnimalCreateFormFotoSectionProps {
  photoUrl: string;
  update: (field: string, value: any) => void;
}

export function AnimalCreateFormFotoSection({ photoUrl, update }: AnimalCreateFormFotoSectionProps) {
  const urlError = useMemo(() => {
    if (!photoUrl) return null;
    return isValidPhotoUrl(photoUrl) ? null : 'Domínio não permitido para fotos. Use Imgur, Google Drive ou Unsplash.';
  }, [photoUrl]);

  const [imageError, setImageError] = useState(false);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-lg font-bold text-white mb-6 border-b border-zinc-800 pb-3">Foto</h2>

      {photoUrl && !imageError && (
        <div className="mb-4 flex justify-center">
          <img
            src={photoUrl}
            alt="Preview do animal"
            className="h-40 w-40 rounded-xl object-cover border border-zinc-700"
            onError={() => setImageError(true)}
          />
        </div>
      )}
      {imageError && (
        <div className="mb-4 flex flex-col items-center gap-2">
          <div className="h-40 w-40 rounded-xl border border-dashed border-red-700 bg-zinc-900/30 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <p className="text-xs text-red-400">Não foi possível carregar a imagem. Verifique a URL.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Camera size={14} />
          URL da Foto
        </label>
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => update('photoUrl', e.target.value)}
            placeholder="https://exemplo.com/foto.jpg"
            className={`h-10 w-full rounded-xl border px-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 transition-all ${
              urlError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-zinc-700 bg-zinc-900/50 focus:border-brand-500 focus:ring-brand-500'
            }`}
          />
          {urlError && (
            <div className="shrink-0" title={urlError}>
              <AlertCircle size={18} className="text-red-500" />
            </div>
          )}
        </div>
        {urlError && (
          <p className="text-xs text-red-400">{urlError}</p>
        )}
        {!urlError && (
          <p className="text-xs text-zinc-500">Insira o link de uma imagem hospedada (Imgur, Google Drive, Unsplash, etc.)</p>
        )}
      </div>
    </section>
  );
}

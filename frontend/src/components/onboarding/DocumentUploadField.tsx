import { FileUp, Replace, Trash2 } from 'lucide-react';
import { DOCUMENT_TYPES, IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/lib/onboarding';

interface DocumentUploadFieldProps {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  acceptImagesOnly?: boolean;
  file?: File;
  error?: string;
  onChange: (file: File | undefined) => void;
  previewAsImage?: boolean;
}

export function DocumentUploadField({
  id,
  label,
  description,
  required,
  acceptImagesOnly,
  file,
  error,
  onChange,
  previewAsImage,
}: DocumentUploadFieldProps) {
  const accept = acceptImagesOnly ? IMAGE_TYPES.join(',') : DOCUMENT_TYPES.join(',');
  const previewUrl = previewAsImage && file?.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="font-semibold text-gray-900">
            {label} {required ? <span className="text-red-500">Required</span> : <span className="text-gray-400 font-medium">Optional</span>}
          </label>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          <p className="text-xs text-gray-400 mt-1">
            Accepted formats: {acceptImagesOnly ? 'JPG, PNG, WEBP' : 'JPG, PNG, WEBP, PDF'}. Maximum file size: 5 MB.
          </p>
          {file && (
            <p className="text-sm text-gray-700 mt-2 truncate">
              {file.name} · {(file.size / 1024).toFixed(0)} KB
            </p>
          )}
          {error && <p className="text-sm text-red-600 mt-2" role="alert">{error}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {previewUrl && (
            <img src={previewUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
          )}
          <input
            id={id}
            type="file"
            className="sr-only"
            accept={accept}
            onChange={(event) => {
              const next = event.target.files?.[0];
              if (!next) return;
              if (next.size > MAX_UPLOAD_BYTES) return onChange(next);
              onChange(next);
            }}
          />
          <label
            htmlFor={id}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            {file ? <Replace size={16} /> : <FileUp size={16} />}
            {file ? 'Replace' : 'Upload'}
          </label>
          {file && (
            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
              onClick={() => onChange(undefined)}
            >
              <Trash2 size={16} /> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

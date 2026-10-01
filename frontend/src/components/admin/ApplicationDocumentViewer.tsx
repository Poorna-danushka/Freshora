import { useState } from 'react';
import { Eye, FileText, Image as ImageIcon, X, ExternalLink } from 'lucide-react';
import { getDocumentUrl } from '@/api/applications';
import type { ApplicationDocument } from '@/types/applications';

interface ApplicationDocumentViewerProps {
  documents: ApplicationDocument[];
  source?: 'api' | 'mock';
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageDocument(doc: ApplicationDocument): boolean {
  if (doc.mimeType && doc.mimeType.startsWith('image/')) return true;
  const fileName = doc.fileName || doc.label || '';
  return /\.(png|jpg|jpeg|webp|gif|bmp)$/i.test(fileName);
}

export function ApplicationDocumentViewer({ documents, source }: ApplicationDocumentViewerProps) {
  const [activePreviewUrl, setActivePreviewUrl] = useState<{ url: string; title: string } | null>(null);

  if (!documents || documents.length === 0) {
    return <p className="text-sm text-slate-500 italic">No documents uploaded for this application.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {documents.map((doc) => {
          const isImage = isImageDocument(doc);
          const isMock = source === 'mock' || doc.id.startsWith('mock_');
          const documentUrl = isMock ? '#' : getDocumentUrl(doc.id);

          return (
            <div
              key={doc.id}
              className="group relative rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 truncate">
                    {doc.label || doc.kind}
                  </span>
                  {doc.required && (
                    <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      Required
                    </span>
                  )}
                </div>

                {isImage && !isMock ? (
                  <div
                    className="relative mb-3 h-36 w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800/80 group-hover:border-slate-700 transition cursor-pointer"
                    onClick={() => setActivePreviewUrl({ url: documentUrl, title: doc.label || doc.fileName || 'Uploaded image' })}
                  >
                    <img
                      src={documentUrl}
                      alt={doc.label || 'Document preview'}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback if image fails to render inline
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-semibold backdrop-blur">
                        <Eye size={14} /> Preview
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                      {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-200 truncate">{doc.fileName || 'Document file'}</p>
                      {doc.sizeBytes ? (
                        <p className="text-[11px] text-slate-500 mt-0.5">{formatBytes(doc.sizeBytes)}</p>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                {!isMock ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setActivePreviewUrl({ url: documentUrl, title: doc.label || doc.fileName || 'Document' })}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                    >
                      <Eye size={13} /> View
                    </button>
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                      title="Open in new tab / download"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">
                    {doc.fileName ? `Mock file: ${doc.fileName}` : 'Demo mock file'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Image Preview Modal */}
      {activePreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900">
              <h3 className="text-base font-bold text-white truncate">{activePreviewUrl.title}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={activePreviewUrl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Open full resolution in new tab"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => setActivePreviewUrl(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  aria-label="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-center bg-slate-950 min-h-[300px] max-h-[75vh] overflow-auto">
              <img
                src={activePreviewUrl.url}
                alt={activePreviewUrl.title}
                className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

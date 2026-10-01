import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ApplicationDetailDrawerProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
}

export function ApplicationDetailDrawer({ title, open, onClose, children, actions }: ApplicationDetailDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close details" onClick={onClose} />
      <aside className="absolute inset-x-0 bottom-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[min(100%,520px)] bg-slate-900 border-t sm:border-t-0 sm:border-l border-slate-700 rounded-t-3xl sm:rounded-none overflow-y-auto max-h-[92vh] sm:max-h-none">
        <div className="sticky top-0 flex items-center justify-between gap-3 px-5 py-4 bg-slate-900 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-6">{children}</div>
        {actions && <div className="sticky bottom-0 p-5 border-t border-slate-800 bg-slate-900 grid grid-cols-1 gap-2">{actions}</div>}
      </aside>
    </div>
  );
}

export function DetailSection({ title, rows }: { title: string; rows: Array<{ label: string; value?: string | null }> }) {
  return (
    <section>
      <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-400 mb-3">{title}</h3>
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs text-slate-500">{row.label}</dt>
            <dd className="text-sm text-slate-100 break-words">{row.value || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

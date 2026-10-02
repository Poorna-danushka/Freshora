import { useState } from 'react';
import type { ReviewAction } from '@/types/applications';

interface ReviewActionDialogsProps {
  open: ReviewAction | null;
  onClose: () => void;
  onConfirm: (action: ReviewAction, note: string) => void;
  pending?: boolean;
  error?: string;
}

export function ReviewActionDialogs({ open, onClose, onConfirm, pending, error }: ReviewActionDialogsProps) {
  const [note, setNote] = useState('');
  if (!open) return null;

  const copy = {
    APPROVE: {
      title: 'Approve application?',
      body: 'Approval will be sent to the backend. This screen will not treat the application as approved unless the API confirms it.',
      confirm: 'Confirm approval',
    },
    REJECT: {
      title: 'Reject application?',
      body: 'Provide a reason for the applicant. Rejection is not applied until the backend accepts it.',
      confirm: 'Confirm rejection',
    },
    REQUEST_MORE_INFO: {
      title: 'Request more information?',
      body: 'Add a note describing what the applicant should provide. This is sent to the backend when available.',
      confirm: 'Send request',
    },
  }[open];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="review-dialog-title">
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700 p-6">
        <h2 id="review-dialog-title" className="text-xl font-bold text-white">{copy.title}</h2>
        <p className="text-sm text-slate-300 mt-2">{copy.body}</p>
        <label className="block mt-4 text-sm font-semibold text-slate-200">
          {open === 'REJECT' ? 'Rejection reason' : 'Admin note'}
          <textarea
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white min-h-24"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-red-400 mt-3" role="alert">{error}</p>}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <button type="button" className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold" onClick={onClose} disabled={pending}>
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold disabled:opacity-50"
            disabled={pending || (open !== 'APPROVE' && note.trim().length < 3)}
            onClick={() => onConfirm(open, note.trim())}
          >
            {pending ? 'Sending…' : copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

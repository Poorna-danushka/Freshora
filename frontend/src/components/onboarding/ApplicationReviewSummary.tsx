import { Pencil } from 'lucide-react';

interface SummarySection {
  title: string;
  onEdit?: () => void;
  rows: Array<{ label: string; value?: string | null }>;
}

export function ApplicationReviewSummary({ sections }: { sections: SummarySection[] }) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section key={section.title} className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-gray-900">{section.title}</h3>
            {section.onEdit && (
              <button type="button" onClick={section.onEdit} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                <Pencil size={14} /> Edit
              </button>
            )}
          </div>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            {section.rows.map((row) => (
              <div key={row.label} className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{row.label}</dt>
                <dd className="text-sm text-gray-900 mt-0.5 break-words">{row.value || '—'}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

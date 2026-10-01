export function IntegrationNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
      {children}
    </div>
  );
}

export function InfoCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-900">
      {children}
    </div>
  );
}

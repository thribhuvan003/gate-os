// Rendered inside the workspace shell while a feature page loads, so switching
// between features keeps the sidebar and shows an instant skeleton instead of a
// blank flash or a frozen previous page.
export default function AppSegmentLoading() {
  return (
    <div className="mx-auto max-w-[1340px] px-4 py-6 sm:px-8 sm:py-10" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="h-3 w-28 animate-pulse rounded-full bg-[var(--surface)]" />
      <div className="mt-3 h-10 w-2/3 max-w-md animate-pulse rounded-2xl bg-[var(--surface)]" />
      <div className="mt-3 h-4 w-full max-w-sm animate-pulse rounded-full bg-[var(--surface)]" />
      <div className="mt-8 grid gap-4 xl:grid-cols-[1.45fr_0.8fr]">
        <div className="h-72 animate-pulse rounded-[length:var(--radius-lg)] bg-[var(--surface)]" />
        <div className="h-72 animate-pulse rounded-[length:var(--radius-md)] bg-[var(--surface)]" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="h-56 animate-pulse rounded-[length:var(--radius-md)] bg-[var(--surface)]" />
        <div className="h-56 animate-pulse rounded-[length:var(--radius-md)] bg-[var(--surface)]" />
        <div className="h-56 animate-pulse rounded-[length:var(--radius-md)] bg-[var(--surface)]" />
      </div>
    </div>
  );
}

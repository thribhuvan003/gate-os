// Rendered inside the workspace shell while a feature page loads, so switching
// between features keeps the sidebar and shows an instant skeleton instead of a
// blank flash or a frozen previous page.
export default function AppSegmentLoading() {
  return (
    <div className="mx-auto max-w-[1500px] p-5 sm:p-8" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="h-6 w-28 animate-pulse rounded-full bg-[var(--surface)]" />
      <div className="mt-4 h-10 w-2/3 max-w-md animate-pulse rounded-2xl bg-[var(--surface)]" />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="h-40 animate-pulse rounded-[1.5rem] bg-[var(--surface)]" />
        <div className="h-40 animate-pulse rounded-[1.5rem] bg-[var(--surface)]" />
        <div className="h-40 animate-pulse rounded-[1.5rem] bg-[var(--surface)]" />
      </div>
      <div className="mt-4 h-56 animate-pulse rounded-[1.5rem] bg-[var(--surface)]" />
    </div>
  );
}

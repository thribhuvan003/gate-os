export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-[1500px] p-5 sm:p-8" aria-busy="true">
      <span className="sr-only">Loading your workspace</span>
      <div className="h-8 w-36 animate-pulse rounded-full bg-[var(--line)]" />
      <div className="mt-16 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="h-80 animate-pulse rounded-[2rem] bg-[var(--surface)]" />
        <div className="h-80 animate-pulse rounded-[2rem] bg-[var(--surface)]" />
      </div>
    </main>
  );
}


"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="mono-label">Your work remains safe</p>
        <h1 className="display-type mt-4 text-5xl">That step did not sync.</h1>
        <p className="mx-auto mt-4 max-w-md text-[var(--muted)]">
          Check your connection and try again. Unsynced drafts stay on this device.
        </p>
        <button className="primary-button mt-8" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}

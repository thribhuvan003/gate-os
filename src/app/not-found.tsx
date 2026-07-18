import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="mono-label">404 · page not found</p>
        <h1 className="display-type mt-4 text-5xl">Take the next useful step.</h1>
        <p className="mx-auto mt-4 max-w-md text-[var(--muted)]">
          This page moved, but your preparation is still safe.
        </p>
        <Link className="primary-button mt-8 inline-flex" href="/app">Return to your space</Link>
      </div>
    </main>
  );
}


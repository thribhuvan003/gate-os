"use client";

import dynamic from "next/dynamic";

/**
 * react-pdf + pdfjs is 412 KB of client JS (plus a 1.2 MB worker) and is the
 * only thing on this route that needs it. Loading it statically put all of that
 * in the route's first load, so the reader chrome could not paint until the
 * whole engine had downloaded and parsed. Behind next/dynamic the header and
 * page controls render immediately and the engine streams in underneath.
 *
 * ssr: false because pdfjs needs a DOM — there is nothing useful to prerender.
 */
const PdfReaderImpl = dynamic(() => import("./pdf-reader").then((module) => module.PdfReader), {
  ssr: false,
  loading: () => (
    <section className="grid min-h-dvh place-items-center bg-[var(--surface-strong)] text-[var(--muted)]" aria-busy="true">
      <p>Opening your PDF…</p>
    </section>
  ),
});

export function PdfReader(props: { id: string; title: string; url: string; initialPage: number }) {
  return <PdfReaderImpl {...props} />;
}

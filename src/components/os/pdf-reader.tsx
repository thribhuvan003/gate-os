"use client";

import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export function PdfReader({ id, title, url, initialPage }: { id: string; title: string; url: string; initialPage: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [width, setWidth] = useState(760);
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.min(920, Math.max(260, entry.contentRect.width - 24))));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const setup = await getBrowserSupabaseClient();
      if (setup.value) await setup.value.from("pdfs").update({ last_read_page: page }).eq("id", id);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [id, page]);

  return (
    <section className="flex min-h-dvh flex-col bg-[#252525] text-white" aria-label={`Reading ${title}`}>
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/70 px-3 py-3 backdrop-blur-xl sm:px-6">
        <div className="min-w-0"><p className="text-[.65rem] uppercase tracking-[.16em] text-white/50">Private PDF</p><h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1></div>
        <div className="flex items-center gap-2">
          <button className="grid size-11 place-items-center rounded-full border border-white/15 disabled:opacity-30" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page"><ChevronLeft /></button>
          <span className="min-w-20 text-center font-mono text-xs">{page} / {pages || "—"}</span>
          <button className="grid size-11 place-items-center rounded-full border border-white/15 disabled:opacity-30" disabled={!pages || page >= pages} onClick={() => setPage((value) => Math.min(pages, value + 1))} aria-label="Next page"><ChevronRight /></button>
          <button className="grid size-11 place-items-center rounded-full border border-white/15" onClick={() => document.documentElement.requestFullscreen?.()} aria-label="Enter full screen"><Maximize2 size={18} /></button>
        </div>
      </header>
      <div ref={containerRef} className="grid flex-1 place-items-start overflow-auto p-3 sm:p-6">
        <Document file={url} onLoadSuccess={({ numPages }) => { setPages(numPages); setPage((value) => Math.max(1, Math.min(value, Math.max(1, numPages)))); }} loading={<p className="p-10 text-white/60">Opening your PDF…</p>} error={<p className="rounded-xl bg-red-950 p-5">This PDF could not be opened.</p>}>
          <Page pageNumber={page} width={width} renderAnnotationLayer renderTextLayer />
        </Document>
      </div>
    </section>
  );
}

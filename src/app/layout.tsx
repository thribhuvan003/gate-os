import type { Metadata, Viewport } from "next";
import { DM_Sans, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const displayFont = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

const bodyFont = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://gateeee.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "GATE OS",
  title: {
    default: "GATE OS — Your preparation, in one space",
    template: "%s · GATE OS",
  },
  description:
    "A private, personal operating system for GATE CS & IT 2027 preparation — focus blocks, syllabus, PYQs, notes, revision, and study circles in one calm space.",
  keywords: [
    "GATE 2027",
    "GATE CS",
    "GATE IT",
    "GATE preparation",
    "study workspace",
    "focus timer",
    "syllabus tracker",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "GATE OS",
    title: "GATE OS — Your preparation, in one space",
    description:
      "A private study operating system for GATE CS & IT 2027 — syllabus, focus, PYQs, notes, and circles, connected.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GATE OS — Your preparation, in one space",
    description:
      "A private study operating system for GATE CS & IT 2027 preparation.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: "#f3f0e7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="editorial-calm"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

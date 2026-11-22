import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vórtex Clipboard - Tu portapapeles, sin límites",
  description:
    "Vórtex Clipboard, de Vortex Company: historial de portapapeles y snippets de texto para copiar y pegar rápido, con búsqueda, fijados y categorías de colores. Todo se guarda local en tu navegador. Gratis y sin anuncios.",
  keywords: [
    "Vórtex Clipboard",
    "portapapeles",
    "historial de portapapeles",
    "clipboard manager",
    "snippets de texto",
    "copiar y pegar",
    "productividad gratis",
    "sin anuncios",
  ],
  authors: [{ name: "Vortex Company" }],
  icons: {
    icon:
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#161616"/><circle cx="24" cy="24" r="17" fill="none" stroke="#84cc16" stroke-width="3.5"/><path d="M24 10a14 14 0 1 1-9.9 4.1" fill="none" stroke="#a3e635" stroke-width="3.5" stroke-linecap="round"/><path d="M24 17a7 7 0 1 0 7 7" fill="none" stroke="#a3e635" stroke-width="3.5" stroke-linecap="round"/><circle cx="24" cy="24" r="3" fill="#a3e635"/></svg>`
      ),
  },
  openGraph: {
    title: "Vórtex Clipboard - Tu portapapeles, sin límites",
    description:
      "Historial de portapapeles y snippets para copiar y pegar rápido. Todo local en tu navegador. Gratis, sin anuncios. De Vortex Company, la misma compañía de Vórtex Music.",
    siteName: "Vórtex Clipboard",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0f10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-[#0f0f10] text-[#ececf1]">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.emetis.com.br"),
  title: "Emetis",
  description: "Conectando cristãos pela proximidade",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Emetis",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://app.emetis.com.br",
    siteName: "Emetis",
    title: "Emetis — Conectando cristãos pela proximidade",
    description: "Encontre amigos, grupos e comunidades cristãs perto de você.",
    images: [{ url: "/images/demo-thumbnail.png", width: 1200, height: 630, alt: "Emetis" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emetis",
    description: "Encontre amigos, grupos e comunidades cristãs perto de você.",
    images: ["/images/demo-thumbnail.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const jakartaSans = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-brand',
});

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)";
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${jakartaSans.variable}`}
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      lang="pt-BR"
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Emetis" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/svg+xml" href="/emetis-icon.svg" />
      </head>
      <body className="antialiased" style={{ fontFamily: 'var(--font-brand)' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <Toaster position="top-center" />
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

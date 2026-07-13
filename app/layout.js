import "@/app/globals.css";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import site from "@/app/data/site";
import { ToastProvider } from "@/app/components/Toast";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata = {
  title: `${site.title} — ${site.tagline}`,
  description: site.description,
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png" }],
  },
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

// Avoid FOUC when reading stored theme
const themeScript = `(function(){try{var t=localStorage.getItem('prompt-vault-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${serif.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ToastProvider>
          {children}
          <GoogleAnalytics gaId="G-LTEPXS1CXE" />
          <SpeedInsights />
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  );
}

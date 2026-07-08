import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from '../theme/ThemeRegistry';

export const metadata: Metadata = {
  title: "KanjiJidai",
  description: "Kanji learning website",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "./providers";
import { ThemeScript } from "./theme-script";
import { lightTheme } from "@/styles/theme.css";

export const metadata: Metadata = {
  title: "캐디하루",
  description: "캐디를 위한 간편한 개인 수입 장부",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={lightTheme} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

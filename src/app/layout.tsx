import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/PwaRegister";
import { NativeShellInit } from "@/components/NativeShellInit";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prism Finance — AI Personal Finance",
  description:
    "Premium liquid-glass personal finance tracker with AI insights, budgeting, and savings goals.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Prism Finance",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#05060a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <PwaRegister />
        <NativeShellInit />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GUNDA — Athletic Intelligence",
  description: "Zimbabwe Athletic Load Monitoring System",
  manifest: "/manifest.webmanifest",
  themeColor: "#d4a017",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GUNDA",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Courier+Prime:wght@400;700&family=Black+Han+Sans&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

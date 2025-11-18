import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Google Forms Filler",
  description: "Automatically fill out Google Forms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

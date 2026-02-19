import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Markd — Smart Bookmark Manager",
  description:
    "A private, real-time bookmark manager. Save links. Access them anywhere. Syncs instantly across tabs.",
  openGraph: {
    title: "Markd",
    description: "Your private, real-time bookmark manager",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

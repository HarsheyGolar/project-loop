import type { Metadata } from "next";
// The CSS file is handled by Next.js and has no TypeScript declarations.
// @ts-ignore -- intentional side-effect import for global styles
import "./globals.css";

export const metadata: Metadata = {
  title: "Project LOOP",
  description: "AI Customer Feedback Intelligence Platform",
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
import type { Metadata } from "next";
import "./globals.css";
import "./loop-dashboard.css";

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

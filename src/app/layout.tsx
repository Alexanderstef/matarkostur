import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matarkostur - Meal Prep Cost Tracker",
  description: "Compare Eldum Rétt meal kit costs vs buying ingredients at the store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="is">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Guitar Tabs App 🎸',
  description: 'חפש שיר ב-YouTube וקבל טאב לגיטרה קלאסית | Next.js 15',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-950 text-white min-h-screen antialiased">{children}</body>
    </html>
  );
}

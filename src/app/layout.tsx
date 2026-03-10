import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scrabble — Word Game',
  description: 'Play Scrabble against an AI opponent. Built with Next.js, TypeScript & Tailwind CSS.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0a1628]">
        {children}
      </body>
    </html>
  );
}

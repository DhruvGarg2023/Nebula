import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nexus Code — Enterprise Real-Time Collaborative IDE & AI Code Review Platform',
  description:
    'Production-grade collaborative code editor with real-time multi-user cursor sync, Judge0 execution engine, AI code audit, and seamless GitHub integration.',
  keywords: [
    'collaborative editor',
    'realtime code editor',
    'judge0 execution',
    'AI code review',
    'monaco editor',
    'developer tools',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080c14] text-slate-100 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

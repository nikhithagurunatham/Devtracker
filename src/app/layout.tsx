import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevTrack AI — Personal Developer Learning, Prep & ATS Operating System',
  description:
    'All-in-one personal operating system for software developers: complete DSA roadmap, pattern tracking, full CRUD task manager, ATS job application pipeline, spaced repetition, Pomodoro focus timer, and DevMentor AI.',
  keywords: [
    'developer tracker',
    'DSA roadmap',
    'FAANG interview prep',
    'SDE-1',
    'spaced repetition',
    'ATS tracker',
    'developer productivity',
  ],
};

import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/Toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import { RoleProvider } from '@/lib/role-context';
import { AppShell } from '@/components/layout/app-shell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'We Connect – Industrial Subcontracting Portal',
  description: 'Keep every part on track for assembly — Deccan Boilers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-[#F6F7F9] text-[#111827] selection:bg-[#F97316]/20 selection:text-[#F97316]">
        <Suspense fallback={<div className="min-h-screen bg-[#0F1B33]" />}>
          <RoleProvider>
            <AppShell>{children}</AppShell>
          </RoleProvider>
        </Suspense>
      </body>
    </html>
  );
}

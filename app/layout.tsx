import './globals.css'
import type { Metadata, Viewport } from 'next'
import Navbar from "@/components/Navbar";
import Providers from './providers';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '微信公众号AI助手',
  description: '基于AI的微信公众号推文生成和发布工具'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-0 mt-[var(--navbar-height)]">
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
              {children}
            </Suspense>
          </main>
        </Providers>
      </body>
    </html>
  )
}

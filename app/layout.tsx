import './globals.css'
import type { Metadata } from 'next'
import Navbar from "@/components/Navbar";
import Providers from './providers';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '微信公众号AI助手',
  description: '基于AI的微信公众号推文生成和发布工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className="overflow-x-hidden">
        <Providers>
          <Navbar />
          <main className="min-h-screen">
            <Suspense fallback={<div className="pt-16 page-container">Loading...</div>}>
              {children}
            </Suspense>
          </main>
        </Providers>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Anuphan, Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-thai',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-eng',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TIBA - สมาคมนายหน้าประกันภัยไทย',
  description: 'Thai Insurance Brokers Association — ศูนย์รวมหลักสูตรฝึกอบรมด้านประกันภัย',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={`${anuphan.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

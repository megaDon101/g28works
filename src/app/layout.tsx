import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'G28 Works — CNC Tooling Advisor',
  description: 'AI-powered CNC tooling recommendations. Tell us your machine, material and operation — get ranked tool suggestions from top manufacturers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

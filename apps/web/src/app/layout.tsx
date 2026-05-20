import "./globals.css"

import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { AuthProvider } from "@/features/auth/AuthProvider"
import { Header } from "@/features/header"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "KindaSeen | Personal Media Repository & Log",
  description: `A full-stack, AI-ready personal media repository designed to help you track, log,
                and never forget the movies, TV shows, and content you have consumed.`,
  keywords: ["Media Tracker", "Movie Log", "KindaSeen", "Personal Repository", "AI Recommendation"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

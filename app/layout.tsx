import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AIChatBot } from "@/components/ai-chat-bot"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { EnhancedAuthProvider } from "@/components/enhanced-auth-provider"
import { generateMetadata } from "@/lib/utils/seo"
import { defaultSEO } from "@/lib/utils/seo"
import { LoadingProvider } from "@/components/loading-provider"
import { SessionStatusIndicator } from "@/components/session-status-indicator"
import { SessionProviderWrapper } from "@/components/providers/session-provider-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = generateMetadata(defaultSEO)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <LoadingProvider>
              <SessionProviderWrapper>
                <EnhancedAuthProvider>
                  <div className="relative flex min-h-screen flex-col">
                    <SiteHeader />
                    <main className="flex-1">{children}</main>
                    <SiteFooter />
                  </div>
                  <AIChatBot />
                  <SessionStatusIndicator />
                  <Toaster />
                </EnhancedAuthProvider>
              </SessionProviderWrapper>
            </LoadingProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

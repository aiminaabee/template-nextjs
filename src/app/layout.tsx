import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <main className="relative">{props.children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

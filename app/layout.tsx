import Providers from "./(components)/Provider"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'My Clean App',
  description: 'An Uber for Trash',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      
              <body><Providers>
                {children}
               </Providers> </body>

      
    </html>
  )
}

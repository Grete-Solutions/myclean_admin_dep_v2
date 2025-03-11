import { Toaster } from "@/components/ui/sonner"
import '../globals.css'
export default function LoginLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        
        <body
          className={`antialiased`}
        ><Toaster/>
                    {children}
        </body>
      </html>
    );
  }
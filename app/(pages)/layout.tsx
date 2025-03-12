import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Sidebar from "../(components)/Sidebar";
import Navbar from "../(components)/Navbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageWrapper from "../(components)/pagewrapper";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex h-screen antialiased`}
      >
        <Sidebar/>
        <main className="flex flex-col  w-full h-full max-h-screen overflow-hidden">
        <Navbar/>
          <ScrollArea  className="h-full ">
          <PageWrapper>{children}</PageWrapper>
          </ScrollArea>
        </main>    
      </body>          
    </html>
  );
}

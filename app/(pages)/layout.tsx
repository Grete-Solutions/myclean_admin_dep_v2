import "../globals.css";
import Sidebar from "../(components)/Sidebar";
import Navbar from "../(components)/Navbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageWrapper from "../(components)/pagewrapper";



export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar/>
      <main className="flex flex-col  w-full h-full max-h-screen overflow-hidden">
      <Navbar/>
        <ScrollArea  className="h-full ">
        <PageWrapper>{children}</PageWrapper>
        </ScrollArea>
      </main>
    </>
  );
}

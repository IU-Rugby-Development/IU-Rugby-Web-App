import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/navigation/nav-bar";

export const metadata: Metadata = {
  title: "IU Rugby",
  description: "Official web application for IU Men's Rugby and Friends of Hoosier Rugby.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <NavBar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

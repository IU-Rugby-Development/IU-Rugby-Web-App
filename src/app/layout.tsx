import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/navigation/nav-bar";

export const metadata: Metadata = {
  title: "IU Rugby",
  description: "Official web application for IU Men's Rugby and Friends of Hoosier Rugby.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <NavBar />
        <main id="main-content" className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 bg-stone-50 px-4 py-8 text-sm text-stone-600">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3">
            <p>IU Men&apos;s Rugby · Friends of Hoosier Rugby</p>
            <a href="https://www.iurugby.com/" className="underline underline-offset-4">Visit the current IU Rugby website</a>
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
  title: "jiD design studio - Portfolio",
  description: "Innovative UI/UX, Branding & Web Design Portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col pt-[44px]">
        <GNB />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

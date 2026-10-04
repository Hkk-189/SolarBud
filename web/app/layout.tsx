import type { Metadata } from "next";
import { Footer } from "@/components/shell/footer";
import { Header } from "@/components/shell/header";
import { Sidebar } from "@/components/shell/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolarBud",
  description: "Geomagnetic storm forecasts and alerts. Not an official forecast.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Sidebar />
        <Header />
        <div className="ml-16 pt-16 md:ml-64">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1400px] flex-col px-4 py-6 md:px-8">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}

import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopMenuDesktop } from "@/app/navmenu";
import FileHandler from '@tiptap-pro/extension-file-handler'
import Image from '@tiptap/extension-image'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { Construction } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });
const maintenanceMode = process.env.UNDER_MAINTENANCE === 'true'
export const metadata: Metadata = {
  title: "Kite",
  description: "Kite Booth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <TopMenuDesktop />
          {maintenanceMode ? (
            <div className="flex justify-center items-center mt-20">
              <h1 className="text-2xl font-bold flex flex-col items-center gap-4">
                <Construction className="w-12 h-12" />
                서비스 점검 중
              </h1>
            </div>
          ) : (
            <>
              {children}
            </>
          )}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>

      </body>
    </html>
  );
}

import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next";
import "./globals.css";
import { TopMenuDesktop } from "@/app/navmenu";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster"
import UserStateProvider from "@/providers";
import Footer from "@/app/footer";

const Pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
  weight: "45 920"
})

export const metadata: Metadata = {
  title: "Kite",
  description: "부스 인포 모음",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <html lang="ko" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </head>
        <body className={Pretendard.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <UserStateProvider>
              <TopMenuDesktop />
              <main className="flex flex-col min-h-screen">
                {children}
              </main>

              <Toaster />
              <footer className="footer">
                <Footer />
              </footer>
            </UserStateProvider>
          </ThemeProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </>
  );
}


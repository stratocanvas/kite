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
  description: "동인 행사 부스 인포들을 한 곳에. 캐릭터로 부스를 찾고, 마음에 드는 부스를 북마크에 추가해 보세요.",
  icons: {
    icon: [
      {
        rel: 'icon',
        type: 'image/png',
        url: '/icon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        rel: 'icon',
        type: 'image/png',
        url: '/icon2.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        rel: 'apple-icon',
        type: 'image/png',
        url: '/apple-touch-icon.png',
      },
      {
        rel: 'apple-touch-icon',
        type: 'image/png',
        url: '/apple-touch-icon.png',
      },
      {
        rel: 'shortcut icon',
        type: 'image/png',
        url: '/apple-touch-icon.png'
      }
    ],
  },
  openGraph: {
    title: 'Kite',
    description: '동인 행사 부스 정보, Kite에서 한 눈에.',
    images: ['https://www.kitebooth.com/og-static.png'],
    url: 'https://www.kitebooth.com',
    type: 'website',
    siteName: 'Kite',
    locale: 'ko_KR',

  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <html lang="ko" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
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


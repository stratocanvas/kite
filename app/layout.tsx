import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next";
import "./globals.css";
import { TopMenuDesktop } from "@/app/navmenu";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster"
import UserStateProvider from "@/providers";
import Footer from "@/app/footer";
import { GoogleAnalytics } from '@next/third-parties/google'
import { GoogleTagManager } from '@next/third-parties/google'

const Pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
  weight: "45 920"
})

export const viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Kite",
  description: "동인 행사 부스 인포들을 한 곳에. 캐릭터로 부스를 찾고, 마음에 드는 부스를 북마크에 추가해 보세요.",
  icons: {
    icon: [
      {
        rel: 'icon',
        type: 'image/png',
        url: '/favicon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        url: '/icon.png',
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
        rel: 'apple-touch-icon-precomposed',
        type: 'image/png',
        url: '/apple-touch-icon-precomposed.png',
      },
      {
        rel: 'shortcut icon',
        type: 'image/png',
        url: '/apple-touch-icon.png',
      },
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
          <script defer src="https://ua.kitebooth.com/script.js" data-website-id="236c4145-a65e-4aba-a3c6-22b4b648339c"/>
        </head>
        <body className={Pretendard.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <UserStateProvider>
<h2 className="p-2 font-bold text-md text-center bg-blue-500">공지 기능 테스트 중</h2>
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
        </body>
      </html>
    </>
  );
}


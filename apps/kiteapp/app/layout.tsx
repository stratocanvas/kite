import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "@/app/globals.css";
import { TopMenuDesktop } from "@/components/navmenu/navmenuLayout";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/app/footer";
import ConsoleWarning from "@/components/consoleWarning";

const Pretendard = localFont({
	src: "./fonts/PretendardVariable.woff2",
	display: "swap",
	variable: "--font-pretendard",
	weight: "45 920",
});

export const viewport = {
	themeColor: "#ffffff",
};

export const metadata: Metadata = {
	title: "Kite",
	description: "동인 행사 플랫폼",
	icons: {
		icon: [
			{
				rel: "icon",
				type: "image/png",
				url: "/favicon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				url: "/icon.png",
			},
			{
				rel: "apple-icon",
				type: "image/png",
				url: "/apple-touch-icon.png",
			},
			{
				rel: "apple-touch-icon",
				type: "image/png",
				url: "/apple-touch-icon.png",
			},
			{
				rel: "apple-touch-icon-precomposed",
				type: "image/png",
				url: "/apple-touch-icon-precomposed.png",
			},
			{
				rel: "shortcut icon",
				type: "image/png",
				url: "/apple-touch-icon.png",
			},
		],
	},
	openGraph: {
		title: "Kite",
		description: "동인 행사 플랫폼",
		images: ["https://www.kitebooth.com/og-static.png"],
		url: "https://www.kitebooth.com",
		type: "website",
		siteName: "Kite",
		locale: "ko_KR",
	},
};
export default function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<>
			<html lang="ko" suppressHydrationWarning>
				<head>
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<script
						defer
						src="https://ua.kitebooth.com/script.js"
						data-website-id="236c4145-a65e-4aba-a3c6-22b4b648339c"
					/>
				</head>
				<body className={Pretendard.className}>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<TopMenuDesktop />
						<main className="flex flex-col min-h-screen">{children}</main>
						<ConsoleWarning />
						<Toaster />
						<footer className="footer">
							<Footer />
						</footer>
					</ThemeProvider>
				</body>
			</html>
		</>
	);
}

import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import ConsoleWarning from "@/components/warning";
import { cookies } from "next/headers";
import { SessionProvider } from "next-auth/react";

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
	title: "Kite 계정",
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
};
export default async function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<>
			<html lang="ko">
				<head>
					<meta name="viewport" content="width=device-width, initial-scale=1" />
				</head>
				<SessionProvider>
					<body className={Pretendard.className}>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>		
							<main className="flex flex-col min-h-screen">{children}</main>
							<ConsoleWarning />
							<Toaster className={Pretendard.className} />
						</ThemeProvider>
					</body>
				</SessionProvider>
			</html>
		</>
	);
}

import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
	if (!req.auth && req.nextUrl.pathname === "/dashboard") {
		return Response.redirect(new URL("/", req.nextUrl.origin));
	}

	const redirectPaths = {
		"/handshake": "/dashboard",
		"/": "/dashboard",
	};

	const currentPath = req.nextUrl.pathname;
	if (currentPath === "/handshake" || (req.auth && currentPath === "/")) {
		const next = req.nextUrl.searchParams.get("next");
		if (next) {
			const decodedNext = decodeURIComponent(next);

			// URL 유효성 검증
			try {
				const url = new URL(decodedNext);
				if (
					url.hostname.endsWith(process.env.NEXT_PUBLIC_BASE_URL || "localhost")
				) {
					return NextResponse.redirect(new URL(decodedNext, req.url));
				}
			} catch (error) {
				console.error("Invalid URL:", error);
			}
			// 유효하지 않은 URL이거나 지정된 URL로 끝나지 않는 경우
			return NextResponse.redirect(new URL("/", req.url));
		}
		return NextResponse.redirect(new URL(redirectPaths[currentPath], req.url));
	}

	return NextResponse.next();
});
export const config = {
	matcher: [
		"/",
		"/dashboard",
		"/handshake",
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};

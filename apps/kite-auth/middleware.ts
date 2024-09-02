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

		const service = req.nextUrl.searchParams.get("service");
		if (next && service) {
			try {
				const decodedNext = decodeURIComponent(next);
				const decodedService = decodeURIComponent(service);
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000";
				const protocol = baseUrl.includes("localhost") ? "http" : "https";
				const fullUrl = new URL(
					decodedNext,
					`${protocol}://${
						decodedService === "kite" ? baseUrl : `${decodedService}.${baseUrl}`
					}`,
				);
				return NextResponse.redirect(fullUrl);
			} catch (error) {
				console.error("Invalid URL:", error);
			}
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

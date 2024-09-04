import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export default auth((req) => {
	console.log("middleware");
	const currentUrl = req.nextUrl.pathname;

	const signInUrl = new URL(
		process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001",
	);

	const protectedRoutes = [
		"/write/add",
		"/dashboard",
		"/api/cart",
		"/api/bookmark",
	];

	if (
		!req.auth &&
		protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
	) {
		signInUrl.searchParams.set("next", currentUrl);
		signInUrl.searchParams.set("service", "kite");
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
});
export const config = {
	matcher: [
		"/",
		"/write/add",
		"/dashboard",
		"/api/cart",
		"/api/bookmark",
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		"/((?!\\/$|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};

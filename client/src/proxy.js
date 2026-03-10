import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/accessall"];
const AUTH_ROUTES = ["/signin", "/signup"];

export function proxy(request) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get("token")?.value;

	const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
	const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

	if (isProtected && !token) {
		const url = request.nextUrl.clone();
		url.pathname = "/signin";
		url.searchParams.set("from", pathname);
		return NextResponse.redirect(url);
	}

	if (isAuthRoute && token) {
		const url = request.nextUrl.clone();
		url.pathname = "/dashboard";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/accessall/:path*", "/signin", "/signup"],
};

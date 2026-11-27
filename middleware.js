import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

const ROLE_HOME = {
  super_admin: "/admin/dashboard",
  clinic_admin: "/admin/dashboard",
  doctor: "/doctor/dashboard",
  receptionist: "/admin/appointments",
  rehab_staff: "/admin/exercises",
  accountant: "/admin/billing",
  patient: "/patient/dashboard",
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await verifySessionToken(token) : null;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedPanel =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/doctor") ||
    pathname.startsWith("/patient");

  if (isAuthPage && user?.role) {
    const dest = ROLE_HOME[user.role] || "/login";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (isProtectedPanel && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    if (pathname.startsWith("/patient") && user.role !== "patient") {
      return NextResponse.redirect(
        new URL(ROLE_HOME[user.role] || "/login", request.url)
      );
    }
    if (
      pathname.startsWith("/doctor") &&
      !["doctor", "super_admin", "clinic_admin"].includes(user.role)
    ) {
      return NextResponse.redirect(
        new URL(ROLE_HOME[user.role] || "/login", request.url)
      );
    }
    if (pathname.startsWith("/admin") && user.role === "patient") {
      return NextResponse.redirect(new URL("/patient/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/doctor/:path*",
    "/patient/:path*",
    "/login",
    "/register",
  ],
};

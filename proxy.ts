import { NextResponse } from "next/server"

import { auth } from "@/auth"

const PUBLIC_PATHS = new Set(["/sign-in"])

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.has(pathname)) {
    if (req.auth) {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin))
    }
    return NextResponse.next()
  }

  if (!req.auth) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin)
    if (pathname !== "/") {
      signInUrl.searchParams.set("callbackUrl", pathname)
    }
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

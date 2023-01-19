import { getSession, TOKEN_NAME } from "lib/auth.lib"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(TOKEN_NAME)?.value
  const session = await getSession(token)
  const userId = session?.user_id
  const { pathname } = req.nextUrl

  if (pathname.includes("/static")) return NextResponse.next()

  if (!userId) {
    if (pathname.startsWith("/login") || pathname.startsWith("/api/login"))
      return NextResponse.next()

    const url = req.nextUrl.clone()
    url.searchParams.set("from", url.pathname)
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/login") || pathname.startsWith("/api/login")) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

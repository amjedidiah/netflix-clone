import type { NextApiRequest, NextApiResponse } from "next"
import { jwtVerify, SignJWT } from "jose"
import { nanoid } from "nanoid"
import { parse, serialize } from "cookie"

interface UserJwtPayload {
  jti: string
  iat: number
  ["https://hasura.io/jwt/claims"]?: {
    "x-hasura-allowed-roles": string[]
    "x-hasura-default-role": string
    "x-hasura-user-id": string
  }
}

const JWT_SECRET_KEY: string | undefined = process.env.JWT_SECRET_KEY!

export const TOKEN_NAME = "discover-videos-magic-token"

const MAX_AGE_HOURS = 24 // 24 hours

const MAX_AGE = 60 * 60 * MAX_AGE_HOURS // 24 hours

const getJwtSecretKey = () => {
  if (!JWT_SECRET_KEY || JWT_SECRET_KEY.length === 0)
    throw new Error("The environment variable JWT_SECRET_KEY is not set.")

  return JWT_SECRET_KEY
}

const parseCookies = (req: NextApiRequest) => {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie
  return parse(cookie || "")
}

const getTokenCookie = (req: NextApiRequest) => {
  const cookies = parseCookies(req)
  return cookies[TOKEN_NAME]
}

export const verifyAuth = async (req: NextApiRequest) => {
  try {
    const token = getTokenCookie(req)
    if (!token) return

    return await getSession(token)
  } catch (error) {
    console.error({ error })
    return
  }
}

export const getSession = async (token?: string) => {
  try {
    if (!token) return

    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    )

    if (!verified?.payload) throw new Error("Invalid token")

    const session = verified.payload as UserJwtPayload

    const data = {
      user_id: session?.["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"],
      token,
    }

    return data
  } catch (error) {
    console.error({ error })
    return
  }
}

export const generateToken = async (issuer: string) => {
  const token = await new SignJWT({
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": ["user"],
      "x-hasura-default-role": "user",
      "x-hasura-user-id": issuer,
    },
  })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_HOURS}h`)
    .sign(new TextEncoder().encode(getJwtSecretKey()))

  return token
}

export async function setUserCookie(res: NextApiResponse, token: string) {
  const cookie = serialize(TOKEN_NAME, token, {
    httpOnly: true,
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + MAX_AGE * 1000),
    path: "/",
  })

  res.setHeader("Set-Cookie", cookie)
}

export const expireUserCookie = (res: NextApiResponse) => {
  const cookie = serialize(TOKEN_NAME, "", {
    maxAge: -1,
    path: "/",
  })

  res.setHeader("Set-Cookie", cookie)
}

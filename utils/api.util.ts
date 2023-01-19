import { NextResponse } from "next/server"

type JSONResponseType<T> = {
  status: number
  data: T
  init?: ResponseInit
}

export function jsonResponse<P>({ status, data, init }: JSONResponseType<P>) {
  return new NextResponse(JSON.stringify(data), {
    ...init,
    status,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
    },
  })
}

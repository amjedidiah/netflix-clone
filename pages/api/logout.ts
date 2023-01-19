import { magicSecret as magic } from "lib/magic.lib"
import { expireUserCookie, verifyAuth } from "lib/auth.lib"
import type { NextApiResponse, NextApiRequest } from "next"

export default async function logout(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET")
      throw (new Error("Method not allowed"), { status: 405 })

    const session = await verifyAuth(req)

    await magic.users.logoutByIssuer(session?.user_id as string)
    await expireUserCookie(res)
  } catch (error) {
    console.error({ error })
    if (error instanceof Error)
      res.status(error.status || 500).end(error.message)
  } finally {
    res.writeHead(302, { Location: "/" })
    res.end()
  }
}

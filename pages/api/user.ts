import { verifyAuth } from "lib/auth.lib"
import { getUser } from "lib/hasura.lib"
import { fetchWatchedVideos } from "lib/videos.lib"
import type { NextApiResponse, NextApiRequest } from "next"

export default async function logout(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET")
      throw (new Error("Method not allowed"), { status: 405 })

    const session = await verifyAuth(req)
    const user_id = session?.user_id as string
    const token = session?.token as string

    const [userObject, watched] = await Promise.all([
      getUser(user_id, token),
      fetchWatchedVideos(user_id, token),
    ])

    const user = userObject?.data?.users[0]
    const userWithWatched = { ...user, watched }

    res.status(200).json({ userWithWatched })
  } catch (error) {
    console.error({ error })
    if (error instanceof Error)
      res.status(error.status || 500).end(error.message)
  }
}

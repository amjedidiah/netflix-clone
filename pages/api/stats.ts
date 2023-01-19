import { verifyAuth } from "lib/auth.lib"
import {
  getVideoStat,
  HasuraVideoStat,
  insertVideoStat,
  updateVideoStat,
} from "lib/hasura.lib"
import type { NextApiResponse, NextApiRequest } from "next"

export default async function logout(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const isGet = req.method === "GET"
    const isPost = req.method === "POST"
    const isPatch = req.method === "PATCH"
    if (!(isGet || isPost || isPatch))
      throw (new Error("Method not allowed"), { status: 405 })

    // Get issuer
    const session = await verifyAuth(req)
    const user_id = session?.user_id as string
    const token = session?.token as string

    // Get videoId
    const { video_id } = isGet ? req.query : req.body
    if (!video_id) throw (new Error("Missing video_id"), { status: 400 })

    const { data } = await getVideoStat({ user_id, video_id }, token)
    const videoStat = data?.stats[0]

    if (isPatch && !videoStat)
      throw (new Error("Video stat does not exist"), { status: 404 })

    if (isGet) return res.status(200).json({ videoStat })

    const { favourited } = req.body

    let resp
    let updatedVideo

    if (isPatch) {
      resp = await updateVideoStat({ favourited, user_id, video_id }, token)
      updatedVideo = resp?.data.update_stats.returning[0]
    } else {
      resp = await insertVideoStat({ favourited, user_id, video_id }, token)
      updatedVideo = resp?.data.insert_stats.returning[0] as HasuraVideoStat
    }

    if (!(resp?.data && updatedVideo))
      throw (
        (new Error(`Failed to ${isPatch ? "update" : "create"} video stats`),
        { status: 500 })
      )
    return res.status(200).json({ videoStat: updatedVideo })
  } catch (error) {
    console.error({ error })
    if (error instanceof Error)
      res.status(error.status || 500).end(error.message)
  }
}

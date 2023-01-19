import videoTestData from "data/videos.json"
import { getWatchedVideos, HasuraVideoStat } from "lib/hasura.lib"
import {
  decodeFavourited,
  favouritedIsNone,
  formatCount,
  formatPublishTime,
  formatVideo,
  getVideoId,
} from "utils/video.util"

export type Video = {
  id: string
  title?: string
  imgUrl: string
  subTitle?: string
}

export interface IVideo extends Video {
  description: string
  channelTitle: string
  publishTime: string
  viewCount: string
}

type VideoData = {
  items: VideoDataItem[]
  error?: {
    message: string
  }
}

export type VideoDataItem = {
  id: {
    videoId: string
  }
  snippet: {
    title: string
    thumbnails: {
      high: {
        url: string
      }
    }
    description: string
    channelTitle: string
    publishedAt: string
  }
  statistics: {
    viewCount: string
  }
}

const getVideoItems = async (search?: string, limit?: number) => {
  if (process.env.NODE_ENV === "development" || limit)
    return videoTestData.items

  try {
    const URI = !search
      ? "/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&regionCode=NG"
      : `/search?part=snippet&q=${search}&type=video`
    // Fetch from YouTube API
    const { error, items } = (await fetch(
      `https://youtube.googleapis.com/youtube/v3${URI}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&maxResults=25`
    ).then((res) => res.json())) as VideoData

    if (error) throw new Error(error.message)

    return items as VideoData["items"]
  } catch (error) {
    console.error({ error })
    return
  }
}

export async function getVideos(search?: string) {
  const items = await getVideoItems(search)

  if (!items) return
  return items.map(formatVideo)
}

export async function getVideo(id: string) {
  if (!id) return
  try {
    const { error, items } = (await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${id}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
    ).then((res) => res.json())) as VideoData

    if (error) throw new Error(error.message)

    const video = items[0]

    if (!video) return
    return {
      id: video.id?.videoId || video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      imgUrl: `https://i.ytimg.com/vi/${
        video.id?.videoId || video.id
      }/maxresdefault.jpg`,
      channelTitle: video.snippet.channelTitle,
      publishTime: formatPublishTime(video.snippet.publishedAt),
      viewCount: formatCount(video.statistics?.viewCount),
    } as IVideo
  } catch (error) {
    console.error({ error })
    return
  }
}

export const getBannerVideo = async () => {
  const randomNum = Math.floor(Math.random() * 25)
  const items = await getVideoItems()

  if (!items) return
  const randomVideo = items[randomNum]

  if (!randomVideo) return
  return formatVideo(randomVideo as VideoDataItem)
}

export const getStaticVideoIds = async (limit: number) => {
  const items = await getVideoItems(undefined, limit)

  if (!items) return
  return items.slice(0, limit).map(getVideoId)
}

export const getFavourited = async (id: string) => {
  if (!id) return

  try {
    const { videoStat }: { videoStat?: HasuraVideoStat } = await fetch(
      `/api/stats?video_id=${id}`
    ).then((res) => res.json())

    return videoStat?.favourited
  } catch (error) {
    console.error({ error })
    return
  }
}

export const updateFavourited = async ({
  newFavourited,
  favourited,
  video_id,
}: Pick<HasuraVideoStat, "favourited" | "video_id"> & {
  newFavourited: HasuraVideoStat["favourited"]
}) => {
  if (!(video_id && favourited && newFavourited)) return

  try {
    const method = favouritedIsNone(favourited) ? "POST" : "PATCH"

    const { videoStat }: { videoStat?: HasuraVideoStat } = await fetch(
      "/api/stats",
      {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_id,
          favourited: newFavourited,
        }),
      }
    ).then((res) => res.json())

    return videoStat?.favourited
  } catch (error) {
    console.error({ error })
    return
  }
}

export const fetchWatchedVideos = async (user_id: string, token: string) => {
  if (!(user_id && token)) return []

  try {
    const { data, errors } = await getWatchedVideos(user_id, token)

    if (!data.stats?.length) throw new Error(errors?.[0]?.message)

    return data.stats.map((stat) => ({
      id: stat.video_id,
      imgUrl: `https://i.ytimg.com/vi/${stat.video_id}/maxresdefault.jpg`,
      liked: decodeFavourited(stat.favourited),
    }))
  } catch (error) {
    console.error({ error })
    return []
  }
}

import { Video, VideoDataItem } from "lib/videos.lib"
import videoTestData from "data/videos.json"
import { HasuraVideoStat } from "lib/hasura.lib"

export const formatCount = (count: string) => {
  const num = Number(count)
  if (num > 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num > 1000) return `${(num / 1000).toFixed(1)}K`
  return count
}

export const formatPublishTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const diffYears = Math.floor(diff / (1000 * 3600 * 24 * 365))
  const diffMonths = Math.floor(diff / (1000 * 3600 * 24 * 30))
  const diffWeeks = Math.floor(diff / (1000 * 3600 * 24 * 7))
  const diffDays = Math.floor(diff / (1000 * 3600 * 24))
  const diffHours = Math.floor(diff / (1000 * 3600))
  const diffMinutes = Math.floor(diff / (1000 * 60))
  const diffSeconds = Math.floor(diff / 1000)

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`
  if (diffMonths > 0)
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffMinutes > 0)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
  if (diffSeconds > 0)
    return `${diffSeconds} second${diffSeconds > 1 ? "s" : ""} ago`
  return "Just now"
}

export const getVideoId = (
  video: (typeof videoTestData.items)[0] | VideoDataItem
) => (video?.id?.videoId || video?.id) as string

export const formatVideo = (
  video: (typeof videoTestData.items)[0] | VideoDataItem
): Video => ({
  id: getVideoId(video),
  title: video?.snippet?.title,
  imgUrl: `https://i.ytimg.com/vi/${getVideoId(video)}/maxresdefault.jpg`,
  subTitle: video?.snippet?.channelTitle,
})

export const favouritedIsNone = (favourited: HasuraVideoStat["favourited"]) =>
  favourited === "none"

export const encodeIsFavourited = (
  isFavourited: boolean
): HasuraVideoStat["favourited"] => (isFavourited ? "liked" : "disliked")

export const decodeFavourited = (favourited: HasuraVideoStat["favourited"]) =>
  ({
    liked: true,
    disliked: false,
    none: undefined,
  }[favourited])

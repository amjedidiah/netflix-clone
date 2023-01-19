import { VideoProps } from "components/video"
import { HasuraVideoStat } from "lib/hasura.lib"
import { getFavourited, getVideo, updateFavourited } from "lib/videos.lib"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { decodeFavourited, encodeIsFavourited } from "utils/video.util"

export default function useVideo({
  video: initialVideo,
  fallbackId,
}: VideoProps) {
  const router = useRouter()
  const isHome = useMemo(() => router.pathname === "/", [router.pathname])
  const [video, setVideo] = useState(initialVideo)
  const [favourited, setFavourited] =
    useState<HasuraVideoStat["favourited"]>("none")
  const liked = useMemo(() => decodeFavourited(favourited), [favourited])

  const handleFavourited = useCallback(
    async (isFavourited: boolean) => {
      const oldFavourited = favourited
      const newFavourited = encodeIsFavourited(isFavourited)
      if (!video?.id) return

      setFavourited(newFavourited)
      updateFavourited({ newFavourited, favourited, video_id: video.id })
        .then((data) => {
          if (!data) setFavourited(oldFavourited)
        })
        .catch(() => setFavourited(oldFavourited))
    },
    [favourited, video?.id]
  )

  useEffect(() => {
    const fetchVideo = async (videoId: string) => {
      const fetchVideoData = await getVideo(videoId)
      setVideo(fetchVideoData)
    }

    if (fallbackId) fetchVideo(fallbackId)
  }, [fallbackId])

  useEffect(() => {
    const fetchFavourited = async (videoId: string) => {
      const fetchFavouritedData = await getFavourited(videoId)

      if (!fetchFavouritedData) return
      setFavourited(fetchFavouritedData)
    }

    if (video?.id) fetchFavourited(video.id)
  }, [video?.id])

  return { handleFavourited, video, liked, isHome }
}

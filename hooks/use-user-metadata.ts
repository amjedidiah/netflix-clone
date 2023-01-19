import useSWR from "swr"
import { useEffect } from "react"
import router from "next/router"
import { HasuraUser } from "lib/hasura.lib"
import { Video } from "lib/videos.lib"

type MetadataParams = {
  redirectTo?: string
}

type ApiUser = HasuraUser & { watched: Pick<Video, "id" | "imgUrl">[] }

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((data) => ({ user: data?.userWithWatched as ApiUser }))

export default function useUserMetadata({ redirectTo }: MetadataParams = {}) {
  const { data, isLoading } = useSWR("/api/user", fetcher, {
    refreshInterval: 1000,
  })
  const user = data?.user
  const hasUser = Boolean(user)

  useEffect(() => {
    if (!redirectTo || isLoading) return
    if (redirectTo && !hasUser) router.push(redirectTo)
  }, [redirectTo, hasUser, isLoading])

  return { userMetadata: user, isLoading }
}

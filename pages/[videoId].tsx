import { getStaticVideoIds, getVideo, IVideo } from "lib/videos.lib"
import {
  GetStaticPaths,
  GetStaticProps,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next"
import Navbar from "components/navbar"
import Video from "components/video"
import router from "next/router"
import { useEffect } from "react"

export const getStaticProps: GetStaticProps<{
  video?: IVideo | null
}> = async ({ params }: GetStaticPropsContext) => {
  const video = await getVideo(params?.videoId as string)

  return {
    props: {
      video: video || null,
    },
    //Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 second
    revalidate: 10, // In seconds
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const videoIds = await getStaticVideoIds(3)

  const paths = videoIds
    ? videoIds.map((videoId) => ({
        params: { videoId },
      }))
    : []

  return {
    paths,
    fallback: "blocking",
  }
}

export default function VideoId({
  video,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  useEffect(() => {
    if (!video) router.push("/")
  }, [video])

  if (!video) return null

  return (
    <>
      <Navbar />
      <Video video={video} />
    </>
  )
}

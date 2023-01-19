import Navbar from "components/navbar"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import Head from "next/head"
import styles from "styles/my-list.module.scss"
import Section from "components/section"
import { getSession, TOKEN_NAME } from "lib/auth.lib"
import { fetchWatchedVideos, Video } from "lib/videos.lib"

export const getServerSideProps: GetServerSideProps<{
  myListVideos?: Video[] | null
}> = async (context) => {
  let videos = null
  const token = context.req.cookies[TOKEN_NAME]
  const session = await getSession(token)
  const user_id = session?.user_id

  if (token && user_id) {
    const watchedVideos = await fetchWatchedVideos(user_id, token)
    videos = watchedVideos.filter((video) => video.liked)
  }

  return {
    props: {
      myListVideos: videos,
    },
  }
}

export default function MyList({
  myListVideos,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      <Head>
        <title>My List</title>
      </Head>
      <main className={styles.main}>
        <Navbar />
        <div className={styles.sectionWrapper}>
          {myListVideos?.length ? (
            <Section
              title="My List"
              videos={myListVideos}
              size="sm"
              shouldWrap
              shouldScale={false}
            />
          ) : (
            <p>Like videos to have them show here </p>
          )}
        </div>
      </main>
    </div>
  )
}

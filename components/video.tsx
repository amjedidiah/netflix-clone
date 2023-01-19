import { IVideo } from "lib/videos.lib"
import styles from "styles/video.module.scss"
import cls from "classnames"
import Icons from "components/icons/icons"
import useVideo from "hooks/use-video"

export type VideoProps = {
  fallbackId?: string
  video?: IVideo
}

export default function Video(props: VideoProps) {
  const { handleFavourited, video, liked, isHome } = useVideo(props)

  if (!video) return null
  const { title, description, publishTime, channelTitle, viewCount, id } = video

  return (
    <div className={styles[isHome ? "container" : "containerFull"]}>
      <div className={styles["frame-holder"]}>
        <iframe
          id="ytplayer"
          typeof="text/html"
          className={styles[isHome ? "videoPlayer" : "videoPlayerFull"]}
          width="100%"
          height="360"
          src={`https://www.youtube.com/embed/${id}?autoplay=0&origin=http://example.com&controls=0&rel=1`}
          frameBorder="0"
        />
        <Icons liked={liked} onSetLiked={handleFavourited} />
      </div>
      <div className={styles.modalBody}>
        <div
          className={
            styles[isHome ? "modalBodyContent" : "modalBodyContentFull"]
          }
        >
          <div className={isHome ? styles.col1 : ""}>
            <p className={styles.publishTime}>{publishTime}</p>
            <p className={styles.title}>{title}</p>
            <p className={styles.description}>{description}</p>
          </div>
          <div className={styles.col2}>
            <p className={cls(styles.subText, styles.subTextWrapper)}>
              <span className={styles.textColor}>Producer: </span>
              <span className={styles.channelTitle}>{channelTitle}</span>
            </p>
            <p className={cls(styles.subText, styles.subTextWrapper)}>
              <span className={styles.textColor}>View Count: </span>
              <span className={styles.channelTitle}>{viewCount}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

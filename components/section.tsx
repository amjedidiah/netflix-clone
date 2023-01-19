import styles from "styles/section.module.scss"
import Card from "components/card"
import { Video } from "lib/videos.lib"
import cls from "classnames"

type SectionProps = {
  title: string
  videos?: Video[] | null
  size?: "sm" | "md" | "lg"
  shouldWrap?: boolean
  shouldScale?: boolean
}

export default function Section({
  title,
  videos,
  size,
  shouldScale,
  shouldWrap,
}: SectionProps) {
  if (!videos) return null

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div
        className={cls(styles.content, {
          [styles.wrap]: shouldWrap,
        })}
      >
        {videos.map((video, idx) => (
          <Card
            key={video.id}
            count={idx}
            size={size}
            shouldScale={shouldScale}
            {...video}
          />
        ))}
      </div>
    </section>
  )
}

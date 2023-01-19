import Image from "next/image"
import styles from "styles/card.module.scss"
import cls from "classnames"
import { useCallback, useMemo, useState, memo } from "react"
import { motion } from "framer-motion"
import { Video } from "lib/videos.lib"
import Link from "next/link"

interface CardProps extends Pick<Video, "id" | "imgUrl"> {
  size?: "sm" | "md" | "lg"
  count: number
  shouldScale?: boolean
}

const placeholder =
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1340&q=80"

const Card = ({
  imgUrl,
  size = "md",
  count,
  id,
  shouldScale = true,
}: CardProps) => {
  const [stateImgUrl, setStateImgUrl] = useState(imgUrl)

  const handleError = useCallback(() => setStateImgUrl(placeholder), [])

  const scale = useMemo(
    () => (count === 0 ? { scaleY: 1.1 } : { scale: 1.1 }),
    [count]
  )

  const whileHover = useMemo(
    () => (shouldScale ? { whileHover: { ...scale, zIndex: 2 } } : {}),
    [shouldScale, scale]
  )

  const href = useMemo(
    () => (shouldScale ? `/?id=${id}` : `/${id}`),
    [shouldScale, id]
  )

  return (
    <Link href={href} as={`/${id}`} shallow>
      <div className={styles.card}>
        <motion.div
          className={cls(styles[size], styles["img-holder"])}
          {...whileHover}
        >
          <Image
            src={stateImgUrl}
            alt={id}
            className={styles["card-img"]}
            sizes="(max-width: 576px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
            onError={handleError}
            fill
          />
        </motion.div>
      </div>
    </Link>
  )
}

export default memo(Card)

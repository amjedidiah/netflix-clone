import { useCallback, useMemo } from "react"
import styles from "styles/icons.module.scss"
import Dislike from "components/icons/dislike-icon"
import Like from "components/icons/like-icon"

type IconProps = {
  liked?: boolean
  onSetLiked: (liked: boolean) => void
}

export type IconSvgProps = {
  selected?: boolean
}

export default function Icons({ liked, onSetLiked }: IconProps) {
  const disliked = useMemo(() => liked === false, [liked])
  const toggleLike = useCallback(() => onSetLiked(true), [onSetLiked])
  const toggleUnlike = useCallback(() => onSetLiked(false), [onSetLiked])

  return (
    <div className={styles.likeDislikeBtnWrapper}>
      <div className={styles.likeBtnWrapper}>
        <button onClick={toggleLike}>
          <div className={styles.btnWrapper}>
            <Like selected={liked} />
          </div>
        </button>
      </div>
      <button onClick={toggleUnlike}>
        <div className={styles.btnWrapper}>
          <Dislike selected={disliked} />
        </div>
      </button>
    </div>
  )
}

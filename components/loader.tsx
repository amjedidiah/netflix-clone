import styles from "styles/loader.module.scss"

export default function Loader() {
  return (
    <div className={styles.container}>
      <div className={styles.loader}>Loading...</div>
    </div>
  )
}

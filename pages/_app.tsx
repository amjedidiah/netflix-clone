import "styles/globals.scss"
import type { AppProps } from "next/app"
import font from "utils/font.util"
import useRouteChange from "hooks/use-route-change"
import Loader from "components/loader"

export default function App({ Component, pageProps }: AppProps) {
  const showLoader = useRouteChange()

  if (showLoader) return <Loader />
  return (
    <main className={font.className}>
      <Component {...pageProps} />
    </main>
  )
}

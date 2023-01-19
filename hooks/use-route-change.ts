import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"

export default function useRouteChange() {
  const router = useRouter()
  const [isRouteChanging, setIsRouteChanging] = useState(false)

  const handleRouteChangeStart = useCallback(
    (destination: string) => {
      const validDestinations = ["/login", "/"]
      const isValidDestination = validDestinations.includes(destination)
      const isHome = router.pathname === "/"

      if (
        (isHome && router.pathname !== router.asPath) ||
        (isHome && !isValidDestination)
      )
        return
      setIsRouteChanging(true)
    },
    [router.pathname, router.asPath]
  )

  useEffect(() => {
    router.events.on("routeChangeStart", handleRouteChangeStart)
    router.events.on("routeChangeComplete", () => setIsRouteChanging(false))
    router.events.on("routeChangeError", () => setIsRouteChanging(false))

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart)
      router.events.off("routeChangeComplete", () => setIsRouteChanging(false))
      router.events.off("routeChangeError", () => setIsRouteChanging(false))
    }
  }, [router.events, handleRouteChangeStart])

  return isRouteChanging
}

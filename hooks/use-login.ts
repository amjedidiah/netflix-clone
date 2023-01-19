import { useCallback, useEffect, useMemo, useState } from "react"
import { RPCError, RPCErrorCode } from "magic-sdk"
import { useRouter } from "next/router"
import { magicPublishable as magic } from "lib/magic.lib"

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

export default function useLogin() {
  const [email, setEmail] = useState("")
  const [validationMessage, setValidationMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(
    () =>
      setValidationMessage(
        email && !emailRegex.test(email)
          ? "Please enter a valid email address"
          : ""
      ),
    [email]
  )

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  )

  const buttonIsDisabled = useMemo(
    () => validationMessage !== "" || email === "" || loading,
    [validationMessage, email, loading]
  )

  const handleLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (buttonIsDisabled || !magic) return

      try {
        setLoading(true)
        const didToken = await magic.auth.loginWithMagicLink({ email })

        const res = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${didToken}`,
          },
        })

        if (!res.ok) throw new Error(await res.text())

        const pathToRedirectTo = (router.query.from as string) || "/"

        // Head to home
        router.push(pathToRedirectTo)
      } catch (error) {
        console.error({ error })
        if (error instanceof RPCError)
          switch (error.code) {
            case RPCErrorCode.MagicLinkFailedVerification:
            case RPCErrorCode.MagicLinkExpired:
            case RPCErrorCode.MagicLinkRateLimited:
            case RPCErrorCode.UserAlreadyLoggedIn:
              return setValidationMessage(error.message)
          }

        setValidationMessage("Something went wrong. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [buttonIsDisabled, email, router]
  )

  return {
    email,
    handleEmailChange,
    handleLogin,
    buttonIsDisabled,
    validationMessage,
    loading,
  }
}

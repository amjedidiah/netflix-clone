import { magicSecret as magic } from "lib/magic.lib"
import { getUser, insertUser } from "lib/hasura.lib"
import { generateToken, setUserCookie } from "lib/auth.lib"
import { NextApiRequest, NextApiResponse } from "next"

declare global {
  interface Error {
    status?: number
  }
}

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST")
      throw (new Error("Method not allowed"), { status: 405 })
    // Confirm Authorization header is present
    const auth = req.headers.authorization
    if (!auth?.startsWith("Bearer "))
      throw (new Error("Missing Authorization Header"), { status: 401 })

    // Confirm DID Token is present
    const didToken = auth.slice(7)
    if (!didToken) throw (new Error("Missing DID Token"), { status: 401 })

    // Validate DID Token
    const metadata = await magic.users.getMetadataByToken(didToken)

    // Validate issuer
    if (!metadata.issuer) throw (new Error("No issuer"), { status: 401 })

    // Create JWT
    const token = await generateToken(metadata.issuer)

    // Check if user exists
    const { data, errors } = await getUser(metadata.issuer, token)
    if (errors) throw new Error(errors[0].message)
    const userExists = data?.users.length > 0
    if (!userExists) {
      const { email, issuer, publicAddress } = metadata
      const { errors } = await insertUser(
        {
          email,
          issuer,
          publicAddress,
        },
        token
      )
      if (errors) throw new Error(errors[0].message)
    }

    // Set cookie
    setUserCookie(res, token)

    res.status(200).send({ done: true })
  } catch (error) {
    console.error({ error })
    if (error instanceof Error)
      res.status(error.status || 500).end(error.message)
  }
}

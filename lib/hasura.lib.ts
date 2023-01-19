import { MagicUserMetadata } from "@magic-sdk/admin"

export type HasuraUser = {
  id: string
  email: string
  issuer: string
  publicAddress: string
}

export type HasuraVideoStat = {
  id: string
  user_id: string
  video_id: string
  favourited: "liked" | "disliked" | "none"
  watched: boolean
}

type GraphQLResponse<T> = {
  data: T
  errors: {
    message: string
  }[]
}

export default async function queryHasuraGraphQL<T>({
  operationsDoc,
  operationName,
  variables,
  token,
}: {
  operationsDoc: string
  operationName: string
  variables: object
  token: string
}): Promise<GraphQLResponse<T>> {
  const result = await fetch(
    process.env.NEXT_PUBLIC_HASURA_GRAPHQL_API_URL as string,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
    }
  ).then((res) => res.json())

  return result
}

export const getUser = (issuer: string, token: string) =>
  queryHasuraGraphQL<{ users: HasuraUser[] }>({
    operationsDoc: `
      query MyQuery($issuer: String) {
        users(where: {issuer: {_eq: $issuer}}) {
          email
          id
          issuer
          publicAddress
        }
      }
    `,
    operationName: "MyQuery",
    variables: { issuer },
    token,
  })

export const insertUser = (
  {
    email,
    issuer,
    publicAddress,
  }: Pick<MagicUserMetadata, "email" | "issuer" | "publicAddress">,
  token: string
) =>
  queryHasuraGraphQL<{ insert_users_one: HasuraUser }>({
    operationsDoc: `
      mutation MyMutation($email: String!, $issuer: String!, $publicAddress: String!) {
        insert_users_one(object: {email: $email, issuer: $issuer, publicAddress: $publicAddress}) {
          email
        }
      }
    `,
    operationName: "MyMutation",
    variables: {
      email,
      issuer,
      publicAddress,
    },
    token,
  })

export const getVideoStat = (
  { user_id, video_id }: Pick<HasuraVideoStat, "user_id" | "video_id">,
  token: string
) =>
  queryHasuraGraphQL<{ stats: HasuraVideoStat[] }>({
    operationsDoc: `
      query MyQuery($user_id: String!, $video_id: String!) {
        stats(where: {user_id: {_eq: $user_id}, video_id: {_eq: $video_id}}) {
          favourited
          id
          user_id
          video_id
          watched
        }
    }`,
    operationName: "MyQuery",
    variables: {
      user_id,
      video_id,
    },
    token,
  })

export const getWatchedVideos = (user_id: string, token: string) =>
  queryHasuraGraphQL<{
    stats: Pick<HasuraVideoStat, "video_id" | "favourited">[]
  }>({
    operationsDoc: `
      query MyQuery($user_id: String!) {
        stats(where: {user_id: {_eq: $user_id}, watched: {_eq: true}}) {
          video_id
          favourited
        }
    }`,
    operationName: "MyQuery",
    variables: {
      user_id,
    },
    token,
  })

export const insertVideoStat = (
  {
    favourited,
    user_id,
    video_id,
  }: Pick<HasuraVideoStat, "favourited" | "user_id" | "video_id">,
  token: string
) =>
  queryHasuraGraphQL<{ insert_stats: { returning: HasuraVideoStat[] } }>({
    operationsDoc: `mutation MyMutation($favourited: String!, $user_id: String!, $video_id: String!) {
        insert_stats(objects: {favourited: $favourited, user_id: $user_id, video_id: $video_id, watched: true}) {
          returning {
            favourited
            id
            user_id
            video_id
            watched
          }
        }
      }`,
    operationName: "MyMutation",
    variables: {
      favourited,
      user_id,
      video_id,
    },
    token,
  })

export const updateVideoStat = (
  {
    user_id,
    video_id,
    favourited,
  }: Pick<HasuraVideoStat, "user_id" | "video_id" | "favourited">,
  token: string
) =>
  queryHasuraGraphQL<{ update_stats: { returning: HasuraVideoStat[] } }>({
    operationsDoc: `mutation MyMutation($user_id: String!, $video_id: String!, $favourited: String!) {
      update_stats(where: {user_id: {_eq: $user_id}, video_id: {_eq: $video_id}}, _set: {favourited: $favourited, watched: true}) {
        returning {
          favourited
          id
          user_id
          video_id
          watched
        }
      }
    }`,
    operationName: "MyMutation",
    variables: {
      favourited,
      user_id,
      video_id,
    },
    token,
  })

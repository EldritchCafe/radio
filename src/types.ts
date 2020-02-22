export type Track = {
    referer: Referer
    media: Media
}

export type Referer = {
    username: string
    content: string
    date: Date
    credentials: RefererCredentials
}

export type RefererCredentials = Mastodon

export type Mastodon = {
    type: 'mastodon'
    domain: string
    id: string
}

export type Media = {
    title: string
    cover: string
    credentials: MediaCredentials
}

export type MediaCredentials = Youtube

export type Youtube = {
    type: 'youtube'
    id: string
}
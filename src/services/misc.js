import getUrls from 'get-urls'
import { execPipe, asyncFilter, asyncMap, map, take, filter, asyncFlatMap, toArray } from 'iter-tools'
import { share } from '/routes.js'

export const tap = f => x => {
    f(x)
    return x
}

export const defer = () => {
    let resolve
    let reject

    const promise = new Promise((res, rej) => {
        resolve = res
        reject = rej
    })

    return { resolve, reject, promise }
}

export const queue = () => {
    const deferred = defer()
    let promise = deferred.promise

    const enqueue = f => {
        promise = promise.then(tap(f))
        return promise
    }

    return { enqueue, run: deferred.resolve }
}

export const secondsToElapsedTime = (seconds) => {
    const parts = [
        Math.floor(seconds / 3600),
        Math.floor(seconds / 60) % 60,
        Math.floor(seconds) % 60
    ]

    return parts
        .filter((value, index) => value > 0 || index > 0)
        .map(value => value < 10 ? '0' + value : value)
        .join(':')
}

export async function* tracksIterator(refererGenerator, cache) {
    const notKnow = (values) => {
        if (cache.has(values)) {
            console.log(`Drop already processed ${values.join(':')}`)
            return false
        } else {
            cache.add(values)
            return true
        }
    }

    try {
        yield* execPipe(
            refererGenerator,
            asyncFilter(({ credentials: { domain, id } }) => notKnow(['referer', 'mastodon', domain, id])),
            asyncFlatMap(referer => {
                return execPipe(
                    referer.content,
                    getUrls,
                    map(url => {
                        const { hostname, pathname, searchParams } = new URL(url)

                        if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(hostname) && searchParams.has('v')) {
                            return { url, credentials: { type: 'youtube', id: searchParams.get('v') } }
                        } else if (hostname === 'youtu.be') {
                            return { url, credentials: { type: 'youtube', id: pathname.substring(1) } }
                        } else {
                            return null
                        }
                    }),
                    filter(media => media !== null),
                    map(({ url, credentials }) => ({ referer, mediaUrl: url, mediaCredentials: credentials })),
                    take(1),
                    toArray
                )
            }),
            asyncFilter(({ mediaCredentials: { id }}) => notKnow(['media', 'youtube', id])),
            asyncMap(async ({ referer, mediaUrl, mediaCredentials }) => {
                const metadata = await fetchMetadata(mediaCredentials)

                return {
                    shareUrl: `${location.origin}${share.reverse({ domain: referer.credentials.domain, id: referer.credentials.id })}`,
                    referer,
                    media: {
                        title: metadata.title,
                        url: mediaUrl,
                        cover: `https://img.youtube.com/vi/${mediaCredentials.id}/mqdefault.jpg`,
                        credentials: mediaCredentials
                    }
                }
            })
        )
    } finally {
        refererGenerator.return()
    }
}

const fetchMetadata = (credentials) => {
    return fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${credentials.id}`)
        .then(response => response.json())
}
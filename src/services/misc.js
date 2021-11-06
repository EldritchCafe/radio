import { execPipe, asyncFilter, asyncMap } from 'iter-tools'
import { share } from '/src/routes.js'

const intersection = (xs, ys) => xs.filter(x => ys.includes(x))
const difference = (xs, ys) => xs.filter(x => !ys.includes(x))
const symmetricDifference = (xs, ys) => [...difference(xs, ys), ...difference(ys, xs)]


export const mapNullable = (nullable, f) => nullable === null ? nullable : f(nullable)

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

export async function* tracksIterator(partialTrackGenerator, cache) {
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
            partialTrackGenerator,
            asyncFilter(({ referer: { credentials: { domain, id } } }) => notKnow(['referer', 'mastodon', domain, id])),
            asyncFilter(({ partialMedia: { credentials: { id } } }) => notKnow(['media', 'youtube', id])),
            asyncMap(async ({ referer, partialMedia }) => {
                const metadata = await fetchMetadata(partialMedia.credentials)

                return {
                    shareUrl: `${location.origin}${share.reverse({ domain: referer.credentials.domain, id: referer.credentials.id })}`,
                    referer,
                    media: {
                        title: metadata.title,
                        url: partialMedia.url,
                        cover: `https://img.youtube.com/vi/${partialMedia.credentials.id}/mqdefault.jpg`,
                        credentials: partialMedia.credentials
                    }
                }
            })
        )
    } finally {
        partialTrackGenerator.return()
    }
}

const fetchMetadata = (credentials) => {
    return fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${credentials.id}`)
        .then(response => response.json())
}

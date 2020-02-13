import getUrls from 'get-urls'
import { execPipe, asyncFilter, asyncMap } from 'iter-tools'

export const tap = f => x => {
    f(x)
    return x
}

export const queue = () => {
    const deferred = defer()
    let promise = deferred.promise

    const enqueue = f => {
        promise = promise.then(tap(f))
    }

    return { enqueue, run: deferred.resolve }
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

export async function* observableToAsyncIterator(observable) {
    const buffer = [defer()]

    const next = value => {
        buffer[buffer.length - 1].resolve(value)
        buffer.push(defer())
    }

    const complete = value => {
        buffer[buffer.length - 1].resolve(value)
    }

    const error = (error) => {
        buffer[buffer.length - 1].reject(error)
    }

    const subscription = observable.subscribe({ next, error, complete })

    try {
        while (true) {
            const value = await buffer[0].promise
            buffer.shift()

            if (buffer.length) {
                yield value
            } else {
                return value
            }
        }
    } finally {
        subscription.unsubscribe()
    }
}

export function intersection(xs, ys) {
    return xs.filter(x => ys.includes(x))
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

export async function* mkTracksIterator(statusesIterator) {
    const knownStatus = new Set()
    const knownYoutube = new Set()

    const tracks = execPipe(
        statusesIterator,
        asyncFilter(status => {
            if (!status) {
                console.error(`No status, should not happen here`)
                return false
            } else {
                if (knownStatus.has(status.id)) {
                    console.log(`Drop already processed status ${status.id}`)
                    return false
                } else {
                    knownStatus.add(status.id)
                    return true
                }
            }
        }),
        asyncMap(status => ({ status, data: mkData(status) })),
        asyncFilter(({ status, data }) => {
            if (!data) {
                console.log(`Drop non processable status ${status.id}`)
                return false
            } else {
                if (knownYoutube.has(data.id)) {
                    console.log(`Drop already processed youtube ${data.id}`)
                    return false
                } else {
                    knownYoutube.add(data.id)
                    return true
                }
            }
        }),
        asyncMap(async ({ status, data }) => ({ status, data, metadata: await mkMetadata(data) }))
    )

    yield* tracks
}

function mkData(status)
{
    const urls = getUrls(status.content)

    for (const urlAsString of urls) {
        const url = new URL(urlAsString)

        if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(url.hostname) && url.searchParams.has('v')) {
            return { url: urlAsString, id: url.searchParams.get('v') }
        } else if (url.hostname === 'youtu.be') {
            return { url: urlAsString, id: url.pathname.substring(1) }
        }
    }

    return null
}

async function mkMetadata(entry) {
    return fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${entry.id}`)
        .then(response => response.json())
}
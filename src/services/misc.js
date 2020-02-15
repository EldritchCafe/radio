import getUrls from 'get-urls'
import { execPipe, asyncFilter, asyncMap, map, findOr } from 'iter-tools'

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

export async function* raceIterator(iterators) {
    const values = iterators.map(iterator => iterator.next())

    while (true) {
        const promises = values.map((promise, index) => promise.then(result => ({ index, result })))
        const { index, result: { done, value } } = await Promise.race(promises)

        values[index] = iterators[index].next()
        yield value
    }
}

const mkMapSet = () => ({ set: new Set(), children: new Map() })

const pathSet = () => {
    const root = mkMapSet()

    const has = (keys, value) => {
        let x = root

        for (const key of keys) {
            if (x.children.has(key)) {
                x = x.children.get(key)
            } else {
                return false
            }
        }

        return x.set.has(value)
    }

    const add = (keys, value) => {
        let x = root

        for (const key of keys) {
            if (!x.children.has(key)) {
                x.children.set(key, mkMapSet())
            }

            x = x.children.get(key)
        }

        x.set.add(value)
    }

    return { root, has, add }
}

export async function* tracksIterator(statusesIterator) {
    const known = pathSet()

    yield* execPipe(
        statusesIterator,
        asyncFilter(knownByReferer(known)),
        asyncMap(processReferer),
        asyncFilter(knownByMedia(known)),
        asyncMap(processMedia)
    )
}

const knownByReferer = known => track => {
    if (!track) {
        console.error(`No status, should not happen here`)
        return false
    } else {
        switch (track.referer.credentials.type) {
            default:
                throw new Error()

            case 'mastodon':
                const path = [
                    'referer',
                    'mastodon',
                    track.referer.credentials.domain
                ]

                const id = track.referer.credentials.id

                if (known.has(path, id)) {
                    console.log(`Drop already processed referer ${id}`)
                    return false
                } else {
                    known.add(path, id)
                    return true
                }
        }
    }
}

const knownByMedia = known => track => {
    if (track !== null) {
        switch (track.media.credentials.type) {
            default:
                throw new Error()

            case 'youtube':
                const path = [
                    'media',
                    'youtube'
                ]

                const id = track.media.credentials.id

                if (known.has(path, id)) {
                    console.log(`Drop already processed media ${id}`)
                    return false
                } else {
                    known.add(path, id)
                    return true
                }
        }
    } else {
        return false
    }
}

const processReferer = track => {
    const urls = getUrls(track.content)

    const media = execPipe(
        urls,
        map(parseSource),
        findOr(null, x => x !== null)
    )

    if (media) {
        return { ...track, media }
    } else {
        return null
    }
}

const processMedia = async track => {
    const metadata = await fetchMetadata(track.media)
    return { ...track, title: metadata.title }
}

const parseSource = (url) => {
    const { hostname, pathname, searchParams } = new URL(url)

    if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(hostname) && searchParams.has('v')) {
        return { url, credentials: { type: 'youtube', id: searchParams.get('v') } }
    } else if (hostname === 'youtu.be') {
        return { url, credentials: { type: 'youtube', id: pathname.substring(1) } }
    } else {
        return null
    }
}

const fetchMetadata = (media) => {
    switch (media.credentials.type) {
        case 'youtube':
            return fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${media.credentials.id}`)
                .then(response => response.json())
    }
}
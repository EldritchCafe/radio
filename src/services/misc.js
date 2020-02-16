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

export async function* tracksIterator(statusesIterator, cache) {
    yield* execPipe(
        statusesIterator,
        asyncFilter(track => track != null), // should not be necessary
        asyncFilter(notKnown(cache)),
        asyncMap(completeTrack)
    )
}

const notKnown = cache => track => {
    if (!track) {
        console.error(`No track, should not happen here`)
        return false
    }

    const isKnown = (values) => {
        if (cache.has(values)) {
            console.log(`Drop already processed ${values.join(':')}`)
            return true
        } else {
            cache.add(values)
            return false
        }
    }

    switch (track.referer.credentials.type) {
        default:
            throw new Error()

        case 'mastodon':
            if (isKnown([
                'referer',
                'mastodon',
                track.referer.credentials.domain,
                track.referer.credentials.id
            ])) {
                return false
            }

            break;
    }

    if (track.media == null) {
        return false
    }

    switch (track.media.credentials.type) {
        default:
            throw new Error()

        case 'youtube':
            if (isKnown([
                'media',
                'youtube',
                track.media.credentials.id
            ])) {
                return false
            }

            break
    }

    return true
}

const completeTrack = async track => {
    const metadata = await fetchMetadata(track.media)
    return {
        ...track,
        title: metadata.title,
        cover: metadata.thumbnail_url
    }
}

export const urlsToMedia = urls => {
    return execPipe(
        urls,
        map(parseSource),
        findOr(null, x => x !== null)
    )
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
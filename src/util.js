import { writable } from 'svelte/store'
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

export const writableLocalStorage = (key, value) => {
    const item = JSON.parse(localStorage.getItem(key))
    const store = writable(item === null ? value : item)

    store.subscribe(x => localStorage.setItem(key, JSON.stringify(x)))

    return store
}

const millisecond = 1
const second = 1000 * millisecond
const minute = 60 * second
const hour = 60 * minute

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

export async function* mkStatusesIterator(domain, hashtag) {
    console.log(`Initialize statuses iterator for #${hashtag} on ${domain}`)
    const buffer = []



    // streaming
    const eventSource = new EventSource(`https://${domain}/api/v1/streaming/hashtag?tag=${hashtag}`)

    eventSource.addEventListener('update', (e) => {
        console.log(`Received new recent status for #${hashtag} on ${domain}`)
        buffer.unshift(JSON.parse(e.data))
    })

    eventSource.onerror = (error) => console.log('onerror', error)



    // timeline
    let nextLink = `https://${domain}/api/v1/timelines/tag/${hashtag}?limit=40`

    while (true) {
        if (buffer.length === 0) {
            console.log(`Fetch timeline for #${hashtag} on ${domain}`)
            const next = await fetchTimeline(nextLink)

            if (next.statuses.length) {
                buffer.push(...next.statuses)
                nextLink = next.links.next
            }
        }

        yield buffer.shift()
    }
}

export async function* mkTracksIterator(domain, hashtags) {
    // const known = new Set()
    const known = {}
    const [hashtag] = hashtags

    const statuses = mkStatusesIterator(domain, hashtag)

    const tracks = execPipe(
        statuses,
        asyncMap(status => ({ status, data: mkData(status) })),
        asyncFilter(({ data }) => {
            if (data) {
                // const found = known.has(data.id)
                // known.add(data.id)
                const found = known.hasOwnProperty(data.id)
                known[data.id] = true
                return !found
            }

            return false
        }),
        asyncMap(async ({ status, data }) => ({ status, data, metadata: await mkMetadata(data) }))
    )

    yield* tracks
}

export async function fetchTimeline(url) {
    console.log(`fetching ${url}`)
    const response = await fetch(url)
    const statuses = await response.json()

    const links = response.headers.has('link')
        ? parseLinkHeader(response.headers.get('link'))
        : {}

    return { statuses, links }
}

const LINK_RE = /<(.+?)>; rel="(\w+)"/gi

function parseLinkHeader(link) {
    const links = {}

    for (const [ , url, name ] of link.matchAll(LINK_RE)) {
        links[name] = url
    }

    return links
}

function mkData(status)
{
    const urls = getUrls(status.content)

    for (const urlAsString of urls) {
        const url = new URL(urlAsString)

        if (['youtube.com', 'music.youtube.com'].includes(url.hostname) && url.searchParams.has('v')) {
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

export function intersection(xs, ys) {
    return xs.filter(x => ys.includes(x))
}
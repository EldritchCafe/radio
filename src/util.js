import getUrls from 'get-urls'
import { execPipe, asyncFilter, asyncMap } from 'iter-tools'

const millisecond = 1
const second = 1000 * millisecond
const minute = 60 * second

export async function* mkStatusesIterator(initialLink) {
    let buffer = []
    let { previousLink, nextLink } = initialLink

    console.log('fetch initial')
    const initial = await fetchTimeline(initialLink)
    let latestPreviousFetch = Date.now()

    if (initial.statuses.length > 0) {
        buffer = [...initial.statuses]
        previousLink = initial.links.prev
        nextLink = initial.links.next
    }

    yield buffer.shift()

    while (true) {
        const now = Date.now()
        if (latestPreviousFetch + 5 * minute < now) {
            console.log('fetch newer')
            const previous = await fetchTimeline(previousLink)
            console.log(`${previous.length} newers`)
            buffer.unshift(...previous.statuses)
            previousLink = previous.links.prev
            latestPreviousFetch = now
        }

        if (buffer.length === 0) {
            console.log('fetch older')
            const next = await fetchTimeline(nextLink)
            buffer.push(...next.statuses)
            nextLink = next.links.next
        }

        yield buffer.shift()
    }
}

export async function* mkTracksIterator(domain, hashtags) {
    const known = new Set()
    const [hashtag] = hashtags

    const statuses = mkStatusesIterator(`https://${domain}/api/v1/timelines/tag/${hashtag}?limit=40`)

    const tracks = execPipe(
        statuses,
        asyncMap(status => ({ status, data: mkData(status) })),
        asyncFilter(({ data }) => {
            if (data) {
                const found = known.has(data.id)
                known.add(data.id)
                return !found
            }

            return false
        }),
        asyncMap(async ({ status, data }) => ({ status, data, metadata: await mkMetadata(data) }))
    )

    yield* tracks
}

export async function fetchTimeline(url) {
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
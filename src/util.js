import getUrls from 'get-urls'
import { pipe, asyncFilter, asyncMap, asyncTap, asyncTake } from 'iter-tools'
import YouTubePlayer from 'yt-player'

export async function* statusesStreaming(domain, [hashtag]) {
    const initialLink = `https://${domain}/api/v1/timelines/tag/${hashtag}?limit=40`

    let { statuses, nextLink, previousLink } = await fetchTimeline(initialLink)

    yield* statuses

    while (nextLink) {
        const a = await fetchTimeline(nextLink)

        nextLink = a.nextLink
        yield* a.statuses
    }
}

export const statusesToEntries = pipe(
    asyncMap(statusToEntry),
    asyncFilter(entry => entry.type !== 'unsupported')
)

export async function fetchTimeline(url) {
    const urlBuilder = new URL(url)
    urlBuilder.searchParams.set('limit', 40)

    const response = await fetch(url)
    const statuses = await response.json()
    const { next, previous } = parseLinkHeader(response.headers.get('link'))

    return { statuses, nextLink: next, previousLink: previous }
}

const LINK_RE = /<(.+?)>; rel="(\w+)"/gi

function parseLinkHeader(link) {
    const links = {}

    for (const [ , url, name ] of link.matchAll(LINK_RE)) {
        links[name] = url
    }

    return links
}

async function statusToEntry(status) {
    const urls = getUrls(status.content)

    for await (const url of urls) {
        const { type, data } = await urlToEntry(url)

        if (type !== 'unsupported') {
            return { status, url, type, data }
        }
    }

    return { type: 'unsupported' }
}

async function urlToEntry(urlAsString) {
    const url = new URL(urlAsString)

    console.log(url.hostname)

    if (['youtube.com', 'music.youtube.com'].includes(url.hostname) && url.searchParams.has('v')) {
        return await mkYoutubeEntry(url.searchParams.get('v'))
    } else if (url.hostname === 'youtu.be') {
        return await mkYoutubeEntry(url.pathname.substring(1))
    } else {
        return { type: 'unsupported' }
    }
}

async function mkYoutubeEntry(id) {
    return {
        type: 'youtube',
        data: {
            id,
            metadata: await fetchYoutubeMetadata(id)
        }
    }
}

function fetchYoutubeMetadata(id) {
    return fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`)
        .then(response => response.json())
}

export function intersection(xs, ys) {
    return xs.filter(x => ys.includes(x))
}
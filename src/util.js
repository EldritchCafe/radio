import getUrls from 'get-urls'
import { pipe, asyncFilter, asyncMap, asyncTap, asyncTake } from 'iter-tools'

export async function* statusesStreaming() {
    let { statuses, nextLink, previousLink } = await fetchTimeline('https://eldritch.cafe/api/v1/timelines/tag/np')

    yield* statuses

    while (nextLink) {
        const a = await fetchTimeline(nextLink)

        nextLink = a.nextLink
        yield* a.statuses
    }
}

export const statusesToEntries = pipe(
    asyncMap(status => ({ status, urls: Array.from(getUrls(status.content)).filter(isSupportedUrl) })),
    asyncFilter(entry => entry.urls.length > 0),
    asyncMap(async ({ status, urls }) => {
        const [url] = urls
        const id = getYoutubeVideoId(url)

        const tags = intersection(status.tags.map(tag => tag.name), [
            'np',
            'nowplaying',
            'tootradio',
            'pouetradio'
        ])

        const metadata = await fetchYoutubeMetadata(id)

        return { status, url, id, tags, metadata }
    })
)

function fetchYoutubeMetadata(id) {
    return fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`)
        .then(response => response.json())

}

export function isSupportedUrl(urlAsString) {
    const url = new URL(urlAsString)

    const hosts = [
        'youtube.com',
        'music.youtube.com'
    ]

    return hosts.includes(url.hostname) && url.searchParams.has('v')
}

export function getYoutubeVideoId(urlAsString) {
    return new URL(urlAsString).searchParams.get('v')
}

export function intersection(xs, ys) {
    return xs.filter(x => ys.includes(x));
}

export async function fetchTimeline(url) {
    const urlBuilder = new URL(url)
    urlBuilder.searchParams.set('limit', 40)

    const response = await fetch(url)
    const statuses = await response.json()
    const { next, previous } = parseLinkHeader(response.headers.get('link'))

    return { statuses, nextLink: next, previousLink: previous }
}

const LINK_RE = /<(.+?)>; rel="(\w+)"/gi

export function parseLinkHeader(link) {
    const links = {}

    for (const [ , url, name ] of link.matchAll(LINK_RE)) {
        links[name] = url
    }

    return links
}
import getUrls from 'get-urls'

export function isSupportedUrl(urlAsString) {
    const url = new URL(urlAsString)

    const hosts = [
        'youtube.com',
        'music.youtube.host'
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

export function statusesToEntries(statuses) {
    const entries = []

    return statuses
        .map(status => {
            const [url] = Array.from(getUrls(status.content)).filter(isSupportedUrl)

            return { status, url }
        })
        .filter(entry => entry.url != null)
        .map(({ status, url }) => {
            const id = getYoutubeVideoId(url)
            const tags = intersection(status.tags.map(tag => tag.name), [
                'np',
                'nowplaying',
                'tootradio',
                'pouetradio'
            ])

            return { status, url, id, tags }
        })
}
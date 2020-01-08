import getUrls from 'get-urls'
import getYoutubeId from 'get-youtube-id'

export async function fetchEntries(domain, hashtags) {
    const response = await fetch(`https://${domain}/api/v1/timelines/tag/${hashtags[0]}`)
    const statuses = await response.json()

    const entries = statuses
        .map(status => {
            const [url] = Array.from(getUrls(status.content)).filter(isSupportedUrl)

            return { status, url }
        })
        .filter(entry => entry.url != null)
        .map(({ status, url }) => {
            const id = getYoutubeId(url)
            const tags = intersection(status.tags.map(tag => tag.name), hashtags)

            return { status, url, id, tags }
        })

    return entries
}

function isSupportedUrl(url) {
    return (new URL(url)).hostname === 'youtube.com'
}

function intersection(xs, ys) {
    return xs.filter(x => ys.includes(x));
}
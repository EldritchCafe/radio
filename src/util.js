import getUrls from 'get-urls'

export async function fetchEntries(domain, hashtags) {
    const response = await fetch(`https://${domain}/api/v1/timelines/tag/${hashtags[0]}`)
    const statuses = await response.json()

    const entries = statuses
        .map(status => {
            const [url] = Array.from(getUrls(status.content)).filter(isSupportedUrl)
            const tags = intersection(status.tags.map(tag => tag.name), hashtags)

            return { status, url, tags }
        })
        .filter(entry => entry.url != null)

    return entries
}

function isSupportedUrl(url) {
    return (new URL(url)).hostname === 'youtube.com'
}

function intersection(xs, ys) {
    return xs.filter(x => ys.includes(x));
}
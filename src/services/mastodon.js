import Observable from 'core-js-pure/features/observable'
import getUrls from 'get-urls'
import { urlsToMedia } from '/services/misc.js'

const LINK_RE = /<(.+?)>; rel="(\w+)"/gi

function parseLinkHeader(link) {
    const links = {}

    for (const [ , url, name ] of link.matchAll(LINK_RE)) {
        links[name] = url
    }

    return links
}

export const fetchStatus = (domain, id) => fetch(`https://${domain}/api/v1/statuses/${id}`)
    .then(response => response.json())
    .then(status => processStatus(domain, status))

export async function* statusIterator({ domain, id }) {
    yield await fetchStatus(domain, id)
}

export const hashtagStreamingObservable = (domain, hashtag) => {
    return new Observable(observer => {
        const onOpen = () => {
            console.log(`Streaming ${domain} #${hashtag} : open`)
        }

        const onStatus = event => {
            const status = JSON.parse(event.data)
            console.log(`Streaming ${domain} #${hashtag} : status ${status.id}`)
            observer.next(processStatus(domain, status))
        }

        const onError = error => {
            console.error(`Streaming ${domain} #${hashtag} : error`)
            console.error(error)
            observer.error(error)
        }

        const eventSource = new EventSource(`https://${domain}/api/v1/streaming/hashtag?tag=${hashtag}`)
        eventSource.addEventListener('open', onOpen)
        eventSource.addEventListener('update', onStatus)
        eventSource.addEventListener('error', onError)

        return () => {
            console.log(`Streaming ${domain} #${hashtag} : closed`)
            eventSource.removeEventListener('open', onOpen)
            eventSource.removeEventListener('update', onStatus)
            eventSource.removeEventListener('error', onError)
            eventSource.close()
        }
    })
}

export const hashtagsStreamingObservable = (domain, hashtags) => {
    return new Observable(observer => {
        const subscriptions = hashtags
            .map(hashtag => hashtagStreamingObservable(domain, hashtag))
            .map(observable => observable.subscribe(observer))

        return () => {
            subscriptions.forEach(subscription => subscription.unsubscribe())
        }
    })
}

export async function* hashtagTimelineIterator (domain, hashtag) {
    let nextLink = `https://${domain}/api/v1/timelines/tag/${hashtag}?limit=40`

    while (nextLink) {
        const response = await fetch(nextLink)

        nextLink = response.headers.has('link')
            ? parseLinkHeader(response.headers.get('link')).next
            : null

        const statuses = await response.json()

        console.log(`Timeline ${domain} #${hashtag} : fetched ${statuses.length} statuses`)

        yield* statuses.map(status => processStatus(domain, status))
    }
}

export async function* hashtagsTimelineIterator (domain, hashtags) {
    const iterators = hashtags.map(hashtag => hashtagTimelineIterator(domain, hashtag))
    const promises = iterators.map(iterator => iterator.next())

    while (true) {
        const results = (await Promise.all(promises))
            .map((result, index) => ({ index, result }))
            .filter(({ result }) => !result.done)

        if (results.length > 0) {
            const sorted = results.sort((a, b) => b.result.value.date - a.result.value.date)
            const { index, result: { value } } = sorted[0]

            promises[index] = iterators[index].next()
            yield value
        } else {
            break
        }
    }

}

export async function* hashtagsIterator(domain, hashtags) {
    const buffer = []

    const streamingSubscription = hashtagsStreamingObservable(domain, hashtags).subscribe({
        next: value => buffer.push(value),
        error: error => console.error(error),
        complete: () => console.log('complete')
    })

    const timelineGenerator = hashtagsTimelineIterator(domain, hashtags)

    try {
        while (true) {
            if (buffer.length > 0) {
                yield buffer.pop()
            } else {
                yield (await timelineGenerator.next()).value
            }
        }
    } finally {
        streamingSubscription.unsubscribe()
        timelineGenerator.return()
    }
}


const processStatus = (domain, status) => ({
    title: '',
    date: new Date(status.created_at),
    referer: {
        username: status.account.username,
        url: status.url,
        credentials: { type: 'mastodon', domain, id: status.id }
    },
    media: urlsToMedia(getUrls(status.content))
})


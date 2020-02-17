import Observable from 'core-js-pure/features/observable'
import getUrls from 'get-urls'
import { observableToAsyncIterator, raceIterator, urlsToMedia } from '/services/misc.js'

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

// Observable<{ domain : string, hashtag : string, status : Status}>
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
            eventSource.removeEventListener('open', onOpen)
            eventSource.removeEventListener('update', onStatus)
            eventSource.removeEventListener('error', onError)
            eventSource.close()
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

export const hashtagIterator = (domain, hashtag) => {
    return raceIterator([
        observableToAsyncIterator(hashtagStreamingObservable(domain, hashtag)),
        hashtagTimelineIterator(domain, hashtag)
    ])
}

export async function* hashtagsIterator (domain, hashtags) {
    const iterators = hashtags.map(hashtag => hashtagIterator(domain, hashtag))
    const values = iterators.map(iterator => iterator.next())

    while (true) {
        const promises = values.map((promise, index) => promise.then(result => ({ index, result })))
        const promisesValues = await Promise.all(promises)

        const sorted = promisesValues
            .sort((a, b) =>{
                a.result.value.date - b.result.value.date
            })

        const { index, result: { done, value } } = sorted[0]
        values[index] = iterators[index].next()
        yield value
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


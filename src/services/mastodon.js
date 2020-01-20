import { observableToAsyncIterator } from '/services/misc.js'
import 'core-js/es7/observable.js'

const LINK_RE = /<(.+?)>; rel="(\w+)"/gi

function parseLinkHeader(link) {
    const links = {}

    for (const [ , url, name ] of link.matchAll(LINK_RE)) {
        links[name] = url
    }

    return links
}

export const hashtagStreamingObservable = (domain, hashtag) => {
    return new Observable(observer => {
        const onStatus = (event) => observer.next(JSON.parse(event.data))
        const onError = (error) => observer.error(error)

        const eventSource = new EventSource(`https://${domain}/api/v1/streaming/hashtag?tag=${hashtag}`)
        eventSource.addEventListener('update', onStatus)
        eventSource.addEventListener('error', onError)

        return () => {
            eventSource.removeEventListener('update', onStatus)
            eventSource.removeEventListener('error', onError)
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

        yield* await response.json()
    }
}

export async function* hashtagIterator(domain, hashtag) {
    const newerIterator = observableToAsyncIterator(hashtagStreamingObservable(domain, hashtag))
    const olderIterator = hashtagTimelineIterator(domain, hashtag)

    let newer = newerIterator.next()
    let older = olderIterator.next()

    while (true) {
        const promises = [newer, older].map((promise, index) => promise.then(result => ({ index, result })))
        const { index, result: { done, value } } = await Promise.race(promises)

        switch (index) {
            default:
                throw new Error()

            case 0:
                newer = newerIterator.next()
                break;

            case 1:
                older = olderIterator.next()
                break;
        }

        yield value
    }
}


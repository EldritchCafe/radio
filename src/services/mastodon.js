import Observable from 'core-js-pure/features/observable'
import { observableToAsyncIterator } from '/services/misc.js'

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
        const onOpen = () => {
            console.log(`Streaming ${domain} #${hashtag} : open`)
        }

        const onStatus = event => {
            const status = JSON.parse(event.data)
            console.log(`Streaming ${domain} #${hashtag} : status ${status.id}`)
            observer.next(status)
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

        yield* statuses
    }
}

export async function* hashtagIterator(domain, hashtag) {
    const newerIterator = observableToAsyncIterator(hashtagStreamingObservable(domain, hashtag))
    const olderIterator = hashtagTimelineIterator(domain, hashtag)

    const iterators = [newerIterator, olderIterator]
    const values = iterators.map(iterator => iterator.next())

    while (true) {
        const promises = values.map((promise, index) => promise.then(result => ({ index, result })))
        const { index, result: { done, value } } = await Promise.race(promises)

        values[index] = iterators[index].next()

        console.log(`Resolver ${domain} #${hashtag} : resolved with iterator ${index}`)
        yield value
    }
}

export async function* combinedIterator(iterators) {
    const values = iterators.map(iterator => iterator.next())

    while (true) {
        const promises = values.map((promise, index) => promise.then(result => ({ index, result })))
        const promisesValues = await Promise.all(promises)

        const sorted = promisesValues
            .sort((a, b) =>{
                new Date(a.result.value.status.created_at) - new Date(b.result.value.status.created_at)
            })

        const { index, result: { done, value } } = sorted[0]

        values[index] = iterators[index].next()

        console.log(`CombinedResolver : resolved with iterator ${index}`)
        yield value
    }
}

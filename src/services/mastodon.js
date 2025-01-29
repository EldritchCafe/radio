import Observable from 'core-js-pure/features/observable'
import extractUrls from 'extract-urls'
import { asyncMap, execPipe, map, findOr } from 'iter-tools'
import { mapNullable } from '/src/services/misc.js'

const LINK_RE = /<(.+?)>; rel="(\w+)"/gi

function parseLinkHeader(linkHeader) {
    const links = new Map()

    for (const [ , url, name ] of linkHeader.matchAll(LINK_RE)) {
        links.set(name, url)
    }

    return links
}

const fetchStatus = (domain, id) => fetch(`https://${domain}/api/v1/statuses/${id}`)
    .then(response => response.json())

export async function* statusIterator({ domain, id }) {
    const partialTrack = processStatus(domain, await fetchStatus(domain, id))

    if (partialTrack !== null) {
        yield partialTrack
    }
}

async function* hashtagTimelineStatusesIterator (domain, hashtag) {
    let nextLink = `https://${domain}/api/v1/timelines/tag/${hashtag}?limit=40`

    while (nextLink) {
        const response = await fetch(nextLink)

        nextLink = response.headers.has('link')
            ? parseLinkHeader(response.headers.get('link')).get('next')
            : null

        yield* await response.json()
    }
}

const hashtagTimelineIterator = (domain, hashtag) => execPipe(
    hashtagTimelineStatusesIterator(domain, hashtag),
    asyncMap(status => processStatus(domain, status)),
    async function* (xs) {
        let c = 0

        for await (const x of xs) {
            if (x === null) {
                if (++c > 69) {
                    console.log(`Not found any viable media on #${hashtag}.`)
                    break
                }
            } else {
                c = 0
                yield x
            }
        }
    }
)

async function* hashtagsTimelineIterator (domain, hashtags) {
    const iterators = hashtags.map(hashtag => hashtagTimelineIterator(domain, hashtag))
    const promises = iterators.map(iterator => iterator.next())

    while (true) {
        const results = (await Promise.all(promises))
            .map((result, index) => ({ index, result }))
            .filter(({ result }) => !result.done)

        if (results.length > 0) {
            const sorted = results.sort((a, b) => b.result.value.referer.date - a.result.value.referer.date)
            const { index, result: { value } } = sorted[0]

            promises[index] = iterators[index].next()
            yield value
        } else {
            break
        }
    }

}

export async function* hashtagsIterator(domain, hashtags) {
    return yield* hashtagsTimelineIterator(domain, hashtags)

    // Mastodon 4.2 require auth for the streaming timeline
    // const buffer = []

    // const streamingSubscription = hashtagsStreamingObservable(domain, hashtags).subscribe({
    //     next: value => buffer.push(value),
    //     error: error => console.error(error),
    //     complete: () => console.log('complete')
    // })

    // const timelineGenerator = hashtagsTimelineIterator(domain, hashtags)

    // try {
    //     while (true) {
    //         if (buffer.length > 0) {
    //             yield buffer.pop()
    //         } else {
    //             const { done, value } = await timelineGenerator.next()

    //             if (done) {
    //                 break
    //             } else {
    //                 yield value
    //             }
    //         }
    //     }
    // } finally {
    //     streamingSubscription.unsubscribe()
    //     timelineGenerator.return()
    // }
}

const processStatus = (domain, status) => mapNullable(findMedia(status), partialMedia => ({
    referer: {
        username: status.account.username,
        content: status.content,
        date: new Date(status.created_at),
        url: status.url,
        credentials: { type: 'mastodon', domain, id: status.id }
    },
    partialMedia
}))

const findMedia = status => execPipe(
    status.content,
    extractUrls,
    map(url => {
        const { hostname, pathname, searchParams } = new URL(url)

        if (['youtube.com', 'm.youtube.com', 'music.youtube.com', 'invidio.us'].includes(hostname) && searchParams.has('v')) {
            return { url, credentials: { type: 'youtube', id: searchParams.get('v') } }
        } else if (hostname === 'youtu.be') {
            return { url, credentials: { type: 'youtube', id: pathname.substring(1) } }
        } else {
            return null
        }
    }),
    findOr(null, x => x !== null)
)

// Streaming hashtag endpoint is not public since Mastodon 4.2
// const hashtagStreamingStatusesObservable = (domain, hashtag) => {
//     return new Observable(observer => {
//         const onOpen = () => {
//             console.log(`Streaming ${domain} #${hashtag} : open`)
//         }

//         const onStatus = event => {
//             const status = JSON.parse(event.data)
//             console.log(`Streaming ${domain} #${hashtag} : status ${status.id}`)
//             observer.next(status)
//         }

//         const onError = error => {
//             console.error(`Streaming ${domain} #${hashtag} : error`)
//             console.error(error)
//             observer.error(error)
//         }

//         const eventSource = new EventSource(`https://${domain}/api/v1/streaming/hashtag?tag=${hashtag}`)
//         eventSource.addEventListener('open', onOpen)
//         eventSource.addEventListener('update', onStatus)
//         eventSource.addEventListener('error', onError)

//         return () => {
//             console.log(`Streaming ${domain} #${hashtag} : closed`)
//             eventSource.removeEventListener('open', onOpen)
//             eventSource.removeEventListener('update', onStatus)
//             eventSource.removeEventListener('error', onError)
//             eventSource.close()
//         }
//     })
// }

// const hashtagStreamingObservable = (domain, hashtag) => {
//     return new Observable(observer => {
//         const subscription = hashtagStreamingStatusesObservable(domain, hashtag).subscribe({
//             next: status => {
//                 const partialMedia = processStatus(domain, status)

//                 if (partialMedia !== null) {
//                     observer.next(partialMedia)
//                 }
//             },
//             error: observer.error,
//             complete: observer.complete
//         })

//         return () => {
//             subscription.unsubscribe()
//         }
//     })
// }

// don't handle correctly complete
// const hashtagsStreamingObservable = (domain, hashtags) => {
//     return new Observable(observer => {
//         const subscriptions = hashtags
//             .map(hashtag => hashtagStreamingObservable(domain, hashtag))
//             .map(observable => observable.subscribe(observer))

//         return () => {
//             subscriptions.forEach(subscription => subscription.unsubscribe())
//         }
//     })
// }

import { writable, get } from 'svelte/store'
import { getUrls, getYoutubeId, isSupportedUrl, intersection } from './util.js'

export const domain = writable('eldritch.cafe')

export const hashtags = writable([
    'np',
    'nowplaying',
    'tootradio',
    'pouetradio'
])

export const entries = entriesStore()

function entriesStore() {
    let loading = false
    let next = `https://eldritch.cafe/api/v1/timelines/tag/np`

    const store = writable(null)
    const { set, subscribe } = store

    const load = async () => {
        if (loading) {
            return
        }

        loading = true

        const responseP = fetch(next)

        responseP.then(response => {
            next = Array.from(getUrls(response.headers.get('link')))[0] // need to better parse that
        })

        const entriesP = responseP
            .then(response => response.json())
            .then(statuses => {
                return statuses
                    .map(status => {
                        const [url] = Array.from(getUrls(status.content)).filter(isSupportedUrl)

                        return { status, url }
                    })
                    .filter(entry => entry.url != null)
                    .map(({ status, url }) => {
                        const id = getYoutubeId(url)
                        const tags = intersection(status.tags.map(tag => tag.name), [
                            'np',
                            'nowplaying',
                            'tootradio',
                            'pouetradio'
                        ])

                        return { status, url, id, tags }
                    })
            })

        const previousEntriesP = get(store)

        if (previousEntriesP) {
            const [previousEntries, entries] = await Promise.all([previousEntriesP, entriesP])
            set(Promise.resolve([...previousEntries, ...entries]))
        } else {
            set(entriesP)
        }

        loading = false
    }

    return { subscribe, load }
}
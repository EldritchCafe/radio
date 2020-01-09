import { writable, get } from 'svelte/store'
import * as util from './util.js'

export const domain = writable('eldritch.cafe')

export const hashtags = writable([
    'np',
    'nowplaying',
    'tootradio',
    'pouetradio'
])

export const playing = writable(true)

export const loading = writable(false)

export const entries = entriesStore(loading)

export const entry = entryStore(entries)





function entryStore(entries) {
    const store = writable(null)
    const { set, update, subscribe } = store

    const next = async () => {
        const entriesList = await get(entries)

        update(oldEntry => {
            if (entriesList.length === 0) {
                return null
            }

            const index = entriesList.indexOf(oldEntry)

            if (index === -1) {
                return null
            }

            const nextIndex = index + 1

            if (nextIndex === entriesList.length - 1) {
                entries.load(1)
            }


            return entriesList[nextIndex]
        })
    }

    return { subscribe, set, next }
}

async function* loader(loading) {
    loading.set(true)
    let { statuses, nextLink, previousLink } = await util.fetchTimeline('https://eldritch.cafe/api/v1/timelines/tag/np')
    loading.set(false)

    yield* util.statusesToEntries(statuses)

    while (true) {
        loading.set(true)
        const timeline = await util.fetchTimeline(nextLink)
        loading.set(false)

        nextLink = timeline.nextLink

        yield* util.statusesToEntries(timeline.statuses)
    }
}


function entriesStore(loading) {
    const entriesSteam = loader(loading)

    const store = writable([])
    const { update, subscribe } = store

    const load = async (number) => {
        if (get(loading)) {
            return
        }

        for (let i = 0; i < number; i++) {
            const iteratorResult = await entriesSteam.next()

            if (iteratorResult.value) {
                update(entries => [...entries, iteratorResult.value])
            } else {
                break
            }
        }
    }

    return { subscribe, load }
}


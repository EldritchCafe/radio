import { writable, get } from 'svelte/store'
import * as util from '/util.js'

export const domain = writableLocalStorage('domain', 'eldritch.cafe')

export const hashtags = writableLocalStorage('hashtags', [
    'np',
    'nowplaying',
    'tootradio',
    'pouetradio'
])

export const paused = writable(false)
export const muted = writableLocalStorage('muted', false)
export const volume = writableLocalStorage('volume', 100)

export const entries = entriesStore(get(domain), get(hashtags))
export const entry = entryStore(entries)




function writableLocalStorage(key, value) {
    const item = JSON.parse(localStorage.getItem(key))
    const store = writable(item === null ? value : item)
    const unsubscribe = store.subscribe(x => localStorage.setItem(key, JSON.stringify(x)))
    return store
}

function entryStore(entries) {
    const store = writable(null)
    const { set, update, subscribe } = store

    const select = (entry) => {
        update(() => entry)

        const entriesList = get(entries)
        const index = entriesList.indexOf(entry)

        if (index === entriesList.length - 1) {
            entries.load(1)
        }
    }

    const previous = () => {
        const entriesList = get(entries)

        update(currentEntry => {
            const index = entriesList.indexOf(currentEntry)

            return index > 0 ? entriesList[index - 1] : null
        })
    }

    const next = () => {
        const entriesList = get(entries)

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

    return { subscribe, set: select, previous, next }
}

function entriesStore(domain, hashtags) {
    const tracksIterator = util.mkTracksIterator(domain, hashtags)

    const store = writable([])
    const { update, subscribe } = store

    const load = async (number) => {
        for (let i = 0; i < number; i++) {
            const iteratorResult = await tracksIterator.next()

            if (iteratorResult.value) {
                update(entries => [...entries, iteratorResult.value])
            } else {
                // iterator don't have new entries for now
                break
            }
        }
    }

    return { subscribe, load }
}

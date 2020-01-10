import { writable, get } from 'svelte/store'
import * as util from '/util.js'

export const domain = writable('eldritch.cafe')

export const hashtags = writable([
    'np',
    'nowplaying',
    'tootradio',
    'pouetradio'
])

export const playing = writable(true)
export const muted = writable(false)
export const volume = writable(100)

export const entries = entriesStore()
export const entry = entryStore(entries)





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

function entriesStore() {
    const entriesSteam = util.statusesToEntries(util.statusesStreaming())

    const store = writable([])
    const { update, subscribe } = store

    const load = async (number) => {
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

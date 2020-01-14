import { writable, get } from 'svelte/store'
import { writableLocalStorage, entriesStore, entryStore } from '/services/store.js'

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




const tracksIterator = mkTracksIterator(get(domain), get(hashtags))



export const track = writable(null)
export const queue = writable([])
export const stack = writable([])

export const state = writable({
    current: null,
    queue: []
})

export const enqueue = () => {
    const { value: newTrack } = await tracksIterator.next()

    if (!newTrack) {
        state.update(s => ({ ...s, queue: [...s.queue, newTrack] }))
    }
}

export const select = (track) => {
    state.update(s => ({ ...s, current: track }))
}

export const selectPrevious = () => {
    state.update(s => {
        if (s.current === null) return s

        const
        return
    })

    const tracks = get(queue)

    track.update(oldTrack => {
        const index = tracks.indexOf(oldTrack)
        return index > 0 ? tracks[index - 1] : null
    })
}

export const selectNext = () => {
    const tracks = get(queue)
    const oldTrack = get(track)



    track.update(oldTrack => {
        const index = tracks.indexOf(oldTrack)

        if (index !== -1 && ) {
            return null
        }

        return index !== -1 && index + 1 < tracks.length
            ? tracks[index + 1]
            : null
    })


    enqueueIfTrack(track)
}

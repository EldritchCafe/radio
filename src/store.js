import { get, writable, derived, scan, wait, startWith, writableLocalStorage } from '/services/store.js'
import { radioIterator, radioShareIterator } from '/services/radio.js'
import DeepSet from '/services/deep-set.js'
import { distinct } from './services/store'


const cache = new DeepSet()

export const domain = writableLocalStorage('domain', 'eldritch.cafe')

export const hashtags = writableLocalStorage('hashtags', [
    'np',
    'nowplaying',
    'tootradio',
    'pouetradio'
])

export const paused = writable(true)
export const muted = writableLocalStorage('muted', false)
export const volume = writableLocalStorage('volume', 100)

export const current = writable(null)
export const enqueueing = writable(false)


export const iterator = derived([domain, hashtags], ([$domain, $hashtags], set) => {
    const iterator = radioIterator($domain, $hashtags, cache)
    set(iterator)

    return () => {
        iterator.return()
    }
}, null)


export const next = derived([iterator, current], ([$iterator, $current]) => ({ $iterator, $current }))
    .pipe(scan(($nextPromise, { $iterator, $current }) => {
        return $nextPromise.then($next => {
            if ($next == null || $next === $current) {
                enqueueing.set(true)
                return $iterator.next().then(({ done, value }) => {
                    enqueueing.set(false)
                    return value
                })
            } else {
                return $nextPromise
            }
        })
    }, Promise.resolve(null)))
    .pipe(wait(x => x))
    // distinct but with strict check
    .pipe(distinct())
    .pipe(startWith(null))


export const queue = next
    .pipe(scan((a, x) => x == null ? a : [...a, x], []))


export const loading = writable(false)

const index = derived([queue, current], ([$queue, $current]) => {
    const i = $queue.indexOf($current)
    return i === -1 ? null : i
})

export const canPrevious = derived([queue, index], ([$queue, $index]) => $index !== null && $index > 0)
export const canNext = derived([queue, index], ([$queue, $index]) => $index !== null && $index < $queue.length - 1)


export const select = track => {
    console.log(`Select ${track.title}`)
    current.set(track)
}

export const selectPrevious = () => {
    if (get(canPrevious)) {
        const $queue = get(queue)
        const $index = get(index)
        select($queue[$index - 1])
    }
}

export const selectNext = () => {
    if (get(canNext)) {
        const $queue = get(queue)
        const $index = get(index)
        select($queue[$index + 1])
    }
}
<svelte:head>
    <title>{`${ $current ? `${$current.media.title} ∴ ` : ''}Eldritch Radio`}</title>
</svelte:head>

<div class="app container">
    <Header></Header>

    <section class="viewer" bind:this={viewerEl}>
        <Viewer large={large} sticky={sticky}></Viewer>
    </section>

    <section class="queue">
        <Queue></Queue>
    </section>

    <Footer></Footer>

</div>

<script>
    import { setContext, onMount } from 'svelte'
    import Header from '/components/layout/Header.svelte'
    import Footer from '/components/layout/Footer.svelte'
    import Queue from '/components/Queue.svelte'
    import Viewer from '/components/Viewer.svelte'
    import { get, writable, writableLocalStorage, derived, scan, wait, startWith, distinct } from '/services/store.js'
    import { radioIterator, radioShareIterator } from '/services/radio.js'
    import DeepSet from '/services/deep-set.js'

    export let share
    export let large
    let viewerEl
    let sticky

    const cache = new DeepSet()

    const domain = writableLocalStorage('domain', 'eldritch.cafe')

    const hashtags = writableLocalStorage('hashtags', [
        'np',
        'nowplaying',
        'tootradio',
        'pouetradio'
    ])

    const paused = writable(true)
    const volume = writableLocalStorage('volume', 100)

    const current = writable(null)
    const enqueueing = writable(false)
    const loading = writable(false)



    const iterator = derived([domain, hashtags], ([$domain, $hashtags], set) => {
        const iterator = share == null
            ? radioIterator($domain, $hashtags, cache)
            // this is a bit dump because we always requeue the shared track
            : radioShareIterator(share, $domain, $hashtags, cache)

        set(iterator)

        return () => {
            iterator.return()
        }
    }, null)

    const next = derived([iterator, current], ([$iterator, $current]) => ({ $iterator, $current }))
        .pipe(scan(($nextPromise, { $iterator, $current }) => {
            return $nextPromise.then($next => {
                if ($next == null || $next === $current) {
                    enqueueing.set(true)
                    return $iterator.next().then(({ done, value }) => {
                        enqueueing.set(false)
                        return value
                    }).catch(console.error)
                } else {
                    return $nextPromise
                }
            })
        }, Promise.resolve(null)))
        .pipe(wait(x => x))
        // distinct but with strict check
        .pipe(distinct())
        .pipe(startWith(null))


    const queue = next
        .pipe(scan((a, x) => x == null ? a : [...a, x], []))

    const index = derived([queue, current], ([$queue, $current]) => {
        const i = $queue.indexOf($current)
        return i === -1 ? null : i
    })

    const canPrevious = derived([queue, index], ([$queue, $index]) => $index !== null && $index > 0)
    const canNext = derived([queue, index], ([$queue, $index]) => $index !== null && $index < $queue.length - 1)


    const select = track => {
        console.log(`Select ${track.media.title}`)
        current.set(track)
    }

    const selectPrevious = () => {
        if (get(canPrevious)) {
            const $queue = get(queue)
            const $index = get(index)
            select($queue[$index - 1])
        }
    }

    const selectNext = () => {
        if (get(canNext)) {
            const $queue = get(queue)
            const $index = get(index)
            select($queue[$index + 1])
        }
    }

    setContext('paused', paused)
    setContext('volume', volume)
    setContext('domain', domain)
    setContext('hashtags', hashtags)
    setContext('current', current)
    setContext('loading', loading)
    setContext('enqueueing', enqueueing)
    setContext('iterator', iterator)
    setContext('next', next)
    setContext('queue', queue)
    setContext('canPrevious', canPrevious)
    setContext('canNext', canNext)
    setContext('select', select)
    setContext('selectPrevious', selectPrevious)
    setContext('selectNext', selectNext)

    $: if ($queue.length === 1 && $next != null && $current == null) {
        select($next)
    }

    onMount(() => {
        const stickyObserver = new IntersectionObserver( 
            ([e]) => {
                sticky = (e.intersectionRatio === 0) 
            },
            {threshold: [0]}
        )

        stickyObserver.observe(viewerEl)
    })
</script>
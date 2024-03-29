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
    import Header from '/src/components/layout/Header.svelte'
    import Footer from '/src/components/layout/Footer.svelte'
    import Queue from '/src/components/Queue.svelte'
    import Viewer from '/src/components/Viewer.svelte'
    import { get, writable, writableStorage, derived, scan, wait, startWith } from '/src/services/store.js'
    import { radioIterator, radioShareIterator } from '/src/services/radio.js'
    import DeepSet from '/src/services/deep-set.js'

    export let share
    export let large
    let viewerEl
    let sticky

    const cache = new DeepSet()

    const domain = writableStorage(localStorage, 'domain', process.env.INSTANCE)

    const hashtags = writableStorage(localStorage, 'hashtags', [
        'np',
        'nowplaying',
        'tootradio',
        'pouetradio'
    ])

    const paused = writable(true)
    const volume = writableStorage(localStorage, 'volume', 100)

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
        .pipe(source => {
            let $next = null

            return writable(undefined, set => {
                source.subscribe(({ $iterator, $current }) => {
                    if ($current !== null && $next === $current) {
                        $next = null
                        set($next)
                    }

                    if ($next === null) {
                        enqueueing.set(true)

                        $iterator.next().then(({ done, value }) => {
                            enqueueing.set(false)

                            if (done) {
                                console.log('done')
                                set(null)
                            } else {
                                $next = value
                                set($next)
                            }
                        }).catch(console.error)
                    }
                })
            })
        })
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

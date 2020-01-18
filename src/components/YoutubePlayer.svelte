<div bind:this={element}></div>

<script>
    import { onMount, onDestroy } from 'svelte'
    import { loadIframeApi, STATUS } from '/youtube.js'
    import { queue } from '/util.js'

    let element
    let player

    // output props
    export let ready = false
    export let ended = false
    export let duration = null
    export let currentTime = null

    // input props
    export let id
    export let paused
    export let muted
    export let volume

    $: load(id)
    $: setPaused(paused)
    $: setMuted(muted)
    $: setVolume(volume)

    const { enqueue, run } = queue()

    export const load = (id) => enqueue((player) => {
        ready = false
        ended = false
        currentTime = null
        duration = null

        if (paused) {
            player.cueVideoById(id)
        } else {
            player.loadVideoById(id)
        }
    })

    const setPaused = paused => enqueue(player => {
        if (paused) {
            if (player.getPlayerState() === STATUS.PLAYING) {
                player.pauseVideo()
            }
        } else {
            if (player.getPlayerState() !== STATUS.PLAYING) {
                player.playVideo()
            }
        }
    })

    const setMuted = muted => enqueue(player => {
        if (muted) {
            if (!player.isMuted()) {
                player.mute()
            }
        } else {
            if (player.isMuted()) {
                player.unMute()
            }
        }
    })


    const setVolume = volume => enqueue(player => {
        player.setVolume(volume)
    })


    export const seek = (seconds, allowSeekAhead) => enqueue((player) => {
        player.seekTo(seconds, allowSeekAhead)
        // currentTime = player.getCurrentTime()
    })

    onMount(() => {
        loadIframeApi().then(api => {
            element.id = Math.random().toString(16).slice(2, 8)

            const onReady = (event) => {
                run(event.target)

                setInterval(() => {
                    currentTime = event.target.getCurrentTime()
                }, 1000)
            }

            const onStateChange = (event) => {
                console.log('stateChange', event)

                switch (event.data) {
                    case STATUS.UNSTARTED:
                        ready = true
                        break

                    case STATUS.PLAYING:
                        duration = event.target.getDuration()
                        break

                    case STATUS.ENDED:
                        ended = true
                        break
                }
            }

            const onError = () => {
                console.log('error', event)
            }

            player = new api.Player(element.id, {
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    enablejsapi: 1,
                    modestbranding: 1,
                    rel: 0
                },
                events: {
                    onReady,
                    onStateChange,
                    onError
                }
            })
        })
    })

    onDestroy(() => {
        if (player) {
            player.destroy()
        }
    })
</script>
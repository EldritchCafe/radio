<div bind:this={element}></div>

<script>
    import { onMount, onDestroy } from 'svelte'
    import { loadIframeApi, STATE } from '/services/youtube.js'
    import { queue } from '/services/misc.js'

    let element
    let player
    let animationFrameId

    // output props
    export let ready = false
    export let ended = false
    export let error = false
    export let duration = null
    export let currentTime = null

    // input props
    export let id
    export let paused
    export let volume

    $: load(id)
    $: setPaused(paused)
    $: setVolume(volume)

    const { enqueue, run } = queue()

    export const load = (id) => enqueue((player) => {
        ready = false
        ended = false
        error = false
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
            if (player.getPlayerState() === STATE.PLAYING) {
                player.pauseVideo()
            }
        } else {
            if (player.getPlayerState() !== STATE.PLAYING) {
                player.playVideo()
            }
        }
    })

    const setVolume = volume => enqueue(player => {
        player.setVolume(volume)
    })

    export const seek = (seconds, allowSeekAhead) => enqueue((player) => {
        player.seekTo(seconds, allowSeekAhead)
    })

    onMount(() => {
        loadIframeApi().then(api => {
            element.id = Math.random().toString(16).slice(2, 8)

            const onReady = ({ target: player }) => {
                if (player.isMuted()) {
                    player.unMute()
                }

                run(player)
            }

            const onStateChange = ({ data: state, target: player }) => {
                switch (state) {
                    case STATE.UNSTARTED:
                        ready = true
                        break

                    case STATE.PLAYING:
                        if (duration === null) {
                            duration = player.getDuration()
                        }

                        break

                    case STATE.ENDED:
                        ended = true
                        break
                }

                if (state === STATE.PLAYING) {
                    const step = () => {
                        currentTime = player.getCurrentTime()
                        animationFrameId = requestAnimationFrame(step)
                    }

                    animationFrameId = requestAnimationFrame(step)
                } else {
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId)
                    }
                }
            }

            const onError = () => {
                error = true
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
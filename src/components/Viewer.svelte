<div>
    <div bind:this={element}></div>
</div>

<script>
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import YoutubePlayer from 'yt-player'
    import { entry, playing, muted, volume } from '/store.js'

    let element
    let player

    $: updateEntry($entry)
    $: updatePlaying($playing)
    $: updateMuted($muted)
    $: updateVolume($volume)

    const updateEntry = (entry) => {
        if (player && entry) player.load(entry.data.id, get(playing))
    }

    const updatePlaying = (playing) => {
        if (player) playing ? player.play() : player.pause()
    }

    const updateMuted = (muted) => {
        if (player) muted ? player.mute() : player.unMute()
    }

    const updateVolume = (volume) => {
        if (player) player.setVolume(volume)
    }

    onMount(() => {
        player = new YoutubePlayer(element, {
            width: 300,
            height: 300,
            autoplay: $playing,
            controls: false,
            keyboard: false,
            fullscreen: false,
            modestBranding: true,
            related: false
        })

        updatePlaying($playing)
        updateMuted($muted)
        updateVolume($volume)

        player.on('ended', () => entry.next())

        player.on('unplayable', (...args) => {
            console.log('unplayable', ...args)
            entry.next()
        })
    })
</script>

<style>

</style>
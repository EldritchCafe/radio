<div>
    <div bind:this={element}></div>
</div>

<script>
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import YoutubePlayer from 'yt-player'
    import { entry, playing, volume, muted } from '/store.js'

    let element
    let player

    $: updateEntry($entry)
    $: updatePlaying($playing)
    $: updateVolume($volume)
    $: updateMuted($muted)

    const updateEntry = (entry) => {
        if (player && entry) player.load(entry.id, get(playing))
    }

    const updatePlaying = (playing) => {
        if (player) playing ? player.play() : player.pause()
    }

    const updateVolume = (volume) => {
        if (player) player.setVolume(volume)
    }

    const updateMuted = (muted) => {
        if (player) muted ? player.mute() : player.unMute()
    }

    onMount(() => {
        player = new YoutubePlayer(element, {
            width: 300,
            height: 300,
            autoplay: $playing,
            controls: true, // debug only
            keyboard: false,
            fullscreen: false,
            modestBranding: true,
            related: false
        })

        player.on('ended', () => entry.next())
        player.on('unplayable', () => entry.next())
    })
</script>

<style>

</style>
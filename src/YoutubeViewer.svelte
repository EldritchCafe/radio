<div>
    <div bind:this={element}></div>
</div>

<script>
    import { onMount } from 'svelte';
    import YoutubePlayer from 'yt-player'

    export let videoId

    let element
    let player

    $: if (player && videoId) {
        console.log(`loada ${videoId}`)
        player.load(videoId, true)
    }

    onMount(() => {
        player = new YoutubePlayer(element, {
            width: 200,
            height: 200,
            autoplay: true,
            controls: false, // debug only
            keyboard: false,
            fullscreen: false,
            modestBranding: true,
            related: false
        })

        player.on('ended', () => console.log('ended u should select next entry now uwu'))
    })
</script>

<style>

</style>
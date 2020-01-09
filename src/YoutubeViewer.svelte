<div>
    <div bind:this={element}></div>

    <button on:click={player.play()}>PLAY UWU</button>
</div>

<script>
    import { onMount } from 'svelte';
    import YoutubePlayer from 'yt-player'

    export let videoId

    let element
    let player

    $: if (player && videoId) {
        player.load(videoId, true)
    }

    onMount(() => {
        player = new YoutubePlayer(element, {
            autoplay: true,
            controls: true, // debug only
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
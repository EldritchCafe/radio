<div>
    <h6>PLAY NEXT</h6>

    {#if $next}
        <div class="entry" on:click={() => select($next)}>
            <div class="title">{$next.title}</div>
            <div class="user">shared by {$next.referer.username} <DistanceDate date={$next.date} /></div>
        </div>
    {/if}

    {#if $enqueueing}
        LOADING NEXT
    {/if}


    <h6>HISTORY</h6>

    {#each history as track}
        <div class="entry" class:active={track === $current} on:click={() => select(track)}>
            <div class>{track.title}</div>
            <div class>shared by {track.referer.username} <DistanceDate date={track.date} /></div>
        </div>
    {/each}
</div>

<script>
    import { queue, next, current, enqueueing, select } from '/store.js'
    import DistanceDate from '/components/DistanceDate.svelte'

    $: history = $queue.filter(x => x !== $next).reverse()
</script>

<style>
    .entry {
        padding: 1em 2em;
        cursor: pointer;
    }

    .entry.active {
        background-color: plum;
    }

    .entry.active::before {
        content: "▶️";
    }
</style>
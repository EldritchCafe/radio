<div>
    <h6>PLAY NEXT</h6>

    {#if $next}
        <div class="entry" on:click={() => select($next)}>
            <div class="title">{$next.title}</div>
            <div class="user">by {$next.referer.username}</div>
        </div>
    {/if}

    {#if $enqueueing}
        LOADING NEXT
    {/if}


    <h6>HISTORY</h6>

    {#each history as track}
        <div class="entry" class:active={track === $current} on:click={() => select(track)}>
            <div class>{track.title}</div>
            <div class>shared by {track.referer.username}</div>
        </div>
    {/each}
</div>

<script>
    import { queue, next, current, enqueueing, select } from '/store.js'

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
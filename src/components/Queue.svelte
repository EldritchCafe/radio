<div>
    <h6>PLAY NEXT</h6>
    {#if $next}
        <div class="entry">
            <div class="title">{$next.metadata.title}</div>
            <div class="user">by {$next.status.account.acct}</div>
        </div>
    {/if}

    {#if $enqueueing}
        LOADING NEXT
    {/if}


    <h6>HISTORY</h6>
    {#each $queue as track, i (track.status.id)}
        <div class="entry" class:active={i === $index}>
            <div>
                <button on:click={() => toggle(i)}>
                    {#if i != $index}
                        ▶️
                    {:else if $loading}
                        🕒
                    {:else if $paused}
                        ▶️
                    {:else}
                        ⏸️
                    {/if}
                </button>
            </div>

            <div class="title">{track.metadata.title}</div>
            <div class="user">by {track.status.account.acct}</div>
        </div>
    {/each}
</div>

<script>
    import { onMount } from 'svelte'
    import { next, enqueueing, queue, index, paused, loading, canNext, selectNext } from '/store.js'

    const toggle = i => {
        if (i === $index) {
            $paused = !$paused
        } else {
            $index = i
            $paused = false
        }
    }

    $: if ($queue.length === 0 && $index === null && $next !== null) {
        $queue = [$next]
        $next = null
        $index = 0
    }
</script>

<style>
    .entry {
        padding: 1em 2em;
    }

    .entry.active {
        background-color: plum;
    }
</style>
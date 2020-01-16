<div>
    {#each $queue as track, i}
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

            <div>
                <div>{track.metadata.title}</div>

                <div>
                    <b>{track.status.account.username} <small style="color: dimgray">{track.status.account.acct}</small></b>
                    {track.data.url}
                </div>
            </div>
        </div>
    {/each}

    {#if $enqueueing}
        LOADING ...
    {/if}
</div>

<script>
    import { onMount } from 'svelte'
    import { index, queue, paused, enqueueing, enqueue, loading } from '/store.js'

    const toggle = i => {
        if (i === $index) {
            $paused = !$paused
        } else {
            $index = i
            $paused = false
        }
    }

    onMount(() => {
        enqueue().then(() => {
            $index = 0
        })
    })

    $: if ($index !== null && $index === $queue.length - 1) {
        enqueue()
    }
</script>

<style>
    .entry {
        display: flex;
        border: 1px solid black;
    }

    .entry:hover {
        background-color: rgb(219, 184, 219);
    }

    .entry.active {
        background-color: plum;
    }
</style>
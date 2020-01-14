<div>
    {#each $entries as entry}
        <div class="entry" class:active={entry === $currentEntry}>
            <div>
                <button on:click={() => toggleEntry(entry)}>
                    {#if entry === $currentEntry && !$paused}
                        ⏸️
                    {:else}
                        ▶️
                    {/if}
                </button>
            </div>

            <div>
                <div>{entry.metadata.title}</div>

                <div>
                    <b>{entry.status.account.username} <small style="color: dimgray">{entry.status.account.acct}</small></b>
                    {entry.data.url}
                </div>
            </div>
        </div>
    {/each}

    <button on:click={() => entries.load(5)}>LOAD 5 MOAR</button>
</div>

<script>
    import { onMount } from 'svelte'
    import { paused, entry as currentEntry, entries } from '/stores.js'

    const toggleEntry = (entry) => {
        if (entry !== $currentEntry) {
            $currentEntry = entry
        } else {
            $paused = !$paused
        }
    }

    onMount(() => {
         const unsubscribe = entries.subscribe(async (xs) => {
            if (xs.length) {
                const [firstEntry] = xs
                currentEntry.set(firstEntry)
                unsubscribe()
            }
        })

        entries.load(1)
    })
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
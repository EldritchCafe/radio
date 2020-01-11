<main class="app">
    <header class="header">
        <h1>Eldritch Radio</h1>
    </header>

    <section class="viewer">
        <Viewer></Viewer>
    </section>

    <section class="queue">
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
        </div>

        <button on:click={() => entries.load(5)}>LOAD 5 MOAR</button>
    </section>

    <section class="controls">
        <Controls></Controls>
    </section>
</main>


<script>
    import { onMount } from 'svelte'
    import Controls from '/components/Controls.svelte'
    import Viewer from '/components/Viewer.svelte'
    import { paused, entry as currentEntry, entries } from '/store.js'

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
    .app {
        min-width: 100%;
        min-height: 100%;

        display: grid;

        grid-template-columns: 1fr;

        grid-template-areas:
            "header"
            "viewer"
            "queue"
            "controls";
    }

    .header {
        grid-area: header;
        position: sticky;
        top: 0;
        background: blueviolet;
        color: whitesmoke;

        padding: 0.4rem 0.8rem;
    }

    .header h1 {
        margin: 0;
    }

    .viewer {
        grid-area: viewer;
    }

    .queue {
        grid-area: queue;
    }

    .controls {
        grid-area: controls;
        width: 100%;

        position: sticky;
        bottom: 0;

        background: whitesmoke;
    }

    @media (min-width: 992px) {
        .app {
            grid-template-columns: 2fr 3fr;
            grid-template-rows: auto 1fr auto;

            grid-template-areas:
                "header queue"
                "viewer queue"
                "controls controls"
        }
    }

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
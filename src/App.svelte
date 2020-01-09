<main class="app">
    <header class="header">
        <h1>
            Eldritch Radio
        </h1>
    </header>

    <section class="player">
        {#if $selectedEntry}
            Playing <a href={$selectedEntry.url}>{$selectedEntry.id}</a>
            <YoutubeViewer bind:videoId={$selectedEntry.id} bind:playing={$playing}></YoutubeViewer>
        {:else}
            Loading ...
        {/if}

        <div>
            <button>⏮️</button>
            <button on:click={() => $playing = !$playing}>{#if $playing}⏸️{:else}▶️{/if}</button>
            <button on:click={() => selectedEntry.next()}>⏭️</button>
        </div>

        <div>
            <button>🔇 / 🔊</button>
            <input type="range" min="0" max="100" value="80">
        </div>

        <div>
            <button>⭐</button>
            <button>🔁</button>
        </div>
    </section>

    <section class="queue">
        <div>
            {#if $entries}
                <ul>
                    {#each $entries as entry}
                        <li class="entry" class:active={entry === $selectedEntry} on:click={() => $selectedEntry = entry}>
                            <div>{entry.url}</div>
                            <b>{entry.status.account.acct}</b>
                            <small>{entry.tags}</small>
                        </li>
                    {/each}
                </ul>
            {:else}
                Your queue
            {/if}
        </div>

        {#if $loading}
            LOADING ...
        {:else}
            <button on:click={() => entries.load(3)}>LOAD MOAR</button>
        {/if}

        <header>
            <a href="https://{$domain}/">{$domain}</a> - {@html $hashtags.map(hashtag => `<a href="https://${$domain}/tags/${hashtag}">#${hashtag}</a>`)}
        </header>
    </section>
</main>


<script>
    import { onMount } from 'svelte'
    import YoutubeViewer from './YoutubeViewer.svelte'
    import { domain, hashtags, playing, loading, entry as selectedEntry, entries } from './store.js'

    onMount(() => {
        const unsub = entries.subscribe(async (xs) => {
            if (xs.length) {
                const [firstEntry] = xs
                selectedEntry.set(firstEntry)
                unsub()
            }

        })

        entries.load(7)
    })
</script>

<style>
    .app {
        display: grid;

        grid-template-columns: 1fr;

        grid-template-areas:
            "header"
            "player"
            "queue";
    }

    .header {
        grid-area: header;
    }

    .player {
        grid-area: player;
    }

    .queue {
        grid-area: queue;
    }

    @media (min-width: 992px) {
        .app {
            grid-template-columns: 2fr 3fr;
            grid-template-rows: auto 1fr;

            grid-template-areas:
                "header queue"
                "player queue"
        }
    }

    .entry {
        cursor: pointer;
        border: 1px solid black;
    }

    .entry:hover {
        background-color: plum;
    }

    .entry.active {
        background-color: plum;
    }
</style>
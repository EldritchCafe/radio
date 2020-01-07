<main class="app">
    <header class="header">
        <h1>
            Eldritch Radio
        </h1>
    </header>

    <section class="player">
        {#if selectedEntry}
            Playing <a href={selectedEntry.url}>{selectedEntry.url}</a>
        {:else}
            Loading ...
        {/if}
    </section>

    <section class="queue">
        {#await entriesPromise}
            Loading radio please wait
        {:then entries}
            <ul>
                {#each entries as entry}
                    <li>
                        <a href={entry.url}>{entry.url}</a>
                        <small>{entry.tags}</small>
                    </li>
                {/each}
            </ul>
        {:catch error}
            Oops, something went wrong : {error}
        {/await}

        <header>
            <a href="https://{domain}/">{domain}</a> - {@html hashtags.map(hashtag => `<a href="https://${domain}/tags/${hashtag}">#${hashtag}</a>`)}
        </header>
    </section>
</main>


<script>
    import { onMount } from 'svelte';
    import { fetchEntries } from './util.js'

    export let domain
    export let hashtags

    let entriesPromise = new Promise(() => {})
    let selectedEntry = null

    onMount(() => {
        entriesPromise = fetchEntries(domain, hashtags)

        entriesPromise.then(entries => {
            [selectedEntry] = entries
        })
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
</style>
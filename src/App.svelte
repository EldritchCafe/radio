<main class="app">
    <header class="header">
        <h1>
            Eldritch Radio
        </h1>
    </header>

    <section class="player">
        {#if selectedEntry}
            Playing <a href={selectedEntry.url}>{selectedEntry.id}</a>
            <YoutubeViewer bind:videoId={selectedEntry.id}></YoutubeViewer>
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
                    <li class="entry" class:active={entry === selectedEntry} on:click={selectEntry(entry)}>
                        <b>{entry.status.account.acct}</b>
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
    import { onMount } from 'svelte'
    import { fetchEntries } from './util.js'
    import YoutubeViewer from './YoutubeViewer.svelte'

    export let domain
    export let hashtags

    let entriesPromise = new Promise(() => {})
    let selectedEntry = null

    const selectEntry = entry => {
        selectedEntry = entry
    }

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

    .entry {
        cursor: pointer;
    }

    .entry.active {
        background-color: plum;
    }
</style>
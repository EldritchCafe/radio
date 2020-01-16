<main class="app">
    <header class="header">
        <h1>Eldritch Radio</h1>
    </header>

    <section class="viewer">
        {#if $current}
            <Viewer></Viewer>
        {/if}
    </section>

    <section class="queue">
        <Queue></Queue>


    </section>

    <section class="controls">
        <Controls></Controls>
    </section>
</main>


<script>
    import Controls from '/components/Controls.svelte'
    import Queue from '/components/Queue.svelte'
    import Viewer from '/components/Viewer.svelte'

    import { current } from '/store.js'
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
</style>
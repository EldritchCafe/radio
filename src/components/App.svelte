<Router>
    {#each routes as { duplex, component }}
        <Route path={duplex.spec} component={component} />
    {/each}
</Router>

<script>
    import { Router, Route } from 'svelte-routing'
    import { home, share } from '/src/routes.js'
    import Home from '/src/routes/Home.svelte'
    import Share from '/src/routes/Share.svelte'

    const pair = (duplex, component) => ({ duplex, component })

    const routes = [
        pair(share, Share),
        pair(home, Home)
    ]
</script>

<Router>
    {#each routes as { duplex, component }}
        <Route path={duplex.spec} component={component} />
    {/each}
</Router>

<script>
    import { Router, Route } from 'svelte-routing'
    import { home, share } from '/routes.js'
    import Home from '/routes/Home.svelte'
    import Share from '/routes/Share.svelte'

    const pair = (duplex, component) => ({ duplex, component })

    const routes = [
        pair(share, Share),
        pair(home, Home)
    ]
</script>
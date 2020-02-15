<Radio />

<script>
    import { onMount } from 'svelte'
    import Radio from '/components/Radio.svelte'
    import { fetchStatus } from '/services/mastodon.js'

    export let domain
    export let statusId


    onMount(async () => {
        const status = await fetchStatus(domain, statusId)
        console.log(`Status ${statusId} from ${domain} shared`)
    })
</script>
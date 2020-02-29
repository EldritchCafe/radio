<div class="">
    {#each tags as tag, index}
        <span>{tag} <span class="" on:click={() => remove(index)}>×</span></span>
    {/each}

    <input type="text" on:keydown={onKeyDown} />
</div>

<script>
    import { createEventDispatcher } from 'svelte'

    export let value = []

    const dispatch = createEventDispatcher()

    $: tags = value

    const add = tag => {
        tags = [...tags, tag]
        dispatch('change', tags)
    }

    const remove = index => {
        tags = [...tags.slice(0, index), ...tags.slice(index + 1)]
        dispatch('change', tags)
    }

    const onKeyDown = event => {
        const { keyCode, target: { value } } = event

        switch (keyCode) {
            case 13:
                event.preventDefault()

                if (value !== '' && tags.indexOf(value) === -1) {
                    add(value)
                }

                event.target.value = ''
                break

            case 8:
                if (tags.length > 0 && value === '') {
                    remove(tags.length - 1)
                }

                break
        }
    }
</script>
<div class="svelte-tags-input-layout">
    {#each tags as tag, index}
        <span class="svelte-tags-input-tag">{tag} <span class="svelte-tags-input-tag-remove" on:click={() => remove(index)}>×</span></span>
    {/each}
    <input type="text" class="svelte-tags-input" on:keydown={onKeyDown} />
</div>

<script>
    import { createEventDispatcher } from 'svelte'

    export let value = []

    const dispatch = createEventDispatcher()

    $: tags = value

    const update = () => {
        value = tags
        dispatch('change', tags)
    }

    const add = tag => {
        tags = [...tags, tag]
        update()
    }

    const remove = index => {
        tags = [...tags.slice(0, index), ...tags.slice(index + 1)]
        update()
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
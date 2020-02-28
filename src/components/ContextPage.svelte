{#if open}
    <div class="context">
        <div class="container">
            <div class="context-head">
                <h1 class="context-name">{ name }</h1>
                <button class="context-close" on:click={() => close()}>
                    <div class="context-close__icon"><Close></Close></div>
                    <div class="context-close__label">Close</div>
                </button>
            </div>
            <div class="context-content">
                <slot></slot>
            </div>
        </div>
    </div>
{/if}

<script>
	import { createEventDispatcher } from 'svelte'
    import Close from '/components/icons/context/close'

	const dispatch = createEventDispatcher();

    export let open
    export let name

    // Scroll position recover
    $: {
        if (open) {
            const scrollPosition = window.scrollY
            document.body.setAttribute('data-scroll', scrollPosition)
            document.body.classList.add('contextEnabled')            
        } else {
            document.body.classList.remove('contextEnabled')
            const scrollPosition = document.body.getAttribute('data-scroll')
            window.scrollTo({
                top: scrollPosition,
                behavior: 'instant'
            })
            document.body.removeAttribute('data-scroll')
        }
    }

    let close = () => {
        dispatch('close')
    }
</script>
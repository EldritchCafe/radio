<span bind:this={btn} on:click={() => openMenu()}>
    <slot name="btn">
        <button>button</button>
    </slot>
</span>

<div class="contextMenu__overlay" class:active={isActive} on:click={() => closeMenu()}></div>
<div class="contextMenu" bind:this={content} class:active={isActive}>
    <slot name="content">
        No content
    </slot>
</div>

<script>
import { onMount } from 'svelte';
import { createPopper } from '@popperjs/core';
import detectOverflow from '@popperjs/core/lib/utils/detectOverflow.js';

let btn
let content
let isActive = false

function openMenu () {
    isActive = true
}

function closeMenu () {
    isActive = false
}

onMount(() => {
    createPopper(btn, content, {
    placement: 'left-start',
    modifiers: [
        {
            name: 'offset',
            options: {
                offset: ({ reference, popper }) => {
                    return [-10, -reference.width - 5];
                }
            }
        },
        {
            name: 'myModifier',
            enabled: true,
            phase: 'main',
            requiresIfExists: ['offset'],
            fn({ state }) {
                const overflow = detectOverflow(state);
            }
        }
    ]
    });
});
</script>
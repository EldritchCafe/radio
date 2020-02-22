<span bind:this={btn} on:click={() => open()}>
    <slot name="btn">
        <button>button</button>
    </slot>
</span>

<div class="contextMenu__overlay" class:active={isActive} on:click={() => close()}></div>
<div class="contextMenu" bind:this={content} class:active={isActive}>
    <slot name="content">
        No content
    </slot>
</div>

<script>
import { onMount, setContext } from 'svelte'
import { createPopper } from '@popperjs/core';
import detectOverflow from '@popperjs/core/lib/utils/detectOverflow.js';

let btn
let content
let isActive = false
export let needOffset

export function open () {
    isActive = true
}

export function close () {
    isActive = false
}

setContext('openMenu', open)
setContext('closeMenu', close)

onMount(() => {
    createPopper(btn, content, {
    placement: 'left-start',
    modifiers: [
        {
            name: 'offset',
            options: {
                offset: ({ reference, popper }) => {
                    if (needOffset) {
                        return [-10, -reference.width - 5];
                    } else {
                        return [5, -reference.width - 5];
                    }
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
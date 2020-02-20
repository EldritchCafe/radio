<button class="controls__playpause" class:disabled={ $current === null || $loading} on:click>
    <svg width="47" height="46" viewBox="0 0 47 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        {#if !$paused}
            <path class="pause" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M23.503 46C36.2738 46 46.6266 35.7025 46.6266 23C46.6266 10.2975 36.2738 0 23.503 0C10.7322 0 0.379395 10.2975 0.379395 23C0.379395 35.7025 10.7322 46 23.503 46ZM17 16C17 14.8954 17.8954 14 19 14C20.1046 14 21 14.8954 21 16V30C21 31.1046 20.1046 32 19 32C17.8954 32 17 31.1046 17 30V16ZM29 14C27.8954 14 27 14.8954 27 16V30C27 31.1046 27.8954 32 29 32C30.1046 32 31 31.1046 31 30V16C31 14.8954 30.1046 14 29 14Z"/>
        {:else }
            <path class="play" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M46.6232 23C46.6232 35.7025 36.2704 46 23.4996 46C10.7288 46 0.375977 35.7025 0.375977 23C0.375977 10.2975 10.7288 0 23.4996 0C36.2704 0 46.6232 10.2975 46.6232 23ZM32.4949 23.844C33.1131 23.4512 33.1131 22.5489 32.4949 22.156L20.4942 14.5299C19.8285 14.1068 18.9579 14.5851 18.9579 15.3739V30.6261C18.9579 31.4149 19.8285 31.8932 20.4942 31.4701L32.4949 23.844Z"/>
        {/if}
    </svg>
</button>

<script>
    import { getContext } from 'svelte'

    const paused = getContext('paused')
    const current = getContext('current')
    const loading = getContext('loading')
</script>
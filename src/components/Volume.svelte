<div class="volume">
    <div class="volume__bg"></div>
    <div class="volume__progress" style="width: {volumePercent}%;"></div>
    <input class="volume__input" type="range" min="0" max="100" step="20" bind:value={$volume}>
</div>

<!-- for mask -->
<svg width="0" height="0">
    <clipPath id="volume">
        <path fill="#C4C4C4" d="M40,15.201328 L40,1.80052901 C40,0.518480567 38.6821237,-0.351956175 37.4843106,0.138924799 L0.562431379,15.2698574 C-0.356904919,15.6466792 -0.0844775345,17 0.910700368,17 L38.1808595,17 C39.1855708,17 40,16.1947345 40,15.201328 Z"/>
    </clipPath>
</svg>

<script>
    import { volume } from '/store.js'

    // to fix visual glitch
    $: volumePercent = $volume ? $volume -2 : 0
</script>
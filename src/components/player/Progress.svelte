<div class="playerProgress">
    <div class="playerProgress__progress">
        <div class="playerProgress__progressBg"></div>
        <div class="playerProgress__progressBgProgress" style="width:{currentPercent}%;"></div>
        <input
            class="playerProgress__progressInput"
            type="range"
            min="0"
            max={duration}
            value="{currentTime}"
            on:input
            on:change
            disabled={currentTime === null || duration === null}
        >
    </div>
    <div class="playerProgress__timecode">
        <div class="playerProgress__timecodeItem">{currentTimeText}</div>
        <div class="playerProgress__timecodeItem">{durationText}</div>
    </div>
</div>
<script>
    export let duration
    export let currentTime
    export let currentTimeText
    export let durationText

    $: currentPercent = currentTime ? (currentTime / duration) * 100 : 0
</script>
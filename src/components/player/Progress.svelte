<div class="playerProgress">
    <div class="playerProgress__progress">
        <div class="playerProgress__progressBg"></div>
        <div class="playerProgress__progressBgProgress" style="width:{currentPercent}%;"></div>
        <input
            class="playerProgress__progressInput"
            type="range"
            min="0"
            max={max}
            value={value}
            on:input
            on:change
            disabled={disabled}
        >
    </div>
    <div class="playerProgress__timecode">
        <div class="playerProgress__timecodeItem" class:placeholder={!ready}>{currentTimeText}</div>
        <div class="playerProgress__timecodeItem" class:placeholder={!ready}>{durationText}</div>
    </div>
</div>
<script>
    import { secondsToElapsedTime } from '/services/misc.js'

    export let ready
    export let currentTime
    export let duration

    $: value = currentTime != null ? currentTime : 0
    $: max = duration != null ? duration : 0
    $: disabled = currentTime == null || duration == null

    $: currentTimeText = currentTime != null ? secondsToElapsedTime(currentTime) : '--:--'
    $: durationText = duration != null ? secondsToElapsedTime(duration) : '--:--'

    $: currentPercent = currentTime != null ? (currentTime / duration) * 100 : 0
</script>
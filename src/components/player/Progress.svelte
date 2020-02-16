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
            disabled={currentTime === null || duration === null}
        >
    </div>
    <div class="playerProgress__timecode">
        <div class="playerProgress__timecodeItem" class:placeholder={!ready}>{currentTimeText}</div>
        <div class="playerProgress__timecodeItem" class:placeholder={!ready}>{durationText}</div>
    </div>
</div>
<script>
    import { secondsToElapsedTime } from '/services/misc.js'

    export let duration
    export let currentTime
    export let ready

    $: value = currentTime != null ? currentTime : 0
    $: max = duration != null ? duration : 100
    $: currentPercent = currentTime != null ? (currentTime / duration) * 100 : 0
    $: currentTimeText = currentTime != null ? secondsToElapsedTime(currentTime) : '--:--'
    $: durationText = duration != null ? secondsToElapsedTime(duration) : '--:--'
</script>
<button class="header__sideBtn" on:click={() => openPage()}>Settings</button>
<Portal target="{document.body}">
    <ContextPage name="Settings" open={open} on:close={closePage}>
    <div class="settings">
        <div class="settings-line">
            <div class="settings-side">
                <div class="settings-side__title">Instance</div>
                <div class="settings-side__subtitle">The mastodon instance from the toods are fetched</div>
            </div>
            <div class="settings-main">
                <input class="f-size-full" type="text" value="https://eldritch.cafe">
            </div>
        </div>
        <div class="settings-line">
            <div class="settings-side">
                <div class="settings-side__title">Tags</div>
                <div class="settings-side__subtitle">What hashtags are fetched</div>
            </div>
            <div class="settings-main">
                <Tags
                    allowPaste={true}
                />
            </div>
        </div>
        <div class="settings-line">
            <div class="settings-side">
                <div class="settings-side__title">Max duration</div>
                <div class="settings-side__subtitle">Hide tracks above this duration</div>
            </div>
            <div class="settings-main">
                <div class="radiobox radiobox--full">
                    <input type="radio" id="10min" name="drone" value="10">
                    <label for="10min">10 min</label>
                    <input type="radio" id="20min" name="drone" value="20" checked>
                    <label for="20min">20 min</label>
                    <input type="radio" id="1hour" name="drone" value="60">
                    <label for="1hour">1 hour</label>
                    <input type="radio" id="nolimit" name="drone" value="null">
                    <label for="nolimit">No limit</label>
                </div>
            </div>
        </div>
    </div>
    </ContextPage>
</Portal>

<script>
    import Portal from 'svelte-portal'
    import ContextPage from '/components/ContextPage'
    import Tags from "svelte-tags-input";

    let open = true

    let openPage = () => {
        open = true
    }

    let closePage = () => {
        open = false
    }
</script>
<button class="header__sideBtn" on:click={() => openPage()}>About</button>
<Portal target="{document.body}">
    <ContextPage name="About" open={open} on:close={closePage}>
        <p class="txtbig">This radio is powered by the publications made on the social media platform <a href="https://joinmastodon.org/" target="_blank">Mastodon</a>. The goal behind it is to make a place to discover music outside your usual bubble. Hope you enjoy it!</p>
        <hr>
        <h2>Where does the music come from?</h2>
        <p>The app gets all the public publications that contain a media link and a music hashtag (you can configure it in the Settings). We support only Youtube links for now, but more platforms are planned in the future.<br>
        We don’t own the musics rights so the songs are played on the original platform player.</p>
        <h2>How can I get my song be played on the radio?</h2>
        <p>You have to make a public toot containing one of the hashtags configured on the app and a Youtube link.</p>
        <h2>Can I use the radio on my phone?</h2>
        <p>It’s a webapp so it should be working, however since the Youtube Player allows us to play a song only when you’re on the web and stops when the screen turns off or when you’re on another app, it’s kind of unusable.<br>
        It’s kind of shitty but as long Youtube has this behavior we don’t see a way to make a great experience for the radio on mobile devices.</p>
        <h2>How can I contact you? I’ve detected a problem, have an idea, or a kind message.</h2>
        If you’re a developer you can create an issue on the <a href="https://github.com/EldritchCafe/radio" target="_blank">Github repo</a>. For anything else you can contact the maintainers <a href="https://mastodon.guerilla.studio/@milia" target="_blank">Milia</a> & <a href="https://mastodon.guerilla.studio/@tixie" target="_blank">Tixie</a> on their Mastodon accounts.
    </ContextPage>
</Portal>

<script>
    import Portal from 'svelte-portal'
    import ContextPage from '/src/components/ContextPage'

    let open = false

    let openPage = () => {
        open = true
    }

    let closePage = () => {
        open = false
    }
</script>

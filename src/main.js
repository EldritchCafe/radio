import App from './App.svelte'

const app = new App({
    target: document.body,
    props: {
        domain: 'eldritch.cafe',
        hashtags: [
            'np',
            'nowplaying',
            'tootradio',
            'pouetradio'
        ]
    }
})

export default app
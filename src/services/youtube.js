const IFRAME_API_URL = 'https://www.youtube.com/iframe_api'

export const STATE = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5
}

const loadScript = (attributes) => {
    return new Promise((resolve, reject) => {
        if (!attributes.hasOwnProperty('src')) {
            throw new Error('src is required')
        }

        // // we could optimize futher by checking if a script with iframe api as src is already loading
        // const scripts = Array.from(document.getElementsByTagName('script'))
        //     .filter(script => script.src === attribute.src)

        // if (scripts.length) {
        //     if (scripts.some(script => script.readyState.complete)) {

        //     }
        // } else {

        // }

        const script = document.createElement('script')

        for (const [name, value] of Object.entries(attributes)) {
            script[name] = value
        }

        script.onload = (e) => {
            script.onload = script.onerror = null
            resolve(e.target)
        }

        script.onerror = (e) => {
            script.onload = script.onerror = null
            reject(e)
        }

        document.head.appendChild(script)
    })
}

export const loadIframeApi = async () => {
    return new Promise((resolve, reject) => {
        if (window.YT && typeof window.YT.Player === 'function') {
            resolve(window.YT)
        } else {
            const previousInitializer = window.onYouTubeIframeAPIReady

            window.onYouTubeIframeAPIReady = () => {
                window.onYouTubeIframeAPIReady = previousInitializer
                resolve(window.YT)
            }

            loadScript({ src: IFRAME_API_URL })
        }
    })
}
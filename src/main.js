import 'core-js/stable'
import 'core-js/proposals'
import 'regenerator-runtime/runtime'

import App from '/components/App.svelte'

const app = new App({
    target: document.body
})

export default app
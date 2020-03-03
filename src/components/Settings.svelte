<button class="header__sideBtn" on:click={() => openPage()}>Settings</button>
<Portal target="{document.body}">
    <ContextPage name="Settings" open={open} on:close={closePage}>

    <form class="settings" on:submit={handleSubmit}>
        <div class="settings-line">
            <div class="settings-side">
                <div class="settings-side__title">Instance</div>
                <div class="settings-side__subtitle">The mastodon instance from the toods are fetched</div>
            </div>
            <div class="settings-main">
                <input class="f-size-full error" type="text" id="domain" name="domain" on:change={handleChange} bind:value={$form.domain}>
                <div class="notif notif--error">Le format n'est pas bon, déso</div>
            </div>
            {#if $errors.domain}
                <span>{$errors.domain}</span>
            {/if}
        </div>
        <div class="settings-line">
            <div class="settings-side">
                <div class="settings-side__title">Tags</div>
                <div class="settings-side__subtitle">What hashtags are fetched</div>
            </div>
            <div class="settings-main">
                <TagInput on:change={handleCustomChange('hashtags')} bind:value={$form.hashtags} />
            </div>
            <!-- {#if $errors.hashtags}
                <span>{$errors.hashtags}{console.log($errors.hashtags)}</span>
            {/if} -->
        </div>
        <!-- <div class="settings-line">
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
        </div> -->
        <button class="btn btn--primary w100" type="submit">Save the changes</button>
    </form>
    </ContextPage>
</Portal>

<script>
    import { getContext } from 'svelte'
    import { createForm } from 'svelte-forms-lib'
    import * as yup from 'yup'
    import Portal from 'svelte-portal'
    import ContextPage from '/components/ContextPage'
    import TagInput from '/components/TagInput'

    const domain = getContext('domain')
    const hashtags = getContext('hashtags')

    const {
        form,
        errors,
        handleChange,
        handleSubmit
    } = createForm({
        initialValues: {
            domain: $domain,
            hashtags: $hashtags
        },
        // validationSchema: yup.object().shape({
        //     domain: yup.string()
        //         .required()
        //         .trim()
        //         .test(
        //             'is-valid-domain',
        //             '${path} is not a valid domain',
        //             async domain => (await fetch(`https://${domain}/api/v1/instance`)).status === 200
        //         ),
        //     // hashtags: yup.array()
        //         // .required()
        //         // .of(yup.string()
        //         //     .ensure()
        //         //     .required()
        //         //     .trim()
        //         //     .matches('/[a-z0-9]+/i')
        //         // )
        //         // .min(1)
        //         // .min(5)
        // }),
        onSubmit: values => {
            $domain = values.domain
            $hashtags = values.hashtags
            location.reload() // for now
        }
    })

    const handleCustomChange = name => event => handleChange({ target: { name, value: event.detail } })

    let open = false

    let openPage = () => {
        open = true
    }

    let closePage = () => {
        open = false
    }
</script>
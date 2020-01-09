export { default as getUrls } from 'get-urls'
export { default as getYoutubeId } from 'get-youtube-id'

export function isSupportedUrl(url) {
    return (new URL(url)).hostname === 'youtube.com'
}

export function intersection(xs, ys) {
    return xs.filter(x => ys.includes(x));
}
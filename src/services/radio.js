import { asyncPrepend } from 'iter-tools'
import { hashtagsIterator } from '/services/mastodon.js'
import { tracksIterator } from '/services/misc.js'

export const radioIterator = (domain, hashtags, cache) =>
    tracksIterator(hashtagsIterator(domain, hashtags), cache)

export const radioShareIterator = (track, domain, hashtags, cache) =>
    tracksIterator(asyncPrepend(track, hashtagsIterator(domain, hashtags)), cache)
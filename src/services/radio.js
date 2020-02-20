import { asyncConcat } from 'iter-tools'
import { hashtagsIterator, statusIterator } from '/services/mastodon.js'
import { tracksIterator } from '/services/misc.js'

export const radioIterator = (domain, hashtags, cache) =>
    tracksIterator(hashtagsIterator(domain, hashtags), cache)

export const radioShareIterator = (refererCredentials, domain, hashtags, cache) =>
    tracksIterator(asyncConcat(statusIterator(refererCredentials), hashtagsIterator(domain, hashtags)), cache)
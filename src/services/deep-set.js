export default class DeepSet {
    constructor() {
        this.map = new Map()
        this.set = new Set()
    }

    _reduce(path) {
        return path.reduce((context, key) => {
            if (context.map.has(key)) {
                return context.map.get(key)
            } else {
                const newContext = new DeepSet()
                context.map.set(key, newContext)
                return newContext
            }
        }, this).set
    }

    has(values) {
        const { keys, value } = destruct(values)
        return this._reduce(keys).has(value)
    }

    add(values) {
        const { keys, value } = destruct(values)
        return this._reduce(keys).add(value)
    }
}

const destruct = xs => {
    switch (xs.length) {
        case 0:
            return { keys: [], value: undefined }

        case 1:
            return { keys: [], value: xs[0] }

        default:
            return { keys: xs.slice(0, xs.length - 1), value: xs.slice(-1)[0] }
    }
}
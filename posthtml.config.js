module.exports = {
    plugins: {
        "posthtml-expressions": {
            locals: {
                INSTANCE: process.env.INSTANCE || 'eldritch.cafe'
            }
        }
    }
};

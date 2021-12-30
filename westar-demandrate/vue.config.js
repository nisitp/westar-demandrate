/*module.exports = {
    baseUrl: process.env.NODE_ENV === 'production'
        ? 'http://clients.hotsauceatl.com/westar/westar-demandrate/dist/'
        : '/',
};*/

module.exports = {
    baseUrl: process.env.NODE_ENV === 'production'
        ? './'
        : '/',
};
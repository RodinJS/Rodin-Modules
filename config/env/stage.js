export default {
    env: 'stage',
    jwtSecret: '4DNSrMPuQ3Y3McBu96wd2GzGheDXuft8gDqLEQVWHnXQfcaGFtM2ZBgyNYzPN7CK',
    API: 'https://api.rodin.design/api',
    db: {
        username:'root',
        host:'178.62.229.191',
        port:22,
        dstPort:27017,
        url:'mongodb://localhost:27017/rodin-js-api-development'
    },

    modules: {
        socketService: {
            URL:'https://stage.modules.rodin.io',
            port: 4002,
        }
    }
};

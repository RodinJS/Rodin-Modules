export default {
    env: 'development',
    jwtSecret: '4DNSrMPuQ3Y3McBu96wd2GzGheDXuft8gDqLEQVWHnXQfcaGFtM2ZBgyNYzPN7CK',
    db: 'mongodb://localhost/rodin-js-api-development',
    modules: {
        socketService: {
            URL:'https://modules.rodin.io',
            port: 4000,
        }
    }
};

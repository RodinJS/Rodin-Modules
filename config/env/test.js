export default {
    env: 'test',
    jwtSecret: '4DNSrMPuX3Y3McBu96wd2GzGheDX4ft8gDqLEQVWHnXQfcaGFtM2ZBgyNYzPN87F',
    db: 'mongodb://localhost/rodin-js-api-test',
    modules: {
        socketService: {
            URL: 'http://localhost:4000',
            port: 4000,
        }
    }
};

export default {
  env: 'local',
  jwtSecret: '4DNSrMPuQ3Y3McBu96wd2GzGheDXuft8gDqLEQVWHnXQfcaGFtM2ZBgyNYzPN7CK',
  db: 'mongodb://localhost/rodin-js-api-development',
  API: 'http://localhost:3000/api',
  modules:{
    socketService:{
      URL:'http://localhost:4000',
      port:4000,
    }
  }

};

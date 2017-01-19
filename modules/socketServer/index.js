import config from '../../config/env';
import app from '../../config/express';
import apiSocket from './apiSocket';
const debug = require('debug')('rodin-ja-api:index');
import https from 'https';
import fs from 'fs';
let server = false;

if(process.env.NODE_SSL){
    const privateKey  = fs.readFileSync(`${__dirname}/../../../certificate/private.key`, 'utf8');
    const certificate = fs.readFileSync(`${__dirname}/../../../certificate/cert.crt`, 'utf8');
    let credentials = {key: privateKey, cert: certificate};
    let httpsServer = https.createServer(credentials, app);
    httpsServer.listen(config.modules.socketService.port);
    apiSocket.run(httpsServer);
}
else{
    // listen on port config.port
    server = app.listen(config.modules.socketService.port, () => {
        debug(`server started on port ${config.modules.socketService.port} (${config.env})`);
    });
    apiSocket.run(server);
}


export default app;

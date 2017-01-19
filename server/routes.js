import express from 'express';
import socketServiceRouter from '../modules/socketServer/router';
import _ from 'lodash';

const router = express.Router();	// eslint-disable-line new-cap

const apiRoutes = {
    socketServer: {
        route: '/socket-server',
        module: [socketServiceRouter],
    }
};
/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
    res.send('OK')
);

_.each(apiRoutes, (route, key) => {
    router.use(route.route, route.module);
});

export default router;

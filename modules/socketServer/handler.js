/**
 * Created by xgharibyan on 1/12/17.
 */

import SubscribedModules  from '../../server/models/subscribe';
import AssignedModules from '../../server/models/assigned';
import APIError from '../../server/helpers/APIError';
import httpStatus from '../../server/helpers/httpStatus';
import fs from 'fs';
import _ from 'lodash';


function validate(req, res, next) {
    if (_.isUndefined(req.query.projectId)) {
        const err = new APIError('Provide project Id', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    AssignedModules.get(req.query.projectId)
        .then(project => {
            if(!project){
                req.error = 'Module not assigned to current project';
                return next();
            }
            project = project.toObject();

            SubscribedModules.getByOwnerAndModuleId(project.owner, project.moduleId)
                .then(subscribed=>{

                    if(!subscribed){
                        req.error = 'Module not purchased';
                        return next();
                    }

                    subscribed = subscribed.toObject();
                    if(new Date(subscribed.expiredAt) <= new Date()){
                        req.error = 'Subscription expired';
                        return next();
                    }
                    const hostname = ( req.headers.host.match(/:/g) ) ? req.headers.host.slice(0, req.headers.host.indexOf(":")) : req.headers.host;
                    if (_.indexOf(project.allowedHosts, hostname) < 0) {
                        req.error = 'Module not support following host';
                        return next();
                    }
                    req.project = project;
                    return next();

                })
                .catch(err=>{
                    req.error = 'Module not purchased';
                    return next();
                });

        })
        .catch(error => {
            req.error = 'Module not purchased';
            return next();
        })
}

function serverFile(req, res) {
    let content = '';
    if (!req.project) {
        content = `var error = '${req.error}';\n throw new Error(error);`;
    }
    else{
        const socketIO = fs.readFileSync(`${__dirname}/../../../node_modules/socket.io-client/dist/socket.io.js`, 'utf8');
        const clinetJS = fs.readFileSync(`${__dirname}/client.js`, 'utf8');
        content = socketIO+clinetJS;
    }
    res.setHeader('content-type', 'text/javascript');
    return res.send(content)
}

export default {validate, serverFile}
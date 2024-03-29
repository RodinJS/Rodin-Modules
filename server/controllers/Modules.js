/**
 * Created by xgharibyan on 6/8/17.
 */

import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import fsExtra from 'fs-extra';
import fs from 'fs';
import _ from 'lodash';
import config from '../../config/env';
import request from 'request-promise';
import StrDecoder from 'string_decoder';
import busterSyntax from 'buster-syntax';

import CP from 'google-closure-compiler';
const ClosureCompiler = CP.compiler;

const StringDecoder = StrDecoder.StringDecoder;
const syntax = busterSyntax.syntax;
const HookSecretKey = 'K7rd6FzEZwzcc6dQr3cv9kz4tTTZzAc9hdXYJpukvEnxmbdB42V4b6HePs5ZDTYLW_4000dram_module';
const APIURL = config.API;

function validate(req, res, next) {
    if (_.isUndefined(req.query.projectId)) {
        const err = new APIError('Provide project Id', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const options = {
        method: 'GET',
        uri: `${APIURL}/modules/hook/validate`,
        qs:{
            'projectId':req.query.projectId
        },
        headers: {
            'x-access-token': HookSecretKey,
            'referer':req.headers.referer
        },
        json: true,
    };


    request(options)
        .then((response) => {
            req.modules = response.success ? response.data : false;
            return next();
        })
        .catch((err)  => {
            req.error  = err.error.error ? err.error.error.message : 'Please contact with support';
            return next();
        });


}

function serverFile(req, res) {

    req.modules = req.body.modules || req.modules;

    let content = '';
    if (!req.modules || req.modules.length <= 0) {
        content += `var error = '${req.error || 'No assigned modules'}';\n throw new Error(error);`;
    }
    else{
        _.each(req.modules, (moduleData, key)=>{
            if(moduleData.error){
                content += `var error = '${moduleData.error || 'Bad request'}';\n throw new Error(error);`;
            }
            const module = moduleData.module;
            const moduleOwnerDirName = module.author == 'Rodin team' ? 'rodin' : 'users';
            const moduleGlobalDir = `${__dirname}/../../../publicModules/${moduleOwnerDirName}/`;
            const moduleDir = `${moduleGlobalDir}${module.url}`;
            const indexFile = `${moduleDir}/client.js`;


           /* if(module.url += 'socketServer'){
                const socketIoPath = `${moduleGlobalDir}socket.io.js`;
                const socketIO = `${__dirname}/../../../node_modules/socket.io-client/dist/socket.io.js`;

                //(function () {\n%output%\n}())

                //content += `${fs.readFileSync(socketIO, 'utf8')}\n\n\n`;
                content += `\n${fs.readFileSync(socketIoPath, 'utf8')}\n\n`;

            }*/
            content += `\n${fs.readFileSync(indexFile, 'utf8')}\n\n`;
        });
    }
    res.setHeader('content-type', 'text/javascript');
    return res.send(content)
}

function getModule(req, res, next) {
    const moduleID = req.body.moduleId || req.query.moduleId || req.params.moduleId;
    if (_.isUndefined(moduleID)) {
        const err = new APIError('Provide moduleId', httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const options = {
        method: 'GET',
        uri: `${APIURL}/modules/hook/${moduleID}`,
        qs:{

        },
        headers: {
            'x-access-token': HookSecretKey,
            'referer':req.headers.referer
        },
        json: true,
    };


    request(options)
        .then((response) => {
            req.module = response;
            return next();
        })
        .catch((err)  => {
            req.error  = err.error.error ? err.error.error.message : 'Please contact with support';
            return res.status(400).json({success:false, data:req.error});
        });
}

function validateSyntax(req, res, next){
    if(req.files.length < 0) return res.status(400).json({success:false, data:'No attached files'});
    const file = req.files[0].buffer;
    const decoder = new StringDecoder('utf8');
    res.fileContent  =  decoder.write(file);
    const validSyntax = syntax.configure({ ignoreReferenceErrors: true }).check(res.fileContent);
    if(!validSyntax.ok) return res.status(400).json({success:false, data:validSyntax.errors});
    return next();
}

function submit(req, res, next){
    const module = req.module.data;
    const moduleGlobalDir = `${__dirname}/../../../modules/client/pending/`;
    const moduleDir = `${moduleGlobalDir}${module.url}`;
    const indexFile = `${moduleDir}/client.js`;
    fsExtra.ensureDir(moduleDir)
        .then(() => fsExtra.ensureFile(indexFile))
        .then(()=>{
            fs.writeFileSync(indexFile, res.fileContent);
            const options = {
                method: 'POST',
                uri: `${APIURL}/modules/hook/${module._id}`,
                body:req.body,
                headers: {
                    'x-access-token': HookSecretKey,
                    'referer':req.headers.referer
                },
                json: true,
            };

            return request(options)
        })
        .then((response) => {
            console.log('response', response);
            return _onSuccess(res, 'Successfully submitted')
        })
        .catch(err => _onError(res, err, false));
}

function approveReject(req, res, next){
    const module = req.module.data;
    req.body.status = req.params.statusParam;
    req.body.module = module;
    if(req.body.status == 'Rejected') {
        req.body.approvedDate = null;
        req.body.rejectedDate = Date.now();
        return next();
    }

    const moduleGlobalDir = `${__dirname}/../../../modules/client/pending/`;
    const moduleDir = `${moduleGlobalDir}${module.url}`;
    const indexFile = `${moduleDir}/client.js`;

    const closureCompiler = new ClosureCompiler({
        js: indexFile,
        compilation_level: 'SIMPLE',
    });

    closureCompiler.run((exitCode, stdOut, stdErr) => {

        if((exitCode > 0 ) || stdErr)  return _onError(res, stdErr, `Can't compile module`);

        const publicModulesDir = `${__dirname}/../../../publicModules/users/`;
        const publicModuleDir = `${publicModulesDir}${module.url}`;
        const publicIndexFile = `${publicModuleDir}/client.js`;

        fsExtra.ensureDir(publicModuleDir)
            .then(() => fsExtra.ensureFile(publicIndexFile))
            .then(()=>{
                fs.writeFileSync(publicIndexFile, stdOut);

                req.body.approvedDate = Date.now();
                req.body.rejectedDate = null;
                return next();
            })
            .catch(err => _onError(res, err, false));
    });

}

function sendRejectApproveHook(req, res, next){
    const options = {
        method: 'POST',
        uri: `${APIURL}/modules/hook/${req.module.data._id}`,
        body:req.body,
        headers: {
            'x-access-token': HookSecretKey,
            'referer':req.headers.referer
        },
        json: true,
    };

    return request(options)
        .then(complete=> _onSuccess(res, {data:'Successfully submitted'}))
        .catch(err => _onError(res, err, false));

}

function check(req, res, next){
    console.log('headers', req.headers);
    const moduleID = req.body.moduleId || req.query.moduleId || req.params.moduleId;
    const options = {
        method: 'GET',
        uri: `${APIURL}/modules/hook/auth/${moduleID}`,
        qs:{},
        headers: {
            'x-access-token': HookSecretKey,
            'referer':req.headers.referer,
            'rodin-key':req.headers['rodin-key']
        },
        json: true,
    };
    request(options)
        .then((response) => _onSuccess(res, 'Authorized'))
        .catch((err)  => {
            req.error  = err.error.error ? err.error.error.message : 'Please contact with support';
            return res.status(400).json({success:false, data:req.error});
        });
}

function _onSuccess(res, data){
    return res.status(200).json({success:true, data});
}

function _onError(res, err, info){
    console.log(err);
    return res.status(400).json({success:false, data:info || 'Please contact with support'});
}


export default {getModule, validateSyntax, submit, validate, serverFile, approveReject, sendRejectApproveHook, check}

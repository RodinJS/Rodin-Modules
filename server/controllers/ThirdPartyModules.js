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
const StringDecoder = StrDecoder.StringDecoder;

import busterSyntax from 'buster-syntax';
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
            req.module = response.success ? response.data : false;
            return next();
        })
        .catch((err)  => {
            req.error  = err.error.error ? err.error.error.message : 'Please contact with support';
            return next();
        });


}


function serverFile(req, res) {
    let content = '';
    if (!req.module) {
        content = `var error = '${req.error}';\n throw new Error(error);`;
    }
    else{
        const moduleGlobalDir = `${__dirname}/../../../modules/user/`;
        const moduleDir = `${moduleGlobalDir}${req.module.url}`;
        const indexFile = `${moduleDir}/index.js`;
        content = fs.readFileSync(indexFile, 'utf8');
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
    const file = req.files[0].buffer;
    const decoder = new StringDecoder('utf8');
    res.fileContent  =  decoder.write(file);
    const validSyntax = syntax.configure({ ignoreReferenceErrors: true }).check(res.fileContent);
    if(!validSyntax.ok) return res.status(400).json({success:false, data:validSyntax.errors});
    return next();

}

function submit(req, res, next){
    const module = req.module.data;
    const moduleGlobalDir = `${__dirname}/../../../modules/pending/`;
    const moduleDir = `${moduleGlobalDir}${module.url}`;
    const indexFile = `${moduleDir}/index.js`;
    fsExtra.ensureDir(moduleDir)
        .then(() => fsExtra.ensureFile(indexFile))
        .then(()=>{
            fs.writeFileSync(indexFile, res.fileContent);
            return _onSuccess(res, 'Successfully submitted')
        })
        .catch(err => _onError(res, err, false));
}

function _onSuccess(res, data){
    return res.status(200).json({success:true, data});
}

function _onError(res, err, info){
    console.log(err);
    return res.status(400).json({success:false, data:info || 'Please contact with support'});
}


export default {getModule, validateSyntax, submit, validate, serverFile}

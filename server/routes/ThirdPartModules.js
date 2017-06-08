/**
 * Created by xgharibyan on 6/8/17.
 */

/**
 * Created by xgharibyan on 1/13/17.
 */

import express from 'express';
import TPModules from '../controllers/ThirdPartyModules';
import multer from 'multer';
const router = express.Router();	// eslint-disable-line new-cap
const upload = multer();


router.route('/')
    .get(TPModules.validate, TPModules.serverFile);

router.route('/submit')
    .post(upload.array('file'), TPModules.getModule, TPModules.validateSyntax, TPModules.submit);



export default router;



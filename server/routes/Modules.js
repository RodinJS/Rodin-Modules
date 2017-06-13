/**
 * Created by xgharibyan on 1/13/17.
 */

import express from 'express';
import Modules from '../controllers/Modules';
import multer from 'multer';
const router = express.Router();	// eslint-disable-line new-cap
const upload = multer();


router.route('/')
    .get(Modules.validate, Modules.serverFile);

router.route('/submit')
    .post(upload.array('file'), Modules.getModule, Modules.validateSyntax, Modules.submit);

router.route('/approve')
    .post(Modules.getModule, Modules.approve);



export default router;



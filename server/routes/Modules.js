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

router.route('/check')
    .get(Modules.check)

router.route('/force')
    .post(Modules.serverFile);

router.route('/submit')
    .post(upload.array('file'), Modules.getModule, Modules.validateSyntax, Modules.submit);

router.route('/status/:statusParam')
    .post(Modules.getModule, Modules.approveReject, Modules.sendRejectApproveHook);



export default router;



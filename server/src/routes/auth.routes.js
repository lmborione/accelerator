const express = require('express');
const router = express.Router();

const auth = require('../controllers/auth.controller');
const authCtrl = new auth.AuthController();

router.get('/viewtoken', authCtrl.viewtoken);

module.exports = router
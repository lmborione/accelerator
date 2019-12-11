const express = require('express');
const router = express.Router();

const da = require('../controllers/da.controller');
const daCtrl = new da.DesignAutomationController();

router.get('/zip', daCtrl.getRevitPath);
router.post('/upload', daCtrl.uploadRevitFamily);


module.exports = router
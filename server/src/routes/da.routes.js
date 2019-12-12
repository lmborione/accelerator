const express = require('express');
const router = express.Router();

const da = require('../controllers/da.controller');
const daCtrl = new da.DesignAutomationController();

router.post('/zipFamilies', daCtrl.createFamiliesZip);
router.post('/uploadFamilies', daCtrl.uploadRevitFamily);

router.post('/project/:projectId/bucket', daCtrl.createProjectDABucket);
router.get('/project/:projectId/bucket/get', daCtrl.getProjectDABucket);

router.get('/project/:projectId/object/template/add', daCtrl.addTemplateToBucket);
router.post('/project/:projectId/alignment/:alignId/json', daCtrl.addJsonToBucket);
router.post('/project/:projectId/object/families/add', daCtrl.addFamiliesToBucket);
router.get('/project/:projectId/createSignedResources', daCtrl.createSignedResources);


router.post('/project/:projectId/postWorkItem', daCtrl.postWorkItem);
router.get('/project/:projectId/checkStatus', daCtrl.checkStatus);


module.exports = router
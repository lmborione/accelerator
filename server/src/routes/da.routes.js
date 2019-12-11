const express = require('express');
const router = express.Router();

const da = require('../controllers/da.controller');
const daCtrl = new da.DesignAutomationController();

router.get('/zipFamilies', daCtrl.createFamiliesZip);
router.post('/uploadFamilies', daCtrl.uploadRevitFamily);

router.post('/project/:projectId/bucket', daCtrl.createProjectDABucket);
router.get('/project/:projectId/bucket/get', daCtrl.getProjectDABucket);
router.get('/project/:projectId/object/template/add', daCtrl.addTemplateToBucket);


// router.post('/bucket/create', daCtrl.createDaBucket);

// router.post('/bucket/:bucketKey/addItem', daCtrl.addItemToBucket);
// router.get('/bucket/:bucketKey/item/:id/signedUrl', daCtrl.getSignedUrl);


module.exports = router
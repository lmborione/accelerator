const express = require('express');
const router = express.Router();

const da = require('../controllers/da.controller');
const daAdmin = require('../controllers/da.admin.controller');
const daCtrl = new da.DesignAutomationController();
const daAdminCtrl = new daAdmin.AdminDesignAutomationController();

router.post('/project/:projectId/launchDA', daCtrl.launchDA);
router.get('/project/:projectId/getLastRvtUrn', daCtrl.getlastRvtUrn);

//ADMIN routes to be moved
router.post('/project/:projectId/buckets/delete', daAdminCtrl.deleteProjectBuckets);
router.post('/project/:projectId/bucket/clean', daAdminCtrl.cleanProjectBucket);




// router.post('/zipFamilies', daAdminCtrl.createFamiliesZip);
// router.post('/uploadFamilies', daAdminCtrl.uploadRevitFamily);

// router.post('/project/:projectId/bucket', daAdminCtrl.createProjectDABucket);
// router.get('/project/:projectId/bucket/get', daAdminCtrl.getProjectDABucket);

// router.get('/project/:projectId/object/template/add', daAdminCtrl.addTemplateToBucket);
// router.post('/project/:projectId/alignment/:alignId/json', daAdminCtrl.addJsonToBucket);
// router.post('/project/:projectId/object/families/add', daAdminCtrl.addFamiliesToBucket);
// router.get('/project/:projectId/createSignedResources', daAdminCtrl.createSignedResources);

// router.post('/project/:projectId/postWorkItem', daAdminCtrl.postWorkItem);
// router.get('/project/:projectId/checkStatus', daAdminCtrl.checkStatus);


module.exports = router
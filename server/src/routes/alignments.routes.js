const express = require('express');
const router = express.Router();

const alignments = require('../controllers/alignments.controller');
const alignsCtrl = new alignments.AlignmentsController();

router.post('/add/all', alignsCtrl.setAllAlignments);
router.post('/get/id/:id/points/add', alignsCtrl.addPointOnAlignment);
router.post('/add/parse', alignsCtrl.parsePointOnServer);
router.post('/add', alignsCtrl.addAlignment);
router.get('/get/id/:id', alignsCtrl.getAlignmentById);
router.post('/get/id/:id/pkToGeometry', alignsCtrl.getXYZForPK);


module.exports = router
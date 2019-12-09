const express = require('express');
const router = express.Router();

const objects = require('../controllers/objects.controller');
const objectsCtrl = new objects.ObjectsController();

router.get('/get/all', objectsCtrl.getAllObjects);
router.get('/get/name/:name', objectsCtrl.getObjectByName);
router.get('/get/id/:id', objectsCtrl.getObjectById);

module.exports = router
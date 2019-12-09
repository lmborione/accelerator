var objectsModel = require('../models/objects.model');

class ObjectsController {
    constructor() { }

    async getAllObjects(req, res) {
        var page = req.query.page ? parseInt(req.query.page) : 0;
        var limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const totalObjects = objectsModel.countObjects();
        const objects = await objectsModel.getAllObjects(page, limit);
        return res.status(200).json({ status: 200, data: objects, pages: Math.ceil(totalObjects / limit), message: "Succesfully Retrieved Assets" });
    }

    async getObjectByName(req, res) {
        if (req.params.name) {
            const objects = await objectsModel.getObjectByName(req.params.name);
            return res.status(200).json({ status: 200, data: objects, message: "Succesfully Retrieved objects of asset" });
        }
    }

    async getObjectById(req, res) {
        if (req.params.id) {
            const objects = await objectsModel.getObjectById(req.params.id);
            return res.status(200).json({ status: 200, data: objects, message: "Succesfully Retrieved objects of asset" });
        }
    }
}

module.exports = {
    ObjectsController
};

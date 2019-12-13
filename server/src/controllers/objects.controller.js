var objectsModel = require('../models/objects.model');
var projectModel = require('../models/projects.model')
class ObjectsController {
    constructor() { }

    async getAllObjects(req, res) {
        var page = req.query.page ? parseInt(req.query.page) : 0;
        var limit = req.query.limit ? parseInt(req.query.limit) : 10;

        console.log(`getting all objects with : ${JSON.stringify(req.query)}`);
        const totalObjects = objectsModel.countObjects();
        var objects = await objectsModel.getAllObjects(page, limit);

        if (req.query.pretty) {
            const readOnlyFields = ['projectId', 'projectName', 'id', 'RevitId']
            objects = objects.map(o => {
                o.projectName = projectModel.getProjectById(o.projectId).projectName;
                //delete o.projectId
                //delete o.status
                return o;
            })

            return res.status(200).json({
                status: 200,
                data: objects,
                readOnlyFields: readOnlyFields,
                pages: Math.ceil(totalObjects / objects.length),
                message: "Succesfully Retrieved Assets"
            });
        }
        return res.status(200).json({ status: 200, data: objects, pages: Math.ceil(totalObjects / objects.length), message: "Succesfully Retrieved Assets" });
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

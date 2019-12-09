const forge = require('forge-apis');
const svcMng = require('../services/manager.service').ServiceManager;

class ModelsController {

    constructor() {

    }

    async getAllModels(req, res, next) {
        try {
            const objectApi = new forge.ObjectsApi();
            const token = await svcMng.getService('AuthService').get2LeggedToken();


            const objectsRes = await objectApi.getObjects(process.env.BUCKET_KEY,
                {
                    limit: req.params.limit
                },
                { autoRefresh: false },
                token);
            res.status(200).json({ status: 200, data: objectsRes.body, message: "Succesfully Retrieved Forge Models" });
        } catch (error) {
            next(error);
        }

    }

    async getModel(req, res, next) {
        try {
            const objectApi = new forge.ObjectsApi();
            const token = await svcMng.getService('AuthService').get2LeggedToken();

            const objectsRes = await objectApi.getObjectDetails(process.env.BUCKET_KEY,
                req.params.objectName,
                {},
                { autoRefresh: false },
                token);

            res.status(200).json({ status: 200, data: objectsRes.body, message: "Succesfully Retrieved Forge Models" });
        } catch (error) {
            next(error);
        }
    }

    async getModelThumbail(req, res, next) {
        try {
            const derivativesApi = new forge.DerivativesApi();
            const token = await svcMng.getService('AuthService').get2LeggedToken();

            const thumbnail = await derivativesApi.getThumbnail(
                req.params.urn,
                {},
                { autoRefresh: false },
                token);
            const base64Image = Buffer.from(thumbnail.body).toString('base64');
            res.status(200).json({ status: 200, data: base64Image, message: "Succesfully Retrieved Forge Thumbnail" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = {
    ModelsController
};


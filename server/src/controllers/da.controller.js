const svcMng = require('../services/manager.service').ServiceManager;
const daModelsModel = require('../models/daModels.model');
const axios = require('axios');

const librarypath = process.env.LIBRARY_PATH;

class DesignAutomationController {
    constructor() { }


    async createFamiliesZip(req, res, next) {
        const revitService = svcMng.getService('RevitService');
        if (req.body && req.body.length > 0) {
            const familiesPath = req.body.map((item) => {
                return librarypath + '/' + item.path;
            });

            const path = revitService.createFamilyZip(familiesPath);
            res.status(200).json(path);
        }
        res.status(200).send();
    }

    async uploadRevitFamily(req, res, next) {
        try {
            if (!req.files) {
                res.send({
                    status: false,
                    message: 'No files uploaded'
                });
            } else {
                let data = [];

                req.files.families.forEach(family => {
                    console.log(family);
                    console.log(librarypath);
                    //move photo to uploads directory
                    family.mv(librarypath + '/' + family.name);

                    //push file details
                    data.push({
                        name: family.name,
                        mimetype: family.mimetype,
                        size: family.size
                    });

                });

                res.send({
                    status: true,
                    message: 'Files are uploaded',
                    data: data
                });
            }
        } catch (err) {
            res.status(500).send(err);
        }
    }


    async getProjectDABucket(req, res, next) {
        try {
            if (req.params.projectId) {
                const bucketService = svcMng.getService('BucketService');
                const bucket = await bucketService.getBucket(parseInt(req.params.projectId));
                res.status(200).json(bucket);
            }
        } catch (error) {
            next(error)
        }
    }

    async addTemplateToBucket(req, res, next) {
        try {
            if (req.params.projectId) {
                const bucketService = svcMng.getService('BucketService');
                const template = await bucketService.addTemplateToBucket(parseInt(req.params.projectId));
                res.status(200).json(template);
            }
        } catch (error) {
            next(error)
        }
    }

    async createProjectDABucket(req, res, next) {
        try {
            if (req.params.projectId && req.body.projectName) {
                const bucketService = svcMng.getService('BucketService');
                const bucket = await bucketService.createBucket(parseInt(req.params.projectId), req.body.projectName);
                res.status(200).json(bucket);
            }
        } catch (error) {
            next(error)
        }
    }

    async uploadRevitInDaBucket(req, res, next) {
        try {
            if (req.params.projectId && req.body.projectName) {
                const bucketService = svcMng.getService('BucketService');
                const bucket = await bucketService.uploadToBucket(parseInt(req.params.projectId), req.body.projectName);
                res.status(200).json(bucket);
            }
        } catch (error) {
            next(error)
        }
    }

    async addJsonToBucket(req, res, next) {
        try {
            if (req.params.projectId && req.params.alignId) {

                const bucketService = svcMng.getService('BucketService');
                const alignService = svcMng.getService('AlignService');

                const alignId = parseInt(req.params.alignId);
                const result = await Promise.all(req.body.map(async (obj) => {
                    const geom = await alignService.pkToXYZ(alignId, parseFloat(obj.pk));
                    obj.insertionPoint = geom.insertionPoint;
                    obj.angle = geom.angle;
                    obj.rotAxis = geom.rotAxis;

                    return obj;
                }));

                const bucket = await bucketService.uploadJSONToBucket(parseInt(req.params.projectId), result);
                res.status(200).json(result);
            }
        } catch (error) {
            next(error)
        }
    }


    async addFamiliesToBucket(req, res, next) {
        try {
            if (req.params.projectId) {

                const revitService = svcMng.getService('RevitService');
                const bucketService = svcMng.getService('BucketService');

                if (req.body && req.body.length > 0) {
                    const familiesPath = req.body.map((item) => {
                        return librarypath + '/' + item.path;
                    });

                    const tempZipPath = revitService.createFamilyZip(familiesPath);
                    const bucket = await bucketService.uploadZipToBucket(parseInt(req.params.projectId), tempZipPath);
                    res.status(200).json(bucket);
                }
            }
        } catch (error) {
            next(error)
        }
    }

    async createSignedResources(req, res, next) {
        try {
            if (req.params.projectId) {
                const bucketService = svcMng.getService('BucketService');
                const result = await bucketService.createAllSignedResources(parseInt(req.params.projectId));
                res.status(200).json(result);
            }
        } catch (error) {
            next(error)
        }
    }





    async postWorkItem(req, res, next) {
        try {
            if (req.params.projectId) {

                const token = await svcMng.getService('AuthService').get2LeggedToken();

                const pId = parseInt(req.params.projectId);
                const args = daModelsModel.getTempUrl(pId)
                let result = await axios({
                    method: 'post',
                    url: 'https://developer.api.autodesk.com/da/us-east/v3/workitems',
                    headers: {
                        Authorization: `Bearer ${token.access_token}`
                    },
                    data: {
                        activityId: "W2I80AOTn5pnEnaThJbECN2t6gSsh1HV.ObjectsInsertionActivity+act_v1",
                        arguments: args
                    }
                });
                console.log(result.data);



                if (result.data.status === 'cancelled' ||
                    result.data.status === 'failedLimitDataSize' ||
                    result.data.status === 'failedLimitProcessingTime' ||
                    result.data.status === 'failedDownload' ||
                    result.data.status === 'failedInstructions' ||
                    result.data.status === 'failedUpload') {
                    next(result.data.status);
                }

                while (result.data.status === 'inprogress' || result.data.status === 'pending') {
                    await sleep(5000);

                    result = await axios({
                        method: 'get',
                        url: `https://developer.api.autodesk.com/da/us-east/v3/workitems/${result.data.id}`,
                        headers: {
                            Authorization: `Bearer ${token.access_token}`
                        }
                    });
                }
                res.status(200).json(result.data);
            }
        } catch (error) {
            next(error);
        }

    }

    async checkStatus(req, res, next) {
        if (req.params.projectId) {
            const pId = parseInt(req.params.projectId);
            const id = daModelsModel.getWorkItem(pId).id;

            const token = await svcMng.getService('AuthService').get2LeggedToken();

            const result = await axios({
                method: 'get',
                url: `https://developer.api.autodesk.com/da/us-east/v3/workitems/${id}`,
                headers: {
                    Authorization: `Bearer ${token.access_token}`
                }
            });
            daModelsModel.setWorkItem(pId, {
                id: result.data.id,
                status: result.data.status
            })
            res.status(200).json(result.data);
        }
    }


}


function sleep(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () { resolve(); }, ms);
    });
}

module.exports = {
    DesignAutomationController
};
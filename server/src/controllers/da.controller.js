const svcMng = require('../services/manager.service').ServiceManager;

const librarypath = process.env.LIBRARY_PATH;

class DesignAutomationController {
    constructor() { }


    async createFamiliesZip(req, res, next) {
        const revitService = svcMng.getService('RevitService');

        const path = revitService.createFamilyZip([
            librarypath + '/SYS_SEQ_R16_Signalisation Type A.rfa',
            librarypath + '/SYS_SEQ_R16_Signalisation Type C.rfa',
            librarypath + '/SYS_SEQ_R16_Signalisation Type F.rfa'
        ]);
        res.status(200).json(path);
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


    async postWorkItem(req, res, next) {


        axios({
            method: 'post',
            url: 'https://developer.api.autodesk.com/da/us-east/v3/workitems',
            data: {
                activityId: "W2I80AOTn5pnEnaThJbECN2t6gSsh1HV.ObjectsInsertion+v1",
                arguments: {
                    rvtFile: {
                        verb: "get",
                        url: 'https://developer.api.autodesk.com/oss/v2/signedresources/4441797e-d5e9-4930-872e-523371558fb2?region=US'
                    },
                    json: {
                        verb: "get",
                        url: 'http://localhost:'
                    },
                    result: {
                        verb: "put",
                        url: req.body.destUrl
                    }
                }
            }
        });


    }



}


module.exports = {
    DesignAutomationController
};
const svcMng = require('../services/manager.service').ServiceManager;

const librarypath = '../doc/signalling/families'
class DesignAutomationController {
    constructor() { }


    async getRevitPath(req, res, next) {
        const revitService = svcMng.getService('RevitService');

        const path = revitService.createFamilyZip([
            librarypath + '/SYS_SEQ_R16_Signalisation Type A.rfa',
            librarypath + '/SYS_SEQ_R16_Signalisation Type C.rfa',
            librarypath + '/SYS_SEQ_R16_Signalisation Type F.rfa'
        ])
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

    async postWorkItem(req, res, next) {


        axios({
            method: 'post',
            url: 'https://developer.api.autodesk.com/da/us-east/v3/workitems',
            data: {
                activityId: "{{dasNickName}}.DeleteWallsActivity+test",
                arguments: {
                    rvtFile: {
                        verb: "get",
                        url: req.body.sourceUrl
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
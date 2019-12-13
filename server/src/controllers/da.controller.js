const svcMng = require('../services/manager.service').ServiceManager;
const daModelsModel = require('../models/daModels.model');
const axios = require('axios');

const librarypath = process.env.LIBRARY_PATH;

var objectsModel = require('../models/objects.model');
var bucketsModel = require('../models/buckets.model');
var projectFamilies = require('../models/project_families.model');
var daModelModel = require('../models/daModels.model')

class DesignAutomationController {
    constructor() {
        this.launchDA.bind(this);
    }

    launchDA(req, res, next) {
        try {
            if (req.params.projectId) {
                const projectId = req.params.projectId;

                // Verifier si la bucket et la da_bucket existe sinon les créer et les sauvegarder en DB
                // et ajouter le template dans da_bucket créer le daModel sur la DB 
                getBuckets(projectId).then((buckets) => {
                    try {
                        const bucketKey = buckets[0];
                        let da_bucketKey = buckets[1];

                        // Recupérer la liste des objets depuis la DB (object_id, pk, family, type, paramDicts, alignment_id, revit_id)
                        const projObjects = getObjectsOfProject(projectId);

                        // Get zip containing families to be added in the Revit file
                        const zipPath = getFamilyZipPath(projectId, projObjects);

                        // Récupérer les coordonnées de chaque PK + angle + rotaxis
                        const params = createParamJson(projObjects);
                        uploadAndSignFilesToBucket(projectId, da_bucketKey, params, zipPath, postWorkItem)
                            .then((postWorkItemResult) => {
                                if (postWorkItemResult.status === 'success') {
                                    parseResult(projectId, bucketKey, da_bucketKey).then((manifest) => {
                                        console.log(manifest);

                                    });
                                }
                            });

                    } catch (error) {
                        console.log(error);
                    }

                });
                res.status(200).json(true);
            }
            else {
                throw new Error('ProjectId not found')
            }


        } catch (error) {
            next(error)
        }
    }

    getlastRvtUrn(req, res, next) {
        try {
            if (req.params.projectId) {
                const urn = daModelModel.getLastRevitModel(parseInt(req.params.projectId));
                console.log(urn);

                res.status(200).json({ urn: urn });
            }
        } catch (error) {
            next(error)
        }

    }

}

function getObjectsOfProject(projectId) {
    const projObjects = objectsModel.getObjectsOfProject(projectId);
    if (projObjects && projObjects.length > 0) {
        return projObjects
    } else {
        throw new Error('Project not found or project has no objects')
    }

}



function createParamJson(objects) {
    const alignService = svcMng.getService('AlignService');
    return objects.map(obj => {
        if (obj.status !== 'up-to-date') {
            const geom = alignService.pkToXYZ(parseInt(obj.alignId), parseFloat(obj.pk));
            obj.insertionPoint = geom.insertionPoint;
            obj.angle = geom.angle;
            obj.rotAxis = geom.rotAxis;
            return obj;
        }
        return null;
    }).filter(e => e !== null);
}

async function getBuckets(projectId) {
    try {
        if (bucketsModel.bucketExists(projectId)) {
            console.log(`Buckets for project ${projectId} already created`);

            const bucketInfo = bucketsModel.getBucketByProjectId(projectId);

            bucketKey = bucketInfo.bucketKey;
            da_bucketKey = bucketInfo.da_bucketKey;
        } else {

        }
        return [bucketKey, da_bucketKey]
    } catch (error) {
        console.log(error);
    }
}

function getFamilyZipPath(projectId, projObjects) {

    const zipService = svcMng.getService('ZipService');

    // Récupérer la liste des familles chargés dans le projet
    const projFamilies = getFamiliesOfProject(projectId);
    // Déterminer les familles à ajouter
    const familyToAdd = projObjects.reduce((acc, curr) => {
        const familyNameWithExt = `${curr.familyName}.rfa`
        if (projFamilies.findIndex(e => e.path === familyNameWithExt) < 0
            && acc.findIndex(e => e.path === familyNameWithExt) < 0) {
            acc.push({
                path: familyNameWithExt
            })
        }
        return acc;
    }, []);

    // zipper les familles
    const familiesPath = familyToAdd.map((item) => {
        return `${librarypath}/${item.path}`;
    });
    return zipService.createZip(familiesPath, '.rfa');
}


function uploadAndSignFilesToBucket(projectId, da_bucketKey, params, zipPath, callback) {
    console.log('start uploading in da_bucket');

    return new Promise((resolve, reject) => {
        try {
            const bucketService = svcMng.getService('BucketService');
            Promise.all([
                bucketService.uploadJSONToBucket(da_bucketKey, params),
                bucketService.uploadZipToBucket(da_bucketKey, zipPath)
            ]).then((bucketUploadResult) => {
                if (bucketUploadResult) {
                    console.log('create signed ressources');
                    bucketService.createAllSignedResources(projectId, da_bucketKey).then((signedResult) => {
                        if (signedResult) {
                            console.log('ressources signed');
                            resolve(callback(projectId));
                        } else {
                            reject();
                        }
                    })
                } else {
                    reject();
                }
            });
        } catch (error) {
            console.log(error);
            reject();
        }
    });
}

function getFamiliesOfProject(projectId) {
    const familyList = projectFamilies.getFamilies(projectId);
    if (familyList) {
        return familyList;
    } else {
        throw new Error('Project not found');
    }

}

async function postWorkItem(projectId) {
    try {
        const token = await svcMng.getService('AuthService').get2LeggedToken();

        const args = daModelsModel.getTempUrl(projectId)
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
            return result.data;
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
            daModelsModel.setWorkItem(projectId, {
                id: result.data.id,
                status: result.data.status
            })

            console.log(result.data);

        }
        return result.data;
    } catch (error) {
        console.log(error);
    }
}

function sleep(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () { resolve(); }, ms);
    });
}

async function parseResult(projectId, bucketKey, da_BucketKey) {
    const newFileName = `${Date.now()}.rvt`;

    const tempLink = daModelsModel.getTempUrl(projectId);
    const jsonFileURL = tempLink.output.url;

    const jsonresponse = await axios.get(jsonFileURL)
    objectsModel.updateStatus(jsonresponse.data)

    const bucketService = svcMng.getService('BucketService');
    console.log('copy result to input in da_bucket');

    await bucketService.copyObject(da_BucketKey, 'result.rvt', 'input.rvt');

    console.log('copy result to bucket: ' + newFileName);
    await bucketService.copyToBucket(da_BucketKey, bucketKey, 'result.rvt', newFileName);

    console.log('translate to svf');
    const urn = await bucketService.convertObject(bucketKey, newFileName);
    if (urn) {
        let manifest = await bucketService.getManifest(urn);
        while (manifest.status === 'pending' || manifest.status === 'inprogress') {
            await sleep(5000);
            manifest = await bucketService.getManifest(urn);
            console.log(manifest);
        };
        if (manifest.status === 'success') {
            daModelsModel.setLastRevitModel(manifest.urn)
        }

        return manifest;
    } else {
        throw Error('cannot get urn')
    }

}


module.exports = {
    DesignAutomationController
};
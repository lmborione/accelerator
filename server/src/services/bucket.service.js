const BaseService = require('./base.service').BaseService;
const svcMng = require('../services/manager.service').ServiceManager;
const bucketsModel = require('../models/buckets.model');
const daModelsModel = require('../models/daModels.model');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const forge = require('forge-apis');

class BucketService extends BaseService {
    constructor(config) {
        super(config)

    }

    name() {
        return 'BucketService'
    }

    async createBuckets(projectId, projectName) {
        const token = await svcMng.getService('AuthService').get2LeggedToken();
        const bucketApi = new forge.BucketsApi();
        //TODO avoid fordidden char in projectName and also MyProject
        const bucketKey = projectName.toLowerCase();

        var postBuckets1 = {
            bucketKey: bucketKey,
            access: "full",
            policyKey: "persistent"
        }
        const res1 = await bucketApi.createBucket(postBuckets1, `US`, { autoRefresh: false }, token);

        var postBuckets2 = {
            bucketKey: `da_${bucketKey}`,
            access: "full",
            policyKey: "persistent"
        }
        const res2 = await bucketApi.createBucket(postBuckets2, `US`, { autoRefresh: false }, token);

        if (res1.statusCode === 200 && res2.statusCode === 200) {
            bucketsModel.addBucket({
                bucketKey: `${bucketKey}`,
                da_bucketKey: `da_${bucketKey}`,
                projectId: projectId
            });
            return true;
        }
        return false;
    }

    async getBucket(projectId) {
        try {
            const token = await svcMng.getService('AuthService').get2LeggedToken();
            const bucketInfo = bucketsModel.getBucketByProjectId(projectId);

            const bucketApi = new forge.BucketsApi();
            const res = await bucketApi.getBucketDetails(bucketInfo.bucketKey, { autoRefresh: false }, token);

            return res
        } catch (error) {
            return error
        }
    }

    async getDaBucket(projectId) {
        try {
            const token = await svcMng.getService('AuthService').get2LeggedToken();
            const bucketInfo = bucketsModel.getBucketByProjectId(projectId);

            const bucketApi = new forge.BucketsApi();
            const res = await bucketApi.getBucketDetails(bucketInfo.da_bucketKey, { autoRefresh: false }, token);

            return res
        } catch (error) {
            return error
        }
    }

    async addTemplateToBucket(projectId) {
        const bucketInfo = bucketsModel.getBucketByProjectId(projectId);
        const outputRvtPath = `${process.env.TEMP_PATH}/input.rvt`;
        fs.copyFileSync(process.env.TEMPLATE_PATH, outputRvtPath);

        const res = await this.uploadToBucket(bucketInfo.da_bucketKey, outputRvtPath)

        if (res.statusCode === 200) {
            daModelsModel.setLastRevitModel(projectId, 'input.rvt');
        }
        return res;
    }

    async uploadJSONToBucket(bucketKey, jsonData) {
        fs.writeFileSync(process.env.TEMP_PATH + '/params.json', JSON.stringify(jsonData));
        const res = await this.uploadToBucket(bucketKey, process.env.TEMP_PATH + '/params.json')
        console.log('here');

        if (res.statusCode === 200) {
            daModelsModel.setLastJSON(projectId, jsonData);
        }
        return res;
    }

    async uploadZipToBucket(bucketKey, zipPath) {
        console.log(bucketKey);

        const res = await this.uploadToBucket(bucketKey, zipPath)
        return res;
    }

    async createAllSignedResources(projectId, bucketKey) {
        try {
            daModelsModel.setTempUrl(projectId, {
                rvtFile: {
                    url: await this.createSignedResource(bucketKey, "input.rvt")
                },
                json: {
                    url: await this.createSignedResource(bucketKey, "params.json")
                },
                families: {
                    url: await this.createSignedResource(bucketKey, "families.zip"),
                },
                result: {
                    verb: "put",
                    url: await this.createSignedResource(bucketKey, "result.rvt")
                },
                output: {
                    verb: "put",
                    url: await this.createSignedResource(bucketKey, "result.json")
                }
            });
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }

    }

    async createSignedResource(bucketKey, objectName) {
        const token = await svcMng.getService('AuthService').get2LeggedToken();

        const result = await axios({
            url: `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectName}/signed?access=readwrite`,
            method: 'post',
            headers: {
                Authorization: `Bearer ${token.access_token}`
            },
            data: {}
        });
        return result.data.signedUrl;


        // const objAPi = new forge.ObjectsApi();
        // const result = await objAPi.createSignedResource(bucketKey,
        //     objectName,
        //     {},
        //     'readwrite',
        //     { autoRefresh: false },
        //     token);
        //return result.body.signedUrl;


    }

    async uploadToBucket(bucketKey, filePath) {
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        var stats = fs.statSync(filePath);
        var fileSizeInBytes = stats["size"];
        return this.uploadBufferToBucket(bucketKey, fileName, fileBuffer, fileSizeInBytes);
    }

    async uploadBufferToBucket(bucketKey, fileName, fileBuffer, fileSizeInBytes) {
        try {
            const token = await svcMng.getService('AuthService').get2LeggedToken();

            const objectaApi = new forge.ObjectsApi();

            const res = await objectaApi.uploadObject(
                bucketKey,
                fileName,
                fileSizeInBytes,
                fileBuffer,
                {},
                { autoRefresh: false },
                token)
            return res.body;
        } catch (error) {
            console.log(error);
            return null;
        }

    }

    async copyObject(bucketKey, objectName, newName) {
        try {
            const token = await svcMng.getService('AuthService').get2LeggedToken();
            const objectaApi = new forge.ObjectsApi();
            const copyRes = await objectaApi.copyTo(bucketKey, objectName, newName, { autoRefresh: false }, token);
            return copyRes.body;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async convertObject(bucketKey, objectName) {
        try {

            const token = await svcMng.getService('AuthService').get2LeggedToken();
            const derivativesApi = new forge.DerivativesApi();
            const objectaApi = new forge.ObjectsApi();
            const objDetails = await objectaApi.getObjectDetails(bucketKey, objectName, {}, { autoRefresh: false }, token);

            console.log(objDetails.body);

            const urn = Buffer.from(objDetails.body.objectId).toString('base64');

            console.log(`urn base64: ${urn}`);

            const payLoad = {
                input: {
                    urn: urn
                },
                output: {
                    formats: [
                        {
                            type: 'svf',
                            views: ['3d']
                        }
                    ]
                }
            }
            await derivativesApi.translate(payLoad, {}, { autoRefresh: false }, token);
            return urn;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getManifest(urn) {
        try {
            console.log(`getting manifest for urn : ${urn}`);

            const token = await svcMng.getService('AuthService').get2LeggedToken();
            const derivativesApi = new forge.DerivativesApi();
            const manifest = await derivativesApi.getManifest(urn, {}, { autoRefresh: false }, token)

            return manifest.body;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

module.exports = {
    BucketService
}

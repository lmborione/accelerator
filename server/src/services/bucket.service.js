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

    async createBucket(projectId, projectName) {
        const token = await svcMng.getService('AuthService').get2LeggedToken();
        const bucketKey = `${projectName}`;
        const bucketApi = new forge.BucketsApi();

        var postBuckets = {
            bucketKey: bucketKey,
            access: "full",
            policyKey: "persistent"
        }
        const res = await bucketApi.createBucket(postBuckets, `US`, { autoRefresh: false }, token);

        if (res.statusCode === 200) {
            bucketsModel.addBucket({
                bucketKey: bucketKey,
                projectId: projectId,
                getBucketByProjectId: projectName
            });
        }
        return res;
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

    async getFilesUrl(projectId) {
        try {
            const token = await svcMng.getService('AuthService').get2LeggedToken();
            const daModelsInfo = daModelsModel.getDaModel(projectId);

            console.log(daModelsInfo);


        } catch (error) {
            return error
        }
    }

    async setFilesUrl(projectId) {
        try {
            const token = await svcMng.getService('AuthService').get2LeggedToken();
            const daModelsInfo = daModelsModel.getDaModel(projectId);

            console.log(daModelsInfo);


        } catch (error) {
            return error
        }
    }

    async addTemplateToBucket(projectId) {
        const bucketInfo = bucketsModel.getBucketByProjectId(projectId);
        const outputRvtPath = `${process.env.TEMP_PATH}/input.rvt`;
        fs.copyFileSync(process.env.TEMPLATE_PATH, outputRvtPath);

        const res = await this.uploadToBucket(bucketInfo.bucketKey, outputRvtPath)

        if (res.statusCode === 200) {
            daModelsModel.setLastRevitModel(projectId, 'input.rvt');
        }
        return res;
    }

    async uploadJSONToBucket(projectId, jsonData) {
        const bucketInfo = bucketsModel.getBucketByProjectId(projectId);

        fs.writeFileSync(process.env.TEMP_PATH + '/params.json', JSON.stringify(jsonData));
        const res = await this.uploadToBucket(bucketInfo.bucketKey, process.env.TEMP_PATH + '/params.json')

        console.log(res);

        if (res.statusCode === 200) {
            daModelsModel.setLastJSON(projectId, jsonData);
        }
        return res;
    }

    async uploadZipToBucket(projectId, zipPath) {
        const bucketInfo = bucketsModel.getBucketByProjectId(projectId);
        const res = await this.uploadToBucket(bucketInfo.bucketKey, zipPath)
        return res;
    }

    async createAllSignedResources(projectId) {
        const bucketInfo = bucketsModel.getBucketByProjectId(projectId);

        daModelsModel.setTempUrl(projectId, {
            rvtFile: {
                url: await this.createSignedResource(bucketInfo.bucketKey, "input.rvt")
            },
            json: {
                url: await this.createSignedResource(bucketInfo.bucketKey, "params.json")
            },
            families: {
                url: await this.createSignedResource(bucketInfo.bucketKey, "families.zip"),
            },
            result: {
                verb: "put",
                url: await this.createSignedResource(bucketInfo.bucketKey, "result.rvt")
            },
            output: {
                verb: "put",
                url: await this.createSignedResource(bucketInfo.bucketKey, "result.json")
            }
        });
        return true;
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
    }

    async uploadToBucket(bucketKey, filePath) {
        const token = await svcMng.getService('AuthService').get2LeggedToken();

        const fileContent = fs.readFileSync(filePath);

        var stats = fs.statSync(filePath);
        var fileSizeInBytes = stats["size"];

        const objectaApi = new forge.ObjectsApi();

        const res = await objectaApi.uploadObject(
            bucketKey,
            path.basename(filePath),
            fileSizeInBytes,
            fileContent,
            {},
            { autoRefresh: false },
            token)
        return res;
    }
}

module.exports = {
    BucketService
}

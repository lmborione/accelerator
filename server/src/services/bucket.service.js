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
        const bucketApi = new forge.BucketsApi();

        var postBuckets = {
            bucketKey: `${projectName}`,
            access: "full",
            policyKey: "persistent"
        }
        const res1 = await bucketApi.createBucket(postBuckets, `US`, { autoRefresh: false }, token);

        var postBuckets = {
            bucketKey: `da_${projectName}`,
            access: "full",
            policyKey: "persistent"
        }
        const res2 = await bucketApi.createBucket(postBuckets, `US`, { autoRefresh: false }, token);

        if (res1.statusCode === 200 && res2.statusCode === 200) {
            bucketsModel.addBucket({
                bucketKey: `${projectName}`,
                da_bucketKey: `da_${projectName}`,
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

    async uploadJSONToBucket(projectId, jsonData) {
        const bucketInfo = bucketsModel.getBucketByProjectId(projectId);

        fs.writeFileSync(process.env.TEMP_PATH + '/params.json', JSON.stringify(jsonData));
        const res = await this.uploadToBucket(bucketInfo.da_bucketKey, process.env.TEMP_PATH + '/params.json')

        if (res.statusCode === 200) {
            daModelsModel.setLastJSON(projectId, jsonData);
        }
        return res;
    }

    async uploadZipToBucket(projectId, zipPath) {
        const bucketInfo = bucketsModel.getBucketByProjectId(projectId);
        console.log(bucketInfo);

        const res = await this.uploadToBucket(bucketInfo.da_bucketKey, zipPath)
        return res;
    }

    async createAllSignedResources(projectId) {
        const bucketInfo = bucketsModel.getBucketByProjectId(projectId);

        daModelsModel.setTempUrl(projectId, {
            rvtFile: {
                url: await this.createSignedResource(bucketInfo.da_bucketKey, "input.rvt")
            },
            json: {
                url: await this.createSignedResource(bucketInfo.da_bucketKey, "params.json")
            },
            families: {
                url: await this.createSignedResource(bucketInfo.da_bucketKey, "families.zip"),
            },
            result: {
                verb: "put",
                url: await this.createSignedResource(bucketInfo.da_bucketKey, "result.rvt")
            },
            output: {
                verb: "put",
                url: await this.createSignedResource(bucketInfo.da_bucketKey, "result.json")
            }
        });
        return true;
    }

    async createSignedResource(bucketKey, objectName) {
        const token = await svcMng.getService('AuthService').get2LeggedToken();
        // const result = await axios({
        //     url: `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectName}/signed?access=readwrite`,
        //     method: 'post',
        //     headers: {
        //         Authorization: `Bearer ${token.access_token}`
        //     },
        //     data: {}
        // });

        const objAPi = new forge.ObjectsApi();
        const result = await objAPi.createSignedResource(bucketKey,
            objectName,
            {},
            'readwrite',
            { autoRefresh: false },
            token);
        console.log(objectName);
        console.log(result.body.signedUrl);

        return result.body.signedUrl;

        // return result.data.signedUrl;
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

const BaseService = require('./base.service').BaseService;
const svcMng = require('../services/manager.service').ServiceManager;
const bucketsModel = require('../models/buckets.model');
const daModelsModel = require('../models/daModels.model');
const axios = require('axios');
const fs = require('fs');

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

    async addTemplateToBucket(projectId) {
        const bucketInfo = bucketsModel.getBucketByProjectId(projectId);
        const fileData = fs.readFileSync(process.env.TEMPLATE_PATH);
        const res = await this.uploadToBucket(bucketInfo.bucketKey, 'ObjectsInsertion_Template.rvt', fileData)

        if (res.statusCode === 200) {
            daModelsModel.setLastRevitModel(projectId, 'ObjectsInsertion_Template.rvt');
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

    async uploadJSONToBucket(projectId, jsonData) {
        const bucketInfo = bucketsModel.getBucketByProjectId(projectId);

        const fileData = fs.writeFileSync(process.env.TEMP_PATH + '/params.json', JSON.stringify(jsonData));
        const fileData = fs.readFileSync(process.env.TEMP_PATH + '/params.json');
        const res = await this.uploadToBucket(bucketInfo.bucketKey, 'ObjectsInsertion_Template.rvt', fileData)

        if (res.statusCode === 200) {
            daModelsModel.setLastJSON(projectId, jsonData);
        }
        return res;
    }

    async uploadToBucket(bucketKey, fileName, file) {
        const token = await svcMng.getService('AuthService').get2LeggedToken();

        var stats = fs.statSync(file)
        var fileSizeInBytes = stats["size"]

        const objectaApi = new forge.ObjectsApi();

        const res = await objectaApi.uploadObject(
            bucketKey,
            fileName,
            fileSizeInBytes,
            file,
            {},
            { autoRefresh: false },
            token)
        return res;
    }
}

module.exports = {
    BucketService
}

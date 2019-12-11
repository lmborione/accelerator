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
        const token = await svcMng.getService('AuthService').get2LeggedToken();
        const bucketInfo = bucketsModel.getBucketByProjectId(projectId);
        const fileData = fs.readFileSync(process.env.TEMPLATE_PATH);

        console.log(bucketInfo);

        var stats = fs.statSync(process.env.TEMPLATE_PATH)
        var fileSizeInBytes = stats["size"]

        const objectaApi = new forge.ObjectsApi();

        const res = await objectaApi.uploadObject(
            bucketInfo.bucketKey,
            'ObjectsInsertion_Template.rvt',
            fileSizeInBytes,
            fileData,
            {},
            { autoRefresh: false },
            token)

        console.log(res);

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


}

module.exports = {
    BucketService
}

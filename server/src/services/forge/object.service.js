const BaseService = require('../base.service').BaseService;
const svcMng = require('../manager.service').ServiceManager;
const bucketsModel = require('../../models/buckets.model');
const daModelsModel = require('../../models/daModels.model');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const forge = require('forge-apis');

const forgeServerUtils = require('forge-server-utils')

class ForgeObjectService extends BaseService {
    constructor(config) {
        super(config)
    }

    name() {
        return 'OSSObjectService'
    }

    async addTemplateToBucket(projectId) {
        const bucketInfo = bucketsModel.getBucketByProjectId(projectId);
        const outputRvtPath = `${process.env.TEMP_PATH}/input.rvt`;
        fs.copyFileSync(process.env.TEMPLATE_PATH, outputRvtPath);

        const res = await this.uploadToBucket(bucketInfo.da_bucketKey, outputRvtPath)
        return res;
    }

    async uploadJSONToBucket(bucketKey, jsonData) {
        fs.writeFileSync(process.env.TEMP_PATH + '/params.json', JSON.stringify(jsonData));
        const res = await this.uploadToBucket(bucketKey, process.env.TEMP_PATH + '/params.json')
        return res;
    }

    async uploadZipToBucket(bucketKey, zipPath) {
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

    async copyToBucket(sourceBucketKey, destinationBucketKey, objectName, newName) {
        try {

            const data = new forgeServerUtils.DataManagementClient(
                { client_id: process.env.CLIENT_ID, client_secret: process.env.CLIENT_SECRET }
            );
            console.log(sourceBucketKey);
            console.log(objectName);

            const stream = await data.downloadObjectStream(sourceBucketKey, objectName);
            console.log('stream');

            const uploadStream = await data.uploadObjectStream(destinationBucketKey, newName, "application/octet-stream", stream);
            console.log(uploadStream.location);

            return uploadStream.objectId;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

module.exports = {
    ForgeObjectService
}

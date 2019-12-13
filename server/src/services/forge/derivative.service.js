const BaseService = require('../base.service').BaseService;
const svcMng = require('../manager.service').ServiceManager;

const forge = require('forge-apis');

class ForgeDerivativeService extends BaseService {
    constructor(config) {
        super(config)
    }

    name() {
        return 'ForgeDerivativeService'
    }

    async convertObject(bucketKey, objectName) {
        try {

            const token = await svcMng.getService('AuthService').get2LeggedToken();
            const derivativesApi = new forge.DerivativesApi();
            const objectaApi = new forge.ObjectsApi();

            console.log(`start convert file: ${bucketKey} - ${objectName}`);

            const objDetails = await objectaApi.getObjectDetails(bucketKey, objectName, {}, { autoRefresh: false }, token);
            const urn = Buffer.from(objDetails.body.objectId).toString('base64');

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
    ForgeDerivativeService
}

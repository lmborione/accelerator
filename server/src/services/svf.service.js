const { ModelDerivativeClient, ManifestHelper } = require('forge-server-utils');
const { SvfReader } = require('forge-convert-utils');
const THREE = require('three');

const { CLIENT_ID, CLIENT_SECRET } = process.env;

const BaseService = require('./base.service').BaseService;
var alignmentsModel = require('../models/alignments.model');


class SVFService extends BaseService {
    constructor(config) {
        super(config)
        this._config = {
            oauth: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
            }
        }
    }

    name() {
        return 'SVFService'
    }

    async getPointsFromAlignements(urn, dbIds) {
        console.log('start parsing svf');

        const result = [];

        const modelDerivativeClient = new ModelDerivativeClient(this._config.oauth);
        const helper = new ManifestHelper(await modelDerivativeClient.getManifest(urn));
        const derivatives = helper.search({ type: 'resource', role: 'graphics' });

        for (const derivative of derivatives.filter(d => d.mime === 'application/autodesk-svf')) {

            const reader = await SvfReader.FromDerivativeService(urn, derivative.guid, this._config.oauth);
            const svf = await reader.read();
            let index = 0;
            for await (const fragment of reader.enumerateFragments()) {


                if (dbIds.includes(fragment.dbID)) {

                    const ptArr = [];

                    const geometry = svf.geometries[fragment.geometryID];
                    const fragmesh = svf.meshpacks[geometry.packID][geometry.entityID];

                    //TODO : add case where transform is matrix or quaternion
                    const fragTransform = new THREE.Vector3(fragment.transform.t.x, fragment.transform.t.y, fragment.transform.t.z);

                    const fragVertices = fragmesh.vertices;
                    var pos0 = new THREE.Vector3(fragVertices[0], fragVertices[1], fragVertices[2]).add(fragTransform);
                    ptArr.push(pos0);

                    let i = 0;
                    while (i < fragVertices.length) {
                        var pos = new THREE.Vector3(fragVertices[i], fragVertices[i + 1], fragVertices[i + 2]).add(fragTransform);
                        ptArr.push(pos);
                        i += 6;
                    }

                    result.push({
                        id: index,
                        dbID: fragment.dbID,
                        XYZs: ptArr
                    })
                    index++;
                }
            }

        }
        return result;
    }
}


module.exports = {
    SVFService
}


const BaseService = require('./base.service').BaseService;
var alignmentsModel = require('../models/alignments.model');


const THREE = require('three');

class AlignService extends BaseService {
    constructor(config) {
        super(config)

    }

    name() {
        return 'AlignService'
    }

    pkToXYZ(id, pk) {
        const alignment = alignmentsModel.getAlignmentById(id);
        let res = undefined;

        const pkList = [];
        const distList = [];
        let inc_PK = 0;


        for (let i = 0; i < alignment.XYZs.length - 1; i++) {
            const ptA = new THREE.Vector2(alignment.XYZs[i].x, alignment.XYZs[i].y)
            const ptB = new THREE.Vector2(alignment.XYZs[i + 1].x, alignment.XYZs[i + 1].y)

            distAB = ptA.distanceTo(ptB);
            inc_PK += distAB;
            pkList.push(pkList);

            if (inc_Pk > pk) {
                const pkA = pkList[i - 1]
                const pkB = pkList[i]
                const ratio = (pk - pkA) / distAB;

                const resPt = new THREE.Vector3(
                    ptA.x + ratio * (ptB.x - ptA.x),
                    ptA.y + ratio * (ptB.y - ptA.y),
                    ptA.z + ratio * (ptB.Z - ptA.Z),
                )
                return resPt;
            }
        }
    }
}

module.exports = {
    AlignService
}

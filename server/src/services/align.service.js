
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

        console.log(`id: ${id}, pk: ${pk}`);

        const alignment = alignmentsModel.getAlignmentById(id);
        const pkList = [0];
        var inc_PK = 0;

        for (let i = 0; i < alignment.XYZs.length - 1; i++) {
            const ptA = new THREE.Vector2(alignment.XYZs[i].x, alignment.XYZs[i].y)
            const ptB = new THREE.Vector2(alignment.XYZs[i + 1].x, alignment.XYZs[i + 1].y)


            const distAB = ptA.distanceTo(ptB);
            inc_PK += distAB;
            pkList.push(inc_PK);

            if (inc_PK >= pk) {

                let n = new THREE.Vector2(ptB.x, ptB.y)
                n = n.sub(ptA)
                n.normalize();
                const kinkAngle = (n.angle() + 3 * Math.PI / 2) % (2 * Math.PI)

                const ptAZ = alignment.XYZs[i].z;
                const ptBZ = alignment.XYZs[i + 1].z;

                const pkA = pkList[i];
                const ratio = parseFloat((pk - pkA) / distAB);
                const resPt = new THREE.Vector3(
                    ptA.x + ratio * (ptB.x - ptA.x),
                    ptA.y + ratio * (ptB.y - ptA.y),
                    ptAZ + ratio * (ptBZ - ptAZ),
                )
                return {
                    insertionPoint: resPt,
                    angle: kinkAngle,
                    rotAxis: {
                        x: 0,
                        y: 0,
                        z: 1
                    }
                };
            }

        }
        throw new Error(`Point outside of limits: ${inc_PK}`)
    }
}

module.exports = {
    AlignService
}

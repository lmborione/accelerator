
const BaseService = require('./base.service').BaseService;
var alignmentsModel = require('../models/alignments.model');


class AlignService extends BaseService {
    constructor(config) {
        super(config)

    }

    name() {
        return 'AlignService'
    }

    xyzFromPk(id, pk) {
        const alignment = alignmentsModel.getAlignmentById(id);
        let res = undefined;


        for (let i = 0; i < alignment.XYZs.length - 1; i++) {
            const pointA = alignment.XYZs[i];
            const pointB = alignment.XYZs[i + 1];
            delete pointA.z;
            delete pointB.z;


        }

        // XYZ sortie = new XYZ();
        // List<double> list_PK = new List<double>();
        // double inc_PK = 0;


        // for(int i = 0; i<list_pts.Count-1; i++)
        // {
        //     double distance = (new XYZ(list_pts[i].X, list_pts[i].Y, 0)).DistanceTo(new XYZ(list_pts[i+1].X, list_pts[i+1].Y, 0));
        //     inc_PK += distance;
        //     list_PK.Add(inc_PK);
        // }


        // for (int i = 0; i < list_PK.Count; i++)
        // {
        //     if (list_PK[i] > PK)
        //     {
        //         XYZ n_plan = (new XYZ(list_pts[i + 1].X - list_pts[i].X, list_pts[i + 1].Y - list_pts[i].Y, 0)).Normalize();

        //         double long_seg = (new XYZ(list_pts[i + 1].X - list_pts[i].X, list_pts[i + 1].Y - list_pts[i].Y, 0)).GetLength();

        //         XYZ sortie_plan = new XYZ(list_pts[i].X, list_pts[i].Y, 0) + n_plan * (PK - (list_PK[i] - long_seg));

        //         double z =  list_pts[i].Z + ((PK - (list_PK[i]-long_seg)) / long_seg) * (list_pts[i + 1].Z - list_pts[i].Z);

        //         sortie = sortie_plan + new XYZ(0,0,z);

        //         return sortie;
        //     }
        // }

        // return sortie;

    }

    distanceTo(ptA, ptB) {
        return Math.sqrt((ptA.x - ptB.x) * (ptA.x - ptB.x))
    }
}

module.exports = {
    AlignService
}

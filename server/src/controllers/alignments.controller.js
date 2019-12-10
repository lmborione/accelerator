var alignmentsModel = require('../models/alignments.model');
const svcMng = require('../services/manager.service').ServiceManager;

class AlignmentsController {
    constructor() { }

    async addAlignment(req, res, next) {
        try {
            if (req.body) {
                const alignment = await alignmentsModel.addNewAlignment(req.body);
                if (alignment) {
                    res.status(200).json({ status: 200, data: alignment, message: "Succesfully add one alignment" });
                }

            }
        } catch (error) {
            next(error);
        }
    }

    async addPointOnAlignment(req, res, next) {
        try {
            if (req.body && req.params.id) {
                const alignment = await alignmentsModel.addPointOnAlignement(req.params.id, req.body);
                if (alignment) {
                    res.status(200).json({ status: 200, data: alignment, message: "Succesfully add one alignment" });
                }

            }
        } catch (error) {
            next(error);
        }
    }

    async setAllAlignments(req, res, next) {
        try {
            if (req.body) {
                const alignments = await alignmentsModel.setAllAlignments(req.body);
                if (alignments && alignments.length > 0) {
                    res.status(200).json({ status: 200, data: alignments, message: "Succesfully add all alignments" });
                }

            }
        } catch (error) {
            next(error);
        }
    }

    async getAlignmentById(req, res) {
        if (req.params.id) {
            const alignments = await alignmentsModel.getAlignmentById(req.params.id);
            return res.status(200).json({ status: 200, data: alignments, message: "Succesfully Retrieved alignment of asset" });
        }
    }

    async parsePointOnServer(req, res, next) {
        console.log('here');
        try {
            console.log(req.query.urn);

            if (req.query.urn) {
                const dbIds = req.body;
                const forgeSvc = svcMng.getService('ForgeService');
                const alignments = await forgeSvc.getPointsFromAlignements(req.query.urn, dbIds);
                await alignmentsModel.setAllAlignments(alignments);
                return res.status(200).json({ status: 200, data: alignments.length, message: "Succesfully Retrieved alignment of asset" });
            }
        } catch (error) {
            next(error)
        }

    }


}

module.exports = {
    AlignmentsController
};

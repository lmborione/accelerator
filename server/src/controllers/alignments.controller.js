var alignmentsModel = require('../models/alignments.model');

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
                const alignment = await alignmentsModel.addPointOnAlignement(req.body, req.params.id);
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
}

module.exports = {
    AlignmentsController
};

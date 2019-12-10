var alignmentsModel = require('../models/alignments.model');

class AlignmentsController {
    constructor() { }

    async setAllAlignments(req, res, next) {
        try {
            if (req.body) {
                const alignments = await alignmentsModel.setAllAlignments(req.body);
                if (alignments && alignments.length > 0) {
                    res.status(200).json({ status: 200, data: alignments, message: "Succesfully Retrieved alignment of asset" });
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

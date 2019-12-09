var alignmentsModel = require('../models/alignments.model');

class AlignmentsController {
    constructor() { }

    async setAllAlignments(req, res) {
        const alignments = null;
        if (req.body) {
            alignments = await alignmentsModel.setAllAlignments(req.body);
        }

        if (alignments) {
            return res.status(200).json({ status: 200, data: alignments, message: "Succesfully Retrieved alignment of asset" });
        } else {
            return error;
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

const fs = require('fs');
const path = `${process.env.DATABASE_PATH}/mock/alignments.json`;

function readAlignments() {
    const rowData = fs.readFileSync(path);

    if (rowData) {
        return JSON.parse(rowData);
    } else {
        throw new Error('cannot read file');
    }
}

function countAlignments() {
    const alignments = readAlignments();
    if (alignments) {
        return alignments.length
    }
}

function getAllAlignments(page, limit) {
    const alignments = readAlignments();
    return alignments.slice(page * limit, (page + 1) * limit);
}

function getAlignmentByName(name) {
    const alignments = readAlignments();

    let alignment = alignments.filter((e) => e.name == name);
    if (alignement) {
        delete alignment.XYZs;
        return alignment;
    }
    return null;
}

function getAlignmentById(id) {
    const alignments = readAlignments();

    let alignment = alignments.filter((e) => parseInt(e.id) == parseInt(id));
    if (alignment && alignment.length > 0) {
        return alignment[0];
    }
    return null;
}

function getPointsOfAlignmentsById(id, page, limit) {
    const alignments = readAlignments();

    let alignment = alignments.filter((e) => e.id == id);
    if (alignment) {
        return alignment.XYZs.slice(page * limit, (page + 1) * limit);;
    }
    return null;
}

function addNewAlignment(alignment) {
    const alignments = readAlignments();
    let newAlignment = undefined;

    const index = alignments.findIndex(e => e.forgeId === parseInt(alignment.dbid));

    if (index >= 0) {
        newAlignment = {
            id: index,
            forgeId: alignment.dbid,
            XYZs: alignment.XYZs
        };
        alignments[index] = newAlignment;
    }
    else {
        const i = alignments.length;
        newAlignment = {
            id: i,
            forgeId: alignment.dbid,
            XYZs: alignment.XYZs
        };
        alignments.push(newAlignment)
    }

    fs.writeFileSync(path, JSON.stringify(alignments));
    return newAlignment;
}

function addPointOnAlignement(id, points) {
    const alignments = readAlignments();
    const index = alignments.findIndex(e => e.id === parseInt(id));
    if (index >= 0) {
        alignments[index].XYZs.push(points);
    }
    fs.writeFileSync(path, JSON.stringify(alignments));
    return id;
}

function setAllAlignments(dataset) {
    fs.writeFileSync(path, JSON.stringify(dataset));
    return dataset;
}

module.exports = {
    countAlignments,
    getAllAlignments,
    getAlignmentByName,
    getAlignmentById,
    setAllAlignments,
    addNewAlignment,
    addPointOnAlignement,
    getPointsOfAlignmentsById
};

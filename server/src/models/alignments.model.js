const fs = require('fs');
const path = 'src/mock/alignments.json';

function readAlignments() {
    const rowData = fs.readFileSync(path);

    if (rowData) {
        return JSON.parse(rowData);
    } else {
        return error;
    }
}

function countAlignments() {
    const alignments = readAlignments();
    if (alignments !== error) {
        return alignments.length
    } else {
        return error;
    }
}

function getAllAlignments(page, limit) {
    const alignments = readAlignments();
    if (alignments !== error) {
        return alignments.slice(page * limit, (page + 1) * limit);
    } else {
        return error;
    }
}

function getAlignmentByName(name) {
    const alignments = readAlignments();
    if (alignments !== error) {
        return alignments.filter((e) => e.name == name);
    } else {
        return error;
    }
}

function getAlignmentById(id) {
    const alignments = readAlignments();
    if (alignments !== error) {
        return alignments.filter((e) => e.id == id);
    } else {
        return error;
    }
}

function setAllAlignments(dataset) {
    var tab_res = dataset.map((e, i) => {
        return {
            id: i,
            ForgeId: dataset[i].dbid,
            XYZs: dataset[i].XYZs
        }
    });
    console.log(tab_res);

    fs.writeFileSync(path, JSON.stringify(tab_res));
    return tab_res;
}

module.exports = {
    countAlignments,
    getAllAlignments,
    getAlignmentByName,
    getAlignmentById,
    setAllAlignments
};

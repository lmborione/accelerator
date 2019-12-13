const fs = require('fs');
const path = `${process.env.DATABASE_PATH}/mock/objects.json`;

const rowData = fs.readFileSync(path);
let objects = JSON.parse(rowData);

function countObjects() {
    return objects.length
}

function getAllObjects(page, limit) {
    return objects.slice(page * limit, (page + 1) * limit);
}

function getObjectsOfProject(projectId) {
    return objects.filter((e) => e.projectId == projectId);
}

function getObjectByName(name) {
    return objects.filter((e) => e.name == name);
}

function getObjectById(id) {
    return objects.filter((e) => e.id == id);
}

function updateStatus(data) {
    data.forEach(d => {
        const index = objects.findIndex(e => parseInt(e.id) === parseInt(d.id));
        if (index >= 0) {
            objects[index].RevitId = d.RevitID
            objects[index].status = 'updated'
        }
    });
    fs.writeFileSync(path, JSON.stringify(objects));
}

module.exports = {
    countObjects,
    getObjectsOfProject,
    getAllObjects,
    getObjectByName,
    getObjectById,
    updateStatus
};

const fs = require('fs');
const path = 'src/mock/objects.json';

const rowData = fs.readFileSync(path);
let objects = JSON.parse(rowData);

function countObjects() {
    return objects.length
}

function getAllObjects(page, limit) {
    return objects.slice(page * limit, (page + 1) * limit);
}

function getObjectByName(name) {
    return objects.filter((e) => e.name == name);
}

function getObjectById(id) {
    return objects.filter((e) => e.id == id);
}

module.exports = {
    countObjects,
    getAllObjects,
    getObjectByName,
    getObjectById
};

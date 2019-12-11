const fs = require('fs');
const path = 'src/mock/daModels.json';

const rowData = fs.readFileSync(path);
let models = JSON.parse(rowData);

function addProject(projectId) {
    models.push({
        projectId: projectId,
        lastRvtFile: "",
        lastJsonFile: "",
        lastZipFile: ""
    });
    fs.writeFileSync(path, JSON.stringify(models));
}

function getAllModels() {
    return models;
}

function getDaModel(projectId) {
    return models.filter((e) => parseInt(e.projectId) === parseInt(projectId))[0];
}

function setLastRevitModel(projectId, rvtFile) {
    console.log(projectId);

    const index = models.findIndex(e => parseInt(e.projectId) === parseInt(projectId));
    if (index >= 0) {
        models[index].lastRvtFile = rvtFile;
    }
    fs.writeFileSync(path, JSON.stringify(models));
    return models[index];
}

function setLastJSON(projectId, jsonFile) {
    const index = models.findIndex(e => parseInt(e.projectId) === parseInt(projectId));
    if (index >= 0) {
        models[index].lastJsonFile = jsonFile;
    }
    fs.writeFileSync(path, JSON.stringify(models));
    return models[index];
}

function setLastZip(projectId, zipFile) {
    const index = models.findIndex(e => parseInt(e.projectId) === parseInt(projectId));
    if (index >= 0) {
        models[index].lastZipFile = zipFile;
    }
    fs.writeFileSync(path, JSON.stringify(models));
    return models[index];
}

module.exports = {
    addProject,
    getAllModels,
    getDaModel,
    setLastRevitModel,
    setLastJSON,
    setLastZip
};

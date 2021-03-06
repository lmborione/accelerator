const fs = require('fs');
const path = `${process.env.DATABASE_PATH}/mock/daModels.json`;

const rowData = fs.readFileSync(path);
let models = JSON.parse(rowData);

function addProject(projectId) {
    models.push({
        projectId: projectId,
        tempUrl: {},
        workItem: {}
    });
    fs.writeFileSync(path, JSON.stringify(models));
}

function daprojectExists(projectId) {
    return models.findIndex((e) => e.projectId == projectId) >= 0;
}

function getAllModels() {
    return models;
}

function getDaModel(projectId) {
    return models.filter((e) => parseInt(e.projectId) === parseInt(projectId))[0];
}

function setLastRevitModel(projectId, urn) {
    const index = models.findIndex(e => parseInt(e.projectId) === parseInt(projectId));
    if (index >= 0) {
        models[index].lastRvtUrn = urn;
    }
    fs.writeFileSync(path, JSON.stringify(models));
}

function getLastRevitModel(projectId) {
    const index = models.findIndex(e => parseInt(e.projectId) === parseInt(projectId));
    if (index >= 0) {
        return models[index].lastRvtUrn;
    }

}




// function setLastRevitModel(projectId, rvtFile) {
//     console.log(projectId);

//     const index = models.findIndex(e => parseInt(e.projectId) === parseInt(projectId));
//     if (index >= 0) {
//         models[index].lastRvtFile = rvtFile;
//     }
//     fs.writeFileSync(path, JSON.stringify(models));
//     return models[index];
// }

// function setLastJSON(projectId, jsonData) {
//     const index = models.findIndex(e => parseInt(e.projectId) === parseInt(projectId));
//     if (index >= 0) {
//         models[index].lastJsonFile = jsonData;
//     }
//     fs.writeFileSync(path, JSON.stringify(models));
//     return models[index];
// }

// function setLastZip(projectId, zipFile) {
//     const index = models.findIndex(e => parseInt(e.projectId) === parseInt(projectId));
//     if (index >= 0) {
//         models[index].lastZipFile = zipFile;
//     }
//     fs.writeFileSync(path, JSON.stringify(models));
//     return models[index];
// }

function getTempUrl(projectId) {
    return models.filter((e) => parseInt(e.projectId) === parseInt(projectId))[0].tempUrl;
}

function setTempUrl(projectId, tempUrls) {
    const index = models.findIndex(e => parseInt(e.projectId) === parseInt(projectId));
    if (index >= 0) {
        models[index].tempUrl = tempUrls;
    }
    fs.writeFileSync(path, JSON.stringify(models));
    return models[index];
}

function getWorkItem(projectId) {
    return models.filter((e) => parseInt(e.projectId) === parseInt(projectId))[0].workItem;
}

function setWorkItem(projectId, workItem) {
    const index = models.findIndex(e => parseInt(e.projectId) === parseInt(projectId));
    if (index >= 0) {
        models[index].workItem = workItem;
    }
    fs.writeFileSync(path, JSON.stringify(models));
    return models[index];
}



module.exports = {
    addProject,
    daprojectExists,
    getAllModels,
    getDaModel,
    setLastRevitModel,
    getLastRevitModel,
    //setLastJSON,
    //setLastZip,
    getTempUrl,
    setTempUrl,
    getWorkItem,
    setWorkItem
};

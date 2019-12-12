const fs = require('fs');
const path = `${process.env.DATABASE_PATH}/mock/project_families.json`;

const rowData = fs.readFileSync(path);
let projFamilies = JSON.parse(rowData);

function getFamilies(projectId) {
    return projFamilies.filter((e) => parseInt(e.projectId) === parseInt(projectId))[0].list;
}


function addFamilies(projectId, list) {
    const index = projFamilies.findIndex(e => parseInt(e.projectId) === parseInt(projectId));
    if (index >= 0) {
        projFamilies[index].list = list;
    }
    fs.writeFileSync(path, JSON.stringify(projFamilies));
    return projFamilies[index];
}


module.exports = {
    getFamilies,
    addFamilies
};

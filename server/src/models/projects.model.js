const fs = require('fs');
const path = `${process.env.DATABASE_PATH}/mock/projects.json`;

const rowData = fs.readFileSync(path);
let projects = JSON.parse(rowData);

function projectExists(id) {
    return projects.findIndex((e) => e.id == id) >= 0;
}

function getProjectById(id) {
    return projects.filter((e) => e.id == id)[0];
}


module.exports = {
    projectExists,
    getProjectById
};

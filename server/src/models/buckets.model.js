const fs = require('fs');
const path = `${process.env.DATABASE_PATH}/mock/buckets.json`;

const rowData = fs.readFileSync(path);
let buckets = JSON.parse(rowData);

function countObjects() {
    return buckets.length
}

function addBucket(bucketInfo) {
    buckets.push(bucketInfo);
    fs.writeFileSync(path, JSON.stringify(buckets));
}


function getAllBuckets() {
    return buckets;
}

function deleteAllBuckets(projectId) {
    const index = buckets.findIndex((e) => e.projectId == projectId) >= 0;
    buckets = buckets.slice(index, 1)
    fs.writeFileSync(path, JSON.stringify(buckets));
}


function bucketExists(projectId) {
    return buckets.findIndex((e) => e.projectId == projectId) >= 0;
}

function getBucketByProjectId(projectId) {
    return buckets.filter((e) => e.projectId == projectId)[0];
}

function getBucketByKey(key) {
    return objects.filter((e) => e.bucketKey == key)[0];
}

module.exports = {
    countObjects,
    bucketExists,
    addBucket,
    deleteAllBuckets,
    getAllBuckets,
    getBucketByProjectId,
    getBucketByKey
};

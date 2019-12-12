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

function getBucketByProjectId(projectId) {
    return buckets.filter((e) => e.projectId == projectId)[0];
}

function getBucketByKey(key) {
    return objects.filter((e) => e.bucketKey == key)[0];
}

module.exports = {
    countObjects,
    addBucket,
    getAllBuckets,
    getBucketByProjectId,
    getBucketByKey
};

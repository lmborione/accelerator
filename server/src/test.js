const axios = require('axios')

const axiosHeader = {
    headers: {
        'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6Imp3dF9zeW1tZXRyaWNfa2V5In0.eyJjbGllbnRfaWQiOiJXMkk4MEFPVG41cG5FbmFUaEpiRUNOMnQ2Z1NzaDFIViIsImV4cCI6MTU3NTg5NjE0Niwic2NvcGUiOlsiYnVja2V0OmNyZWF0ZSIsImJ1Y2tldDpyZWFkIiwiYnVja2V0OnVwZGF0ZSIsImJ1Y2tldDpkZWxldGUiLCJkYXRhOnJlYWQiLCJkYXRhOndyaXRlIiwiZGF0YTpjcmVhdGUiLCJ2aWV3YWJsZXM6cmVhZCIsInVzZXI6d3JpdGUiLCJ1c2VyOnJlYWQiXSwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20vYXVkL2p3dGV4cDYwIiwianRpIjoiSTl4UUhITWJYM0ZTNW9SdDFWQ0oxNTFYNlVJS2s2WXRWa2FjQnhkNlAzQ1dUTDRHaFNBdzZkQUpRdmY2bjd0NSJ9.sHRGk2vkRyEiHW0U9SuiZK21oR_m8RSfFiQtR00plrE",
        'Content-Type': 'application/json'
    }
}

function deleteBucket(bucketKey) {
    axios.delete('https://developer.api.autodesk.com/oss/v2/buckets/' + bucketKey, axiosHeader).then();
}

function createBucket() {
    const body = {
        bucketKey: '09_12_accelerator',
        policyKey: 'persistent'
    };
    axios.post('https://developer.api.autodesk.com/oss/v2/buckets', body, axiosHeader).then(res => {
        console.log(res);
    }).catch(error => {
        console.log(error);
    });
}

function deleteAllBuckets(url) {
    axios.get(url, axiosHeader)
        .then(function (response) {
            response.data.items.forEach(bucket => {
                console.log(bucket);

                if (!bucket.bucketKey.startsWith('forgelmb_2019_10_15')) {
                    deleteBucket(bucket.bucketKey);
                }
            });
            if (response.data.next) {
                deleteBucket(response.data.next);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

// deleteAllBuckets('https://developer.api.autodesk.com/oss/v2/buckets')
createBucket();


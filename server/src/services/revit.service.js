var zipdir = require('zip-dir');
var path = require("path");

var fs = require('fs');
const fse = require('fs-extra');

const BaseService = require('./base.service').BaseService;

class RevitService extends BaseService {
    constructor(config) {
        super(config)

    }

    name() {
        return 'RevitService'
    }

    createFamilyZip(files) {
        var dir = '../doc/tmp';
        var famDir = dir + '/library';
        const outputPath = dir + '/families.zip';
        if (!fs.existsSync(famDir)) {
            fs.mkdirSync(famDir);
        }

        const outFiles = [];
        files.forEach(f => {
            if (fs.existsSync(f)) {
                if (path.extname(f) === '.rfa') {
                    outFiles.push({
                        path: path.basename(f)
                    });
                    fs.copyFileSync(f, `${famDir}/${path.basename(f)}`);
                }
            }
        });

        fs.writeFileSync(famDir + '/list.json', JSON.stringify(outFiles));

        zipdir(famDir, { saveTo: outputPath }, err => {
            if (err) throw err;
            else {
                fse.removeSync(famDir)
            }
        });

        return outputPath;
    }
}

module.exports = {
    RevitService
}

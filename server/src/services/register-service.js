const authSvc = require('./auth.service');
const alignSvc = require('./align.service');
const zipSvc = require('./zip.service')
const bucketSvc = require('./forge/bucket.service')
const objSvc = require('./forge/object.service')
const derivSvc = require('./forge/derivative.service')
const svfSvc = require('./forge/svf.service');

const SvcMng = require('./manager.service').ServiceManager;

function registerAllService() {
    // Register all services instances
    const authService = new authSvc.AuthService();
    SvcMng.registerService(authService);

    const alignService = new alignSvc.AlignService();
    SvcMng.registerService(alignService);

    const svfService = new svfSvc.SVFService();
    SvcMng.registerService(svfService);

    const zipService = new zipSvc.ZipService();
    SvcMng.registerService(zipService);

    const bucketService = new bucketSvc.BucketService();
    SvcMng.registerService(bucketService);

    const objectService = new objSvc.ForgeObjectService();
    SvcMng.registerService(objectService);
    const derivativeService = new derivSvc.ForgeDerivativeService();
    SvcMng.registerService(derivativeService);
}

module.exports = {
    registerAllService
}
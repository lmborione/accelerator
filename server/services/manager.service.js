class ServiceManagerClass {

    constructor() {
        this._services = {};
    }

    registerService(service) {
        this._services[service.name()] = service;
    }

    getService(name) {
        if (this._services[name]) {
            return this._services[name];
        }

        return null;
    }
}

var ServiceManager = new ServiceManagerClass();


module.exports = {
    ServiceManager
}

const ServiceManager = require('./manager.service');
const EventEmitter = require('events')

class BaseService extends EventEmitter {

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    constructor(config = {}) {

        super()

        this._config = config;
    }

    name() {
        return this._name;
    }

    config() {
        return this._config;
    }
}

module.exports = {
    BaseService
}
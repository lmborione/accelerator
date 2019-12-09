class ServiceManagerClass {
	_services: any;

	constructor() {
		this._services = {};
	}

	registerService(service: any) {
		this._services[service.name()] = service;
	}

	getService(name: string) {
		if (this._services[name]) {
			return this._services[name];
		}

		return undefined;
	}
}

var ServiceManager = new ServiceManagerClass();

export default ServiceManager;

class ObjectsService {
	name() {
		return 'ObjectsService';
	}

	async getObjects(page: number, pageSize: number): Promise<any> {
		try {
			const response = await fetch(`/api/objects/get/all?page=${page}&limit=${pageSize}&pretty=true`);
			return await response.json();
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	async addObject(newData: any): Promise<any> {
		try {
			const response = await fetch('/api/object/add', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newData)
			});
			const resp = await response.json();
			return resp.data;
		} catch (error) {
			console.log(error);
			throw error;
		}
	}
}

export default ObjectsService;

class ForgeService {
	name() {
		return 'ForgeService';
	}

	getToken(onGetAccessToken: any) {
		fetch('/api/auth/viewtoken')
			.then((response) => response.json())
			.then((res: any) => {
				onGetAccessToken(res.access_token, res.expires_in);
			})
			.catch((err) => console.log(err));
	}

	async getModels(): Promise<any> {
		try {
			const response = await fetch('/api/models/get/all');
			const data = await response.json();
			return data;
		} catch (error) {
			console.log(error);
		}
	}

	async getLastURN(): Promise<any> {
		try {
			const response = await fetch(`/api/da/project/0/getLastRvtUrn`);
			const data = await response.json();
			console.log(data);

			return data.urn;
		} catch (error) {
			console.log(error);
		}
	}

	async getThumbnail(urn: string): Promise<any> {
		try {
			const response = await fetch(`/api/models/get/urn/${urn}/thumbnail`);
			const data = await response.json();
			return data;
		} catch (error) {
			console.log(error);
		}
	}
}

export default ForgeService;

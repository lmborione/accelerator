class AlignmentService {
	name() {
		return 'AlignmentService';
	}

	async getAlignment(id: number): Promise<any> {
		try {
			const response = await fetch(`/api/alignment/get/${id}`);
			const resp = await response.json();
			return {
				data: resp.data
			};
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	async addAlignment(urn: string, dbIds: any[]): Promise<any> {
		console.log(urn);
		console.log(dbIds);

		try {
			const response = await fetch(`/api/alignments/add/parse?urn=${urn}`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(dbIds)
			});
			const json = await response.json();
			console.log(json);
			return json;
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	// async addAlignment(newData: any): Promise<any> {
	// 	console.log(newData);
	// 	try {
	// 		var chunk_size = 1000;
	// 		for (var i = 0; i < newData.length; i++) {
	// 			if (newData[i].XYZs.length > chunk_size) {
	// 				//create new align with a point
	// 				const response = await fetch('/api/alignments/add', {
	// 					method: 'POST',
	// 					headers: {
	// 						Accept: 'application/json',
	// 						'Content-Type': 'application/json'
	// 					},
	// 					body: JSON.stringify({
	// 						dbid: newData[i].dbid,
	// 						XYZs: []
	// 					})
	// 				});
	// 				await response.json();

	// 				for (var j = 0; j < newData[i].XYZs.length; j += chunk_size) {
	// 					var chunk = newData[i].XYZs.slice(j, j + chunk_size);

	// 					const response = await fetch(`/api/alignments/get/id/${i}/points/add`, {
	// 						method: 'POST',
	// 						headers: {
	// 							Accept: 'application/json',
	// 							'Content-Type': 'application/json'
	// 						},
	// 						body: JSON.stringify(chunk)
	// 					});
	// 					await response.json();
	// 				}
	// 			} else {
	// 				const response = await fetch('/api/alignments/add', {
	// 					method: 'POST',
	// 					headers: {
	// 						Accept: 'application/json',
	// 						'Content-Type': 'application/json'
	// 					},
	// 					body: JSON.stringify(newData[i])
	// 				});
	// 				await response.json();
	// 			}
	// 		}
	// 	} catch (error) {
	// 		console.log(error);
	// 		throw error;
	// 	}
	// }
}

export default AlignmentService;

class AlignmentService {
	name() {
		return 'AlignmentService';
	}

	async getAlignment(id: number): Promise<any> {
		try {
			const response = await fetch(`/api/alignment/get/${id}`);
			const resp = await response.json();
			return {
				data: resp.data,
			};
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	async addAlignments(newData: any): Promise<any> {
		try {
			const response = await fetch('/api/alignments/add/all', {
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

export default AlignmentService;

import React, { Component } from 'react';
import { ForgeModels } from '../../components';

type HomeState = {
	models: any[];
};

class HomeView extends Component<{}, HomeState> {
	state = {
		models: []
	};

	async componentDidMount() {
		const recentModelsOnStorage: string | null = localStorage.getItem('RecentModels');
		if (recentModelsOnStorage) {
			const recentModels = JSON.parse(recentModelsOnStorage);

			this.setState({
				models: recentModels
			});
		}
	}

	render() {
		console.log(this.state);

		return (
			<div className="page">
				<h4>Recent models</h4>
				{this.state.models.length > 0 && (
					<ForgeModels data={this.state.models} showPagination={false} column={4} row={1} />
				)}
			</div>
		);
	}
}

export default HomeView;

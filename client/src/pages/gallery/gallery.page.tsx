import React, { Component } from 'react';
import './gallery.page.scss';

import { ForgeModels } from '../../components';
import ServiceManager from '../../services/manager.service';

import { ForgeModel } from '../../core/forgeModel';
import { Spinner } from 'react-bootstrap';

type GalleryState = {
	modeldata: ForgeModel[];
	loaded: boolean;
	hasError: boolean;
};

class GalleryView extends Component<{}, GalleryState> {
	_forgeService: any = ServiceManager.getService('ForgeService');

	static defaultProps = {};

	state = {
		modeldata: [],
		loaded: false,
		hasError: false
	};

	async componentDidMount() {
		try {
			const models = await this.loadModel();
			this.setState({
				modeldata: models,
				loaded: true
			});
		} catch (error) {
			this.setState({
				loaded: true,
				hasError: true
			});
		}
	}

	async loadModel() {
		const models = await this._forgeService.getModels();

		var forgeModels: ForgeModel[] = await Promise.all(
			models.data.items.map(async (model: any) => {
				const urnB64 = new Buffer(model.objectId).toString('base64');
				const modelThumbnail = await this._forgeService.getThumbnail(urnB64);
				return {
					thumbnail: modelThumbnail.data,
					urn: urnB64,
					name: model.objectKey
				};
			})
		);

		return forgeModels;
	}

	render() {
		if (!this.state.loaded) {
			return (
				<Spinner className="centerScreen" animation="border" role="status">
					<span className="sr-only">Loading...</span>
				</Spinner>
			);
		}
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return <h1>Something went wrong.</h1>;
		}

		return (
			<div className="page centerContent">
				<ForgeModels data={this.state.modeldata} showPagination={true} column={4} row={2} />
			</div>
		);
	}
}

export default GalleryView;

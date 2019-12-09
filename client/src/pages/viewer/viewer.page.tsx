import React, { Component, createRef } from 'react';

import ForgeViewer from '../../components/forge/forge-viewer/forge-viewer.component';
import { RouteComponentProps } from 'react-router';

import ServiceManager from '../../services/manager.service';

import SplitPane from 'react-split-pane';
import { Button } from 'react-bootstrap';

class Viewer extends Component<RouteComponentProps, { painted: any }> {
	_assetListService: any = ServiceManager.getService('AssetListService');
	_linkService: any = ServiceManager.getService('LinkService');
	_lastSelection: any;
	_lastAsset: any;
	forgeViewerRef: React.RefObject<ForgeViewer>;

	state = {
		painted: []
	};

	constructor(props: RouteComponentProps) {
		super(props);
		this.forgeViewerRef = createRef<ForgeViewer>();
	}

	getAssetList = async (page: number, limit: number) => {
		const response = await this._assetListService.getAllAsset(page, limit);
		const result = { pages: response.pages, data: response.data as any[] };
		return result;
	};

	onAssetClick = (e: any) => {
		this._lastAsset = e;
	};

	onCreateLink = () => {
		const links = this._lastSelection.map((oId: any) => {
			return {
				urn: this.props.location.state.urn,
				assetId: this._lastAsset['UAID'],
				objectId: oId
			};
		});
		this._linkService.createLink(links);
	};

	onForgeSelectionChanged = (e: any) => {
		this._lastSelection = e.dbIdArray;
	};

	onShow = async () => {
		const response = await this._linkService.getAllLinks();
		this.setState({
			painted: response
		});
	};

	filterByModel = () => {
		if (this.forgeViewerRef.current) {
			console.log(this.forgeViewerRef.current._model!);
		}
	};

	render() {
		return (
			<div>
				<SplitPane className="splitter" split="vertical" minSize={'30%'} defaultSize={'70%'}>
					<div>
						<Button onClick={this.filterByModel}>Filter asset of models</Button>
						<ForgeViewer
							ref={this.forgeViewerRef}
							painted={this.state.painted}
							onSelectionChanged={this.onForgeSelectionChanged}
							urn={`urn:${this.props.location.state.urn}`}
						/>
					</div>

					<SplitPane split="horizontal" minSize={'30%'} defaultSize={'70%'} />
				</SplitPane>
			</div>
		);
	}
}

export default Viewer;

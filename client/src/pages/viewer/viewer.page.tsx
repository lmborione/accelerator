import React, { Component, createRef } from 'react';

import ForgeViewer from '../../components/forge/forge-viewer/forge-viewer.component';
import { RouteComponentProps } from 'react-router';

import ServiceManager from '../../services/manager.service';

class Viewer extends Component<RouteComponentProps> {
	_assetListService: any = ServiceManager.getService('AssetListService');
	_linkService: any = ServiceManager.getService('LinkService');
	_lastSelection: any;
	_lastAsset: any;
	forgeViewerRef: React.RefObject<ForgeViewer>;

	constructor(props: RouteComponentProps) {
		super(props);
		this.forgeViewerRef = createRef<ForgeViewer>();
	}

	onForgeSelectionChanged = (e: any) => {
		this._lastSelection = e.dbIdArray;
	};

	render() {
		return (
			<div>
				<ForgeViewer ref={this.forgeViewerRef} urn={`urn:${this.props.location.state.urn}`} />
			</div>
		);
	}
}

export default Viewer;

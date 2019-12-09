import React, { Component, createRef } from 'react';

import ForgeViewer from '../../components/forge/forge-viewer/forge-viewer.component';
import ObjectList from '../../components/objects/object-list.component';

import { RouteComponentProps } from 'react-router';

import ServiceManager from '../../services/manager.service';

import SplitPane from 'react-split-pane';

class Viewer extends Component<RouteComponentProps> {
	_objectsService: any = ServiceManager.getService('ObjectsService');
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

	onGetObjects = async () => {
		const response = await this._objectsService.getObjects(0, 20);
		console.log(response);

		const result = { pages: response.pages, data: response.data as any[] };
		return result;
	};

	render() {
		return (
			<SplitPane className="splitter" split="vertical" minSize={'30%'} defaultSize={'70%'}>
				<ForgeViewer ref={this.forgeViewerRef} urn={`urn:${this.props.location.state.urn}`} />
				<ObjectList
					editable={false}
					fetchData={true}
					displayColumnIndexes={[ -1 ]}
					getData={this.onGetObjects}
				/>
			</SplitPane>
		);
	}
}

export default Viewer;

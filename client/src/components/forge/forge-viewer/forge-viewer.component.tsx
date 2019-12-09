import React, { Component } from 'react';
import './forge-viewer.component.scss';

import './extensions/accelerator.forge.extension';
import ServiceManager from '../../../services/manager.service';
import { isNullOrUndefined } from 'util';

// import * as THREE from 'three';
const THREE = window.THREE;

interface ForgeViewerProps {
	urn: string;
}

class ForgeViewer extends Component<ForgeViewerProps> {
	viewerContainer?: HTMLDivElement = undefined;
	viewer?: Autodesk.Viewing.GuiViewer3D;

	componentDidMount() {
		const options = {
			env: 'AutodeskProduction',
			getAccessToken: ServiceManager.getService('ForgeService').getToken
		};

		Autodesk.Viewing.Initializer(options, () => {
			this.viewer = new Autodesk.Viewing.GuiViewer3D(this.viewerContainer!);

			//initialize extension : use new key word to register the extension in autodesk extension manager
			this.viewer.loadExtension('Accelerator');

			var startedCode = this.viewer.start();
			if (startedCode > 0) {
				console.error('Failed to create a Viewer: WebGL not supported.');
				return;
			}
			console.log('Initialization complete, loading a model next...');
			Autodesk.Viewing.Document.load(
				this.props.urn,
				async (viewerDocument: Autodesk.Viewing.Document) => {
					var viewables = viewerDocument.getRoot().search({ type: 'geometry' });

					//input the transformation
					var loadOptions = {
						placementTransform: new THREE.Matrix4(),
						globalOffset: {
							x: 0,
							y: 0,
							z: 0
						}
					};
					await this.viewer!.loadDocumentNode(viewerDocument, viewables[1], loadOptions);
				},
				this.onDocumentLoadFailure
			);
		});
	}

	onDocumentLoadFailure() {
		console.error('Failed fetching Forge manifest');
	}

	showPainted() {
		const ids = [ 60, 95, 132 ];
		const color = new THREE.Vector4(255 / 255, 0, 0, 0.5);
		if (this.viewer) {
			for (let i = 0; i < ids.length; i++) {
				console.log(ids[i]);
				this.viewer.setThemingColor(ids[i], color);
			}
		}
	}

	render() {
		return <div id="viewer" className="viewer" ref={(div) => (this.viewerContainer = div!)} />;
	}
}

export default ForgeViewer;

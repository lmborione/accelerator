import { isNullOrUndefined } from 'util';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './accelerator.forge.extension.scss';

import ServiceManager from '../../../../services/manager.service';

const THREE = window.THREE;

const ExtensionId = 'Accelerator';
export class AIMSPainterForgeExtension extends Autodesk.Viewing.Extension {
	_group: Autodesk.Viewing.UI.ControlGroup | null;
	_btnAddModel: Autodesk.Viewing.UI.Button | null;
	_toolbar: Autodesk.Viewing.UI.ToolBar | null;
	_alignmentService: any = ServiceManager.getService('AlignmentService');
	_forgeService: any = ServiceManager.getService('ForgeService');

	constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
		super(viewer, options);

		this._group = null;
		this._btnAddModel = null;
		this._toolbar = null;
	}

	load() {
		console.log(`${ExtensionId} has been loaded`);

		return true;
	}

	unload() {
		// Clean our UI elements if we added any
		if (this._group) {
			this._group.removeControl(this._btnAddModel!);
			if (this._group.getNumberOfControls() === 0) {
				this.viewer.toolbar.removeControl(this._group);
			}
		}
		console.log(`${ExtensionId} has been unloaded`);
		return true;
	}

	onToolbarCreated() {
		//Create a new toolbar
		this._toolbar = new Autodesk.Viewing.UI.ToolBar('Accelerator.Toolbar');

		//Create Buttons
		//Upload Alignment Buton
		this._btnAddModel = new Autodesk.Viewing.UI.Button('Accelerator.AddModel');
		this._btnAddModel.setIcon('adsk-icon-bug');
		this._btnAddModel.setToolTip('Add Last Model in Viewer');
		this._btnAddModel.onClick = () => {
			this.onAddModel();
			console.log('alert');
		};

		// add button to the goup
		this._group = new Autodesk.Viewing.UI.ControlGroup('Accelerator.ControlGroup');
		this._group.addControl(this._btnAddModel);

		// add group to custom toolbar
		this._toolbar.addControl(this._group);

		this.viewer.container.appendChild(this._toolbar.container);

		this._group.addEventListener(Autodesk.Viewing.UI.SIZE_CHANGED, this.onWindowResize);
		setTimeout(() => {
			this._toolbar!.addClass('mytoolbar');
			this.onWindowResize();
		}, 100);
	}

	onWindowResize = () => {
		console.log('resize');

		if (this._toolbar) {
			const dim = this._toolbar.getDimensions() as { width: number; height: number };

			if (dim && !isNaN(dim.height)) {
				console.log((this.viewer.getDimensions().height / 2 + dim.height / 2).toString());

				this._toolbar.container.style.setProperty(
					'top',
					(this.viewer.getDimensions().height / 2 + dim.height / 2).toString()
				);
			}
		}
	};

	onAddModel = async () => {

		//Request last model urn
		const urn = await this._forgeService.getLastURN();

		Autodesk.Viewing.Document.load(
			`urn:${urn}`,
			async (viewerDocument: Autodesk.Viewing.Document) => {
				console.log('Document has been loaded');
				var viewables = viewerDocument.getRoot().search({ type: 'geometry' });

				// Choose the first avialble viewables
				var initialViewable = viewables[0];
				var svfUrl = viewerDocument.getViewablePath(initialViewable);

				var offset = this.viewer.model.getData().globalOffset;

				//input the transformation
				var loadOptions = {
					placementTransform: new THREE.Matrix4(),
					globalOffset: offset,
					applyScaling: 'm', //always in meter
				};

				await this.viewer.loadModel(svfUrl, loadOptions, this._onLoadModelSuccess, this._onLoadModelError);
			},
			this.onDocumentLoadFailure
		);
	};

	onDocumentLoadFailure() {
		console.error('Failed fetching Forge manifest');
	}

	_onLoadModelSuccess() {
		console.log('Model is loaded !');
	}

	_onLoadModelError() {
		console.log('Laod model went wrong !');

	}
}

Autodesk.Viewing.theExtensionManager.registerExtension(ExtensionId, AIMSPainterForgeExtension);

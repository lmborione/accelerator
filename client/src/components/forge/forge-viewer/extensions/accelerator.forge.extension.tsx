import { isNullOrUndefined } from 'util';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './accelerator.forge.extension.scss';

const THREE = window.THREE;

const ExtensionId = 'Accelerator';
export class AIMSPainterForgeExtension extends Autodesk.Viewing.Extension {
	_group: Autodesk.Viewing.UI.ControlGroup | null;
	_btnUploadAlignment: Autodesk.Viewing.UI.Button | null;
	_toolbar: Autodesk.Viewing.UI.ToolBar | null;

	constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
		super(viewer, options);
		this._group = null;
		this._btnUploadAlignment = null;
		this._toolbar = null;
	}

	load() {
		console.log(`${ExtensionId} has been loaded`);
		return true;
	}

	unload() {
		// Clean our UI elements if we added any
		if (this._group) {
			this._group.removeControl(this._btnUploadAlignment!);
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
		this._btnUploadAlignment = new Autodesk.Viewing.UI.Button('ELODIE.ConfigButton');
		this._btnUploadAlignment.setIcon('adsk-icon-bug');
		this._btnUploadAlignment.setToolTip('UploadAlignment');
		this._btnUploadAlignment.onClick = (e) => {
			//this.onSample_UploadAlignment(e);
			console.log('alert');
		};

		// add button to the goup
		this._group = new Autodesk.Viewing.UI.ControlGroup('Accelerator.ControlGroup');
		this._group.addControl(this._btnUploadAlignment);

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
}

// const MyToolbar = () => {
// 	return (
// 		<div className="toolbar" id="myToolbar">
// 			<h6>Hello world</h6>
// 		</div>
// 	);
// };

Autodesk.Viewing.theExtensionManager.registerExtension(ExtensionId, AIMSPainterForgeExtension);

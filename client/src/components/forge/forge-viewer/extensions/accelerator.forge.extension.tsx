import { isNullOrUndefined } from 'util';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './accelerator.forge.extension.scss';

import ServiceManager from '../../../../services/manager.service';

const THREE = window.THREE;

const ExtensionId = 'Accelerator';
export class AIMSPainterForgeExtension extends Autodesk.Viewing.Extension {
	_group: Autodesk.Viewing.UI.ControlGroup | null;
	_btnUploadAlignment: Autodesk.Viewing.UI.Button | null;
	_toolbar: Autodesk.Viewing.UI.ToolBar | null;
	_alignmentService: any = ServiceManager.getService('AlignmentService');

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
		this._btnUploadAlignment = new Autodesk.Viewing.UI.Button('Accelerator.GetAlignmentData');
		this._btnUploadAlignment.setIcon('adsk-icon-bug');
		this._btnUploadAlignment.setToolTip('GetAlignmentData');
		this._btnUploadAlignment.onClick = () => {
			this.onAddAlignmentData();
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
	}


	onAddAlignmentData = () => {
		this.viewer.model.getObjectTree(instanceTree => {
			var myviewer = this.viewer;

			//Get all the objects IDs
			const ids = [] as any[];
			instanceTree.enumNodeChildren(
				instanceTree.getRootId(),
				id => {
					if (instanceTree.getChildCount(id) === 0) {
						ids.push(id);
					}
				},
				true
			);

			//get XYZ points from alignments and add in data
			var data = [];
			for (var i = 0; i < ids.length; i++) {
				data.push({
					dbid: ids[i],
					XYZs: this.XYZPointsfromID(ids[i])
				});
			}

			if (data) {
				this._alignmentService.addAlignment(data);
			}
		});
	}

	XYZPointsfromID = (nodeId: number) => {
		var result = [] as THREE.Vector3[];
		const myviewer = this.viewer;

		this.viewer.model.getInstanceTree().enumNodeFragments(nodeId, (frag) => {
			let impl = myviewer.impl as any
			let fragProxy = impl.getFragmentProxy(myviewer.model, frag);

			var frags = fragProxy.frags.getVizmesh(fragProxy.fragId);

			var vb_array = frags.geometry.vb;

			//loop through vb to get pos
			var pos0 = new THREE.Vector3(vb_array[0], vb_array[1], vb_array[2]);

			result.push(frags.localToWorld(pos0).multiplyScalar(1000).round().multiplyScalar(0.001));

			var i = 6;
			while (i < vb_array.length) {
				var pos = new THREE.Vector3(vb_array[i], vb_array[i + 1], vb_array[i + 2]);
				var world_pos = frags.localToWorld(pos);
				world_pos = new THREE.Vector3(parseFloat(world_pos.x.toFixed(3)), parseFloat(world_pos.y.toFixed(3)), parseFloat(world_pos.z.toFixed(3)));
				result.push(world_pos);
				i += 12;
			}
		});
		return result;
	}
}


Autodesk.Viewing.theExtensionManager.registerExtension(ExtensionId, AIMSPainterForgeExtension);
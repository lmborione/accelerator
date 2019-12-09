// import { Vector4 } from 'three-full';
import { isNullOrUndefined } from 'util';

const Three = require('three-full');
const ExtensionId = 'AIMSPainter';
export class AIMSPainterForgeExtension extends Autodesk.Viewing.Extension {
	_group: Autodesk.Viewing.UI.ControlGroup | null;
	_button: Autodesk.Viewing.UI.Button | null;

	constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
		super(viewer, options);
		this._group = null;
		this._button = null;
	}

	load() {
		// return true;

		// this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (e: any) => {
		// 	console.log(e);

		// 	if (e.dbIdArray.length) {
		// 		var dbId = e.dbIdArray[0];
		// 		console.log('DbId: ' + dbId);
		// 		this.viewer.setThemingColor(dbId, new THREE.Vector4(0, 1, 1, 1));
		// 	}
		// });

		//this.viewer.setBackgroundColor(255, 226, 110, 219, 219, 219);

		// this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
		// 	console.log('here');
		// 	// const scene: THREE.Scene = new THREE.Scene();
		// 	// scene.background = new THREE.Color(1, 0, 0);
		// 	//this.viewer.setThemingColor(3029, new THREE.Vector4(255 / 255, 255 / 255, 102 / 255, 1));
		// 	//this.viewer.impl.invalidate(true, true, true);
		// });
		console.log(`${ExtensionId} has been loaded`);
		return true;
	}

	unload() {
		// Clean our UI elements if we added any
		if (this._group) {
			this._group.removeControl(this._button!);
			if (this._group.getNumberOfControls() === 0) {
				this.viewer.toolbar.removeControl(this._group);
			}
		}
		console.log(`${ExtensionId} has been unloaded`);
		return true;
	}

	// showPainted(painted: any) {
	// 	const ids = painted.map((e: any) => e.objectId);
	// 	const color = new THREE.Vector4(255 / 255, 0, 0, 0.5);
	// 	console.log(ids);

	// 	if (!isNullOrUndefined(this.viewer)) {
	// 		for (let i = 0; i < ids.length; i++) {
	// 			this.viewer.setThemingColor(ids[i], color);
	// 		}
	// 	}
	// }

	onToolbarCreated() {
		console.log('here');

		// Create a new toolbar group if it doesn't exist
		this._group = this.viewer.toolbar.getControl('allMyExtensionToolbar') as Autodesk.Viewing.UI.ControlGroup;
		if (!this._group) {
			this._group = new Autodesk.Viewing.UI.ControlGroup('allMyExtensionToolbar');
			this.viewer.toolbar.addControl(this._group);
		}

		// Add a new button to the toolbar group
		this._button = new Autodesk.Viewing.UI.Button('myExtensionButton');
		this._button.onClick = (ev) => {
			this.viewer.clearThemingColors(this.viewer.model);
			this.viewer.setThemingColor(3293, new Three.Vector4(1, 0, 0, 1));
			//this.viewer.setThemingColor(3029, new THREE.Vector4(1, 0, 0, 1));
			//this.viewer.impl.scene.background = new THREE.Color(1, 0, 0);
			// Execute an action here			;
		};

		this._button.setToolTip('My  Extension');
		this._button.setIcon('adsk-icon-bug');
		this._group.addControl(this._button);
	}
}

Autodesk.Viewing.theExtensionManager.registerExtension(ExtensionId, AIMSPainterForgeExtension);

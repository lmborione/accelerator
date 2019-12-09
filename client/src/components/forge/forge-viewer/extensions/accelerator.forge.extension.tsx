import { isNullOrUndefined } from 'util';

const THREE = window.THREE;

const ExtensionId = 'Accelerator';
export class AIMSPainterForgeExtension extends Autodesk.Viewing.Extension {
	_group: Autodesk.Viewing.UI.ControlGroup | null;
	_button: Autodesk.Viewing.UI.Button | null;

	constructor(viewer: Autodesk.Viewing.GuiViewer3D, options: any) {
		super(viewer, options);
		this._group = null;
		this._button = null;
	}

	load() {
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

	onToolbarCreated() {
		// Create a new toolbar group if it doesn't exist
		this._group = this.viewer.toolbar.getControl('allMyExtensionToolbar') as Autodesk.Viewing.UI.ControlGroup;
		if (!this._group) {
			this._group = new Autodesk.Viewing.UI.ControlGroup('allMyExtensionToolbar');
			this.viewer.toolbar.addControl(this._group);
		}

		// Add a new button to the toolbar group
		this._button = new Autodesk.Viewing.UI.Button('myExtensionButton');
		this._button.onClick = (ev) => {
			// Execute an action here			;
			const ids = [ 60, 95, 132 ];
			const color = new THREE.Vector4(1, 0, 0, 1);
			if (this.viewer) {
				for (let i = 0; i < ids.length; i++) {
					console.log(ids[i]);
					this.viewer.setThemingColor(ids[i], color);
				}
			}
		};

		this._button.setToolTip('My  Extension');
		this._button.setIcon('adsk-icon-bug');
		this._group.addControl(this._button);
	}
}

Autodesk.Viewing.theExtensionManager.registerExtension(ExtensionId, AIMSPainterForgeExtension);

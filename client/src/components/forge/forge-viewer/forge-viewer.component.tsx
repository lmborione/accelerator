import React, { Component } from 'react';
import './forge-viewer.component.scss';
// import { Vector4, Color, Matrix4, MeshPhongMaterial, DoubleSide } from 'node_modules/three-full/builds';
// import { Vector4 } from '../../../../node_modules/three-full/builds/Three.es';
// import { AIMSPainterForgeExtension } from './extensions/aimspainter.forge.extension';
import './extensions/aimspainter.forge.extension';
import ServiceManager from '../../../services/manager.service';
import { isNullOrUndefined } from 'util';

const Three = require('three-full');

interface ForgeViewerProps {
	urn: string;
	painted: any;
	onSelectionChanged?: (event: any) => void;
}

interface ForgeViewerState {
	//viewer?: Autodesk.Viewing.GuiViewer3D;
	paintedChanged: boolean;
}

class ForgeViewer extends Component<ForgeViewerProps, ForgeViewerState> {
	viewerContainer?: HTMLDivElement = undefined;
	_viewer?: Autodesk.Viewing.GuiViewer3D;

	_extension: any;
	state = {
		//viewer: undefined,
		paintedChanged: false
	};

	_model?: Autodesk.Viewing.Model = undefined;

	componentDidMount() {
		const options = {
			env: 'AutodeskProduction',
			getAccessToken: ServiceManager.getService('ForgeService').getToken
		};

		Autodesk.Viewing.Initializer(options, () => {
			// const viewer = new Autodesk.Viewing.GuiViewer3D(this.viewerContainer!);
			this._viewer = new Autodesk.Viewing.GuiViewer3D(this.viewerContainer!);

			// this.setState({
			// 	viewer: viewer
			// });

			//initialize extension : use new key word to register the extension in autodesk extension manager
			this._viewer.loadExtension('AIMSPainter');

			const color = new Three.Vector4(255 / 255, 0, 0, 0.5);

			// if (this.props.onSelectionChanged) {
			this._viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event: any) => {
				// var DBids = viewer.impl.selector.getAggregateSelection();
				this._viewer!.clearThemingColors(this._model!);
				if (event.dbIdArray && event.dbIdArray.length > 0) {
					console.log(event.dbIdArray[0]);

					this._viewer!.setThemingColor(event.dbIdArray[0], color);
				}
			});

			// 	// 	// ForgeViewer.getLeafNodes(viewer.model, undefined)
			// 	// 	// 	.then((leafNodes: any) => {
			// 	// 	// 		console.log(leafNodes);
			// 	// 	// 		console.log(viewer.model);

			// 	// 	// 		// Call setThemingColor for every leaf node.
			// 	// 	// 		for (let i = 0; i < leafNodes.length; i++) {
			// 	// 	// 			viewer.setThemingColor(leafNodes[i], color, viewer.model, true);
			// 	// 	// 		}
			// 	// 	// 	})
			// 	// 	// 	.catch((error) => console.warn(error));

			// 	// 	// const selection = event;
			// 	// 	// const dbIds = selection.dbIdArray;
			// 	// 	// const model = selection.model;
			// 	// 	// const fragIds = await ForgeViewer.getFragIds(model, dbIds);
			// 	// 	// console.log(fragIds);

			// 	// 	// this.setColorMaterial(model, fragIds);

			// 	// 	// if (this.props.onSelectionChanged) {
			// 	// 	// 	this.props.onSelectionChanged(event);
			// 	// 	// }
			// 	// });
			// }

			var startedCode = this._viewer.start();
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
						placementTransform: new Three.Matrix4(),
						globalOffset: {
							x: 0,
							y: 0,
							z: 0
						}
					};
					this._model = await this._viewer!.loadDocumentNode(viewerDocument, viewables[0], loadOptions);
					this.createColorMaterial();
					this.hideTexture();
				},
				this.onDocumentLoadFailure
			);
		});
	}

	// componentWillUnmount() {
	// 	console.log('unmount forge viewer');

	// 	if (this._viewer) {
	// 		const viewer = this._viewer! as Autodesk.Viewing.Private.GuiViewer3D;

	// 		viewer.tearDown();
	// 		viewer.finish();
	// 		// Autodesk.Viewing.shutdown();
	// 		// if (viewer.impl.selector) {

	// 		// 	viewer.tearDown();
	// 		// 	viewer.finish();

	// 		// }

	// 		// this.setState({
	// 		// 	viewer: undefined
	// 		// });
	// 	}
	// }

	oldTextures: any = {};
	oldColors: any = {};
	hideTexture() {
		//get materials list
		var mats = this._viewer!.impl.matman()._materials;
		console.log(mats);

		var obj: any = {};

		//define a grey color
		var grey = new Three.Color(0.5, 0.5, 0.5);

		//iterate materials
		for (const index in mats) {
			//index is the material name (unique string in the list)
			const m = mats[index];

			//store texture info
			this.oldTextures[index] = m.map;
			this.oldColors[index] = m.color;

			//set the material without texture and the grey color
			m.map = null;
			m.color = grey;

			//mark the material dirty. The viewer will refresh
			m.needsUpdate = true;
		}

		//refresh the scene
		this._viewer!.impl.invalidate(true, true, false);
	}

	//show texture
	showTexture() {
		//get materials list
		var mats = this._viewer!.impl.matman()._materials;

		//iterate materials
		for (const index in mats) {
			//index is the material name (unique string in the list)

			const m = mats[index];

			//restore
			m.map = this.oldTextures[index];
			m.color = this.oldColors[index];
			m.needsUpdate = true;
		}

		//refresh the scene

		this._viewer!.impl.invalidate(true, true, false);
	}

	static getFragIds(model: any, dbIds: any) {
		return new Promise(async (resolve, reject) => {
			try {
				const it = model.getData().instanceTree;

				dbIds = dbIds || it.getRootId();

				const dbIdArray = Array.isArray(dbIds) ? dbIds : [ dbIds ];

				const leafIds: any = it ? await ForgeViewer.getLeafNodes(model, dbIdArray) : dbIdArray;

				let fragIds: any = [];

				for (var i = 0; i < leafIds.length; ++i) {
					if (it) {
						it.enumNodeFragments(leafIds[i], (fragId: any) => {
							fragIds.push(fragId);
						});
					} else {
						const leafFragIds = ForgeViewer.getLeafFragIds(model, leafIds[i]);

						fragIds = [ ...fragIds, ...leafFragIds ];
					}
				}

				return resolve(fragIds);
			} catch (ex) {
				return reject(ex);
			}
		});
	}

	static getLeafNodes(model: any, dbIds: any) {
		return new Promise((resolve, reject) => {
			try {
				const instanceTree = model.getData().instanceTree || model.getFragmentMap();

				dbIds = dbIds || instanceTree.getRootId();

				const dbIdArray = Array.isArray(dbIds) ? dbIds : [ dbIds ];

				const leafIds: any = [];

				const getLeafNodeIdsRec = (id: any) => {
					let childCount = 0;

					instanceTree.enumNodeChildren(id, (childId: any) => {
						getLeafNodeIdsRec(childId);
						++childCount;
					});

					if (childCount === 0) {
						leafIds.push(id);
					}
				};

				dbIdArray.forEach((dbId) => {
					getLeafNodeIdsRec(dbId);
				});

				return resolve(leafIds);
			} catch (ex) {
				return reject(ex);
			}
		});
	}

	static getLeafFragIds(model: any, leafId: any) {
		if (model.getData().instanceTree) {
			const it = model.getData().instanceTree;

			const fragIds: any = [];

			it.enumNodeFragments(leafId, (fragId: any) => {
				fragIds.push(fragId);
			});

			return fragIds;
		} else {
			const fragments = model.getData().fragments;

			const fragIds = fragments.dbId2fragId[leafId];

			return !Array.isArray(fragIds) ? [ fragIds ] : fragIds;
		}
	}

	componentWillReceiveProps(props: ForgeViewerProps) {
		this.setState({
			paintedChanged: !this.state.paintedChanged
		});

		this.showPainted(props.painted);
	}

	onDocumentLoadFailure() {
		console.error('Failed fetching Forge manifest');
	}

	setColorMaterial(dbids: any) {
		// const mats = this._viewer!.impl.matman()._materials;
		// const material = mats['myNewMaterial'];
		var red = new Three.Color(1, 0.5, 0.5);
		//console.log(material);
		const fragList = this._viewer!.model.getFragmentList();
		const instanceTree = this._viewer!.model.getData().instanceTree;
		for (let dbid of dbids) {
			instanceTree.enumNodeFragments(dbid, (frag: any) => {
				console.log(frag);

				//fragList.setMaterial(frag, material);

				const mat = fragList.getMaterial(frag);
				console.log(mat);

				mat.color = red;
				mat.needUpdate = true;
			});
		}

		// fragIds.forEach((fragId: any) => {
		// 	console.log(fragId);

		// 	this._viewer!.model.getFragmentList().setMaterial(fragId, material);
		// });
		this._viewer!.impl.invalidate(true, true, false);
	}

	createColorMaterial() {
		const materialColor = '#D02D2D';
		const colorHexStr = materialColor.replace('#', '0x');
		const colorInt: number = parseInt(colorHexStr, 16);

		const material = new Three.MeshPhongMaterial({
			specular: new Three.Color(colorInt),
			side: Three.DoubleSide,
			reflectivity: 0.0,
			color: colorInt
		});

		this._viewer!.impl.matman().addMaterial('myNewMaterial', material, true);

		return material;
	}

	showPainted(painted: any) {
		this.setColorMaterial([ 3293 ]);
		// if (this._extension) {
		// 	this._extension.showPainted(painted);
		// }
		const ids = painted.map((e: any) => e.objectId);
		const color = new Three.Vector4(255 / 255, 0, 0, 0.5);
		//const color = new THREE.Color(255 / 255, 0, 0);

		// if (!isNullOrUndefined(this._viewer)) {
		// 	//const viewer = this._viewer! as Autodesk.Viewing.GuiViewer3D;

		// 	if (this._model) {
		// 		// this._model!.clearThemingColors();
		// 		// this._model!.visibilityManager.show(ids[0]);
		// 		for (let i = 0; i < ids.length; i++) {
		// 			console.log(ids[i]);
		// 			//this._model!.setThemingColor(ids[i], color, true);
		// 			this._viewer.setThemingColor(ids[i], color);
		// 		}
		// 	}
		// 	//viewer.impl.invalidate(false);
		// }
	}

	render() {
		return <div id="viewer" className="viewer" ref={(div) => (this.viewerContainer = div!)} />;
	}
}

export default ForgeViewer;

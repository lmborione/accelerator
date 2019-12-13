import React, { Component } from 'react';
import './object.page.scss';
import ServiceManager from '../../services/manager.service';

import { Spinner, Button } from 'react-bootstrap';
import AssetList from '../../components/objects/object-list.component';
import ObjectList from '../../components/objects/object-list.component';

interface ObjectViewState {
	objects: any[];
	readOnlyFields: string[];
}

class ObjectView extends Component<{}, ObjectViewState> {
	_objectService: any = ServiceManager.getService('ObjectsService');

	state = {
		objects: [],
		readOnlyFields: []
	};

	componentDidMount() {
		this._objectService.getObjects(-1, -1).then((response: any) => {
			console.log(response.readOnlyFields);

			this.setState({
				objects: response.data,
				readOnlyFields: response.readOnlyFields as string[]
			});
		});
	}

	onNewObject = () => {};

	render() {
		return (
			<div className="page">
				<h4>Objects List</h4>
				<Button onClick={this.onNewObject}>Add new object</Button>
				<Button>Save</Button>
				<div className="obj-list">
					<ObjectList
						fetchData={false}
						data={this.state.objects}
						displayColumnIndexes={[ 12, 1, 4, 5, 3, 6, 7 ]}
						readOnlyFields={this.state.readOnlyFields}
						editable={true}
					/>
				</div>
			</div>
		);
	}
}

export default ObjectView;

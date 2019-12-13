import React, { Component } from 'react';

import ServiceManager from '../../services/manager.service';

import { Spinner } from 'react-bootstrap';
import AssetList from '../../components/objects/object-list.component';
import ObjectList from '../../components/objects/object-list.component';

interface ObjectViewState {
	objects: any[];
}

class ObjectView extends Component<{}, ObjectViewState> {
	_objectService: any = ServiceManager.getService('ObjectsService');

	state = {
		objects: []
	};

	componentDidMount() {
		this._objectService.getObjects(-1, -1).then((response: any) => {
			console.log(response);

			this.setState({
				objects: response.data
			});
		});
	}

	render() {
		return (
			<div>
				<ObjectList fetchData={false} data={this.state.objects} displayColumnIndexes={[ -1 ]} editable={true} />
			</div>
		);
	}
}

export default ObjectView;

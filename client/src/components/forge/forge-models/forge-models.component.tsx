import React, { Component } from 'react';
import './forge-models.component.scss';
import { Container, Pagination } from 'react-bootstrap';

import { ForgeModelsProps, ForgeModelsState } from './forge-models';

import ModelGrid from './model-grid/model-grid.component';

class ForgeModels extends Component<ForgeModelsProps, ForgeModelsState> {
	static defaultProps = {
		data: [],
		showPagination: true,
		column: 1,
		row: 1
	};

	state = {
		pages: [],
		loaded: false,
		start: 0,
		end: 1,
		fluid: false
	};

	async componentDidMount() {
		const pages = [];
		for (let i = 1; i < this.props.data.length / (this.props.row * this.props.column) + 1; i++) {
			pages.push(<Pagination.Item key={`forgepagination-${i}`}>{i}</Pagination.Item>);
		}

		this.setState({
			end: this.props.row * this.props.column,
			pages: pages,
			fluid: this.props.column > 4
		});
	}

	pageChanged(e: any) {
		const index: number = e.target.text;
		this.setState({
			start: (index - 1) * (this.props.row * this.props.column),
			end: index * (this.props.row * this.props.column)
		});
	}

	render() {
		if (this.props.showPagination) {
			return (
				<div className="model-gallery">
					<ModelGrid {...{ ...this.props, ...this.state }} />
					<Pagination onClick={this.pageChanged.bind(this)}>{this.state.pages}</Pagination>
				</div>
			);
		} else {
			return (
				<ModelGrid
					fluid={this.state.fluid}
					column={this.props.column}
					row={this.props.row}
					start={this.state.start}
					end={this.state.end}
					data={this.props.data}
				/>
			);
		}
	}
}

export default ForgeModels;

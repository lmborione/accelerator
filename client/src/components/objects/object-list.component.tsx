import React, { Component } from 'react';

import './object-list.component.scss';
import ServiceManager from '../../services/manager.service';

import ReactTable, { Column, ComponentPropsGetterRC, ComponentPropsGetterR, RowInfo } from 'react-table';
import 'react-table/react-table.css';
// var classNames = require('classnames');
import classNames from 'classnames';

interface ObjectListProps {
	fetchData: boolean;
	getData?: (page: number, limit: number) => Promise<{ pages: number; data: any[] }>;
	data?: any[];
	readOnlyFields: number[];
	displayColumnIndexes: number[];
	editable: boolean;
	onClick?: (row: any) => void;
}

interface ObjectListState {
	selectionChanged: boolean;
	displayData: any[];
	columns: any[];
	page: number;
	pages: number;
	pageSize: number;
}

class ObjectList extends Component<ObjectListProps, ObjectListState> {
	state = {
		displayData: [],
		columns: [],
		page: 0,
		pages: -1,
		pageSize: 10,
		selectionChanged: false
	};

	tmp: Set<unknown>;

	constructor(props: ObjectListProps) {
		super(props);
		this.tmp = new Set();
	}

	componentWillReceiveProps(props: ObjectListProps) {
		if (!props.fetchData && props.data) {
			this.setState({
				displayData: props.data,
				columns: this.parseColumn(props.data[0])
			});
		}
	}

	handleInputChange = (cellInfo: any, event: any) => {
		let data = [ ...this.state.displayData ];
		data[cellInfo.index][cellInfo.column.id] = event.target.value as never;
		this.setState({ displayData: data });
	};

	renderEditable = (cellInfo: any) => {
		// console.log(cellInfo.column.id);

		const columnId = cellInfo.column.id;

		const cellValue = this.state.displayData[cellInfo.index][cellInfo.column.id];
		if (this.props.editable && !this.props.readOnlyFields.includes(columnId)) {
			return (
				<input
					placeholder="type here"
					name="input"
					type="text"
					className="table-input"
					onClick={this.props.onClick!}
					onChange={this.handleInputChange.bind(null, cellInfo)}
					value={cellValue}
				/>
			);
		} else {
			return (
				<span
					onClick={() => {
						if (this.props.onClick) {
							this.props.onClick(this.state.displayData[cellInfo.index]);
						}
					}}
				>
					{cellValue}
				</span>
			);
		}
	};

	parseColumn(obj: any) {
		if (this.props.displayColumnIndexes && this.props.displayColumnIndexes.length > 0) {
			if (this.props.displayColumnIndexes[0] === -1) {
				return Object.keys(obj).map((key, index) => {
					return {
						Header: key,
						accessor: key,
						Cell: this.renderEditable,
						minWidth: index > 1 ? 50 : 135,
						filterMethod: (filter: any, row: any) => {
							return row[filter.id].includes(filter.value);
						},

						width: index > 0 ? (index > 1 ? 170 : 100) : 135
					};
				});
			} else {
				return this.props.displayColumnIndexes.map((index: number) => {
					const key = Object.keys(obj)[index];
					return {
						Header: key,
						accessor: key,
						Cell: this.renderEditable,
						minWidth: index > 1 ? 50 : 135,
						width: index > 0 ? (index > 1 ? 170 : 100) : 135
					};
				});
			}
		}
		return [];
	}

	onPageSizeChange = (pageSize: number) => {
		this.setState({
			pageSize: pageSize,
			page: 0
		});
	};

	onPageChange = (page: number) => {
		this.setState({
			page: page
		});
	};

	onRowClick = (row: any) => {
		this.tmp.clear();
		this.tmp.add(row);
		this.setState({
			selectionChanged: this.state.selectionChanged ? false : true
		});
	};

	isRowSelected = (rowID: any) => {
		return this.tmp.has(rowID);
	};

	onFetchData = async (state: ObjectListState, instance: any) => {
		if (this.props.getData) {
			const response = await this.props.getData(state.page, state.pageSize);
			console.log(response);

			this.setState({
				displayData: response.data,
				pages: response.pages,
				columns: this.parseColumn(response.data[0])
			});
		}
	};

	getTdProps = (state: any, rowInfo: any) => {
		if (rowInfo !== undefined) {
			return {
				onClick: (event: any, handleOriginal: any) => {
					this.onRowClick(rowInfo.index);
				}
			};
		}
	};

	getTrProps = (state: any, rowInfo: any, column: any) => {
		if (rowInfo !== undefined) {
			return {
				className: classNames({
					'selected-row': this.isRowSelected(rowInfo.index)
				})
			};
		} else {
			return {
				className: 'test'
			};
		}
	};

	render() {
		console.log(this.props);

		let reactTable = undefined;
		if (this.props.fetchData) {
			reactTable = (
				<ReactTable
					className="react-table inner-border -striped -highlight"
					data={this.state.displayData}
					columns={this.state.columns}
					pageSize={this.state.pageSize}
					onPageSizeChange={this.onPageSizeChange}
					pages={this.state.pages} // should default to -1 (which means we don't know how many pages we have)
					page={this.state.page}
					onPageChange={this.onPageChange}
					filterable={false}
					manual // informs React Table that you'll be handling sorting and pagination server-side
					onFetchData={this.onFetchData}
					getTdProps={this.getTdProps}
					getTrProps={this.getTrProps}
				/>
			);
		} else {
			reactTable = (
				<ReactTable
					className="react-table inner-border -striped -highlight"
					data={this.state.displayData}
					columns={this.state.columns}
					filterable={true}
				/>
			);
		}

		return <div className="inner-border">{reactTable}</div>;
	}
}

export default ObjectList;

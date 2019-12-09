import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';

import { ForgeModel } from '../../../../core/forgeModel';
import { GridProp } from '../forge-models';
import ForgeModelInterface from './model.component';

const ModelGrid = (props: GridProp) => {
	const lastIndex = Math.min(props.end, props.data.length);

	const renderForgeModelInterface = (index: number, forgeElement: ForgeModel) => {
		if (index < lastIndex) {
			return (
				<Col key={`forgemodelcol-${index}`}>
					<ForgeModelInterface
						name={forgeElement.name}
						thumbnail={forgeElement.thumbnail}
						urn={forgeElement.urn}
						key={`forgemodel-${index}`}
					/>
				</Col>
			);
		}
		// return (
		// 	// <Col className=".col-md-1" key={`forgemodelcol-${index}`}>

		// 	// </Col>
		// );
	};

	const renderRows = [];
	for (let i = 0; i < props.row; i++) {
		const renderColumnOnRow = [];
		for (let j = 0; j < props.column; j++) {
			const itemIndex = props.start + i * props.column + j;
			const element = props.data[itemIndex];
			renderColumnOnRow.push(renderForgeModelInterface(itemIndex, element));
		}

		renderRows.push(<Row key={`forgegridrow-${i}`}>{renderColumnOnRow}</Row>);
	}

	return <Container fluid={props.fluid}>{renderRows}</Container>;
};

export default ModelGrid;

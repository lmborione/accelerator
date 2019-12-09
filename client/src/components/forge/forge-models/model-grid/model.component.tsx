import React from 'react';
import { Image } from 'react-bootstrap';

import { useHistory } from 'react-router-dom';

import { ForgeModel } from '../../../../core/forgeModel';

const ForgeModelInterface = (props: ForgeModel) => {
	let history = useHistory();

	const openModel = () => {
		history.push({
			pathname: '/viewer',
			state: { urn: props.urn }
		});
	};

	return (
		<div>
			<Image
				className="block-example border"
				src={`data:image/png;base64,${props.thumbnail}`}
				onClick={openModel}
				style={{ cursor: 'pointer' }}
				rounded
			/>
			<h6>{props.name}</h6>
		</div>
	);
};

export default ForgeModelInterface;

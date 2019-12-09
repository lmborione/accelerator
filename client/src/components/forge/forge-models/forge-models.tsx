import { ForgeModel } from '../../../core/forgeModel';

export type GridSize = {
	column: number;
	row: number;
};

export type GridData = {
	start: number;
	end: number;
	fluid: boolean;
};

export type GridProp = GridSize & GridData & { data: ForgeModel[] };

export type ForgeModelsState = GridData & {
	pages: any[];
};

export type ForgeModelsProps = GridSize & {
	showPagination: boolean;
	data: ForgeModel[];
};

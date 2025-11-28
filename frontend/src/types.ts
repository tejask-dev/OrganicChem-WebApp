export interface StructureResponse {
    iupac_name: string;
    common_name?: string;
    smiles: string;
    molecular_formula: string;
    molecular_weight: number;
    exact_mass: number;
    inchi: string;
    functional_groups: string[];
    mol_block_2d: string;
    mol_block_3d?: string;
    svg_2d?: string;  // SVG representation for display
    error?: string;
}

export interface ExplanationResponse {
    explanation: string;
}

export type InputMode = 'draw' | 'name' | 'upload';

export interface TutorialStep {
    target: string;
    title: string;
    content: string;
    placement: 'top' | 'bottom' | 'left' | 'right';
}

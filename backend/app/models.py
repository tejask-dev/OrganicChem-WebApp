from pydantic import BaseModel
from typing import List, Optional

class StructureRequest(BaseModel):
    structure: str  # SMILES or Name
    inputType: str  # 'smiles' or 'name'

class StructureResponse(BaseModel):
    iupac_name: str
    common_name: Optional[str] = None
    smiles: str
    molecular_formula: str
    molecular_weight: float
    exact_mass: float
    inchi: str
    functional_groups: List[str]
    mol_block_2d: str
    mol_block_3d: Optional[str] = None
    svg_2d: Optional[str] = None  # SVG representation for display
    error: Optional[str] = None

class ExplanationResponse(BaseModel):
    explanation: str

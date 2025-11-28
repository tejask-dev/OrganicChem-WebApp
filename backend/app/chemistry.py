from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors, rdMolDescriptors
from rdkit.Chem.Draw import rdMolDraw2D
import requests
import urllib.parse
from .models import StructureResponse

# Comprehensive functional group SMARTS patterns
FUNCTIONAL_GROUPS = {
    # Nitrogen-containing (more specific patterns)
    "Amine (Primary)": "[NX3H2;!$(NC=O)]",
    "Amine (Secondary)": "[NX3H1;!$(NC=O)]([#6])[#6]",
    "Amine (Tertiary)": "[NX3;H0;!$(NC=O);!$([nR])]([#6])([#6])[#6]",
    "N-Methyl": "[#7][CH3]",  # N attached to methyl
    "Amide": "[#7][#6](=[OX1])",  # More general amide
    "Lactam (Cyclic Amide)": "[#7;R][#6;R](=[OX1])",  # Cyclic amide in ring
    "Urea/Urea-like": "[NX3][CX3](=[OX1])[NX3]",  # N-C(=O)-N
    "Imide": "[CX3](=[OX1])[NX3][CX3](=[OX1])",
    "Imine": "[#6]=[NX2]",  # C=N
    "Nitrile": "[NX1]#[CX2]",
    "Nitro": "[$([NX3](=O)=O),$([NX3+](=O)[O-])]",
    
    # Oxygen-containing
    "Alcohol": "[OX2H][CX4]",
    "Phenol": "[OX2H]c",
    "Aldehyde": "[CX3H1](=O)",
    "Ketone": "[#6][CX3](=O)[#6;!$([OX2])]",
    "Carboxylic Acid": "[CX3](=O)[OX2H1]",
    "Ester": "[#6][CX3](=O)[OX2][#6]",
    "Ether": "[OD2]([#6])[#6]",
    "Carbonyl (C=O)": "[#6](=[OX1])",
    
    # Aromatic
    "Aromatic Ring": "[a]",
    "Benzene Ring": "c1ccccc1",
    "Purine": "[#7]1[#6][#7][#6]2[#6]1[#7][#6][#7]2",  # Purine base
    "Imidazole": "[nR1]1[cR1][nR1][cR1][cR1]1",
    "Heterocyclic (N)": "[nR]",
    "Heterocyclic (O)": "[oR]",
    "Heterocyclic (S)": "[sR]",
    
    # Unsaturated
    "Alkene": "[CX3]=[CX3]",
    "Alkyne": "[CX2]#[CX2]",
    
    # Halides
    "Fluoride": "[#6][F]",
    "Chloride": "[#6][Cl]",
    "Bromide": "[#6][Br]",
    "Iodide": "[#6][I]",
    
    # Sulfur-containing
    "Thiol": "[#6][SX2H]",
    "Sulfide": "[#6][SX2][#6]",
    "Sulfoxide": "[#6][SX3](=O)[#6]",
    "Sulfone": "[#6][SX4](=O)(=O)[#6]",
    
    # Phosphorus
    "Phosphate": "[PX4](=O)([OX2])([OX2])[OX2]",
    
    # Other
    "Methyl Group": "[CH3]",
    "Alkane (saturated C)": "[CX4H3,CX4H2,CX4H1,CX4H0]",
}

# Common molecule database
COMMON_MOLECULES = {
    "aspirin": {"smiles": "CC(=O)OC1=CC=CC=C1C(=O)O", "iupac": "2-acetoxybenzoic acid", "common": "Aspirin"},
    "caffeine": {"smiles": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C", "iupac": "1,3,7-trimethylpurine-2,6-dione", "common": "Caffeine"},
    "ethanol": {"smiles": "CCO", "iupac": "ethanol", "common": "Ethanol"},
    "methanol": {"smiles": "CO", "iupac": "methanol", "common": "Methanol"},
    "glucose": {"smiles": "OC[C@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O", "iupac": "D-glucose", "common": "Glucose"},
    "benzene": {"smiles": "c1ccccc1", "iupac": "benzene", "common": "Benzene"},
    "acetone": {"smiles": "CC(=O)C", "iupac": "propan-2-one", "common": "Acetone"},
    "acetic acid": {"smiles": "CC(=O)O", "iupac": "acetic acid", "common": "Acetic Acid"},
    "acetaminophen": {"smiles": "CC(=O)NC1=CC=C(O)C=C1", "iupac": "N-(4-hydroxyphenyl)acetamide", "common": "Acetaminophen"},
    "paracetamol": {"smiles": "CC(=O)NC1=CC=C(O)C=C1", "iupac": "N-(4-hydroxyphenyl)acetamide", "common": "Paracetamol"},
    "ibuprofen": {"smiles": "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O", "iupac": "2-(4-isobutylphenyl)propanoic acid", "common": "Ibuprofen"},
    "nicotine": {"smiles": "CN1CCC[C@H]1C2=CN=CC=C2", "iupac": "3-(1-methylpyrrolidin-2-yl)pyridine", "common": "Nicotine"},
    "morphine": {"smiles": "CN1CC[C@]23[C@H]4OC5=C(O)C=CC(=C25)[C@H](O)[C@@H]1[C@@H]3C=C4", "iupac": "morphine", "common": "Morphine"},
    "cholesterol": {"smiles": "CC(C)CCC[C@@H](C)[C@H]1CC[C@@H]2[C@@]1(CC[C@H]3[C@H]2CC=C4[C@@]3(CC[C@@H](C4)O)C)C", "iupac": "cholesterol", "common": "Cholesterol"},
    "toluene": {"smiles": "CC1=CC=CC=C1", "iupac": "methylbenzene", "common": "Toluene"},
    "phenol": {"smiles": "OC1=CC=CC=C1", "iupac": "phenol", "common": "Phenol"},
    "aniline": {"smiles": "NC1=CC=CC=C1", "iupac": "aniline", "common": "Aniline"},
    "formaldehyde": {"smiles": "C=O", "iupac": "methanal", "common": "Formaldehyde"},
    "benzaldehyde": {"smiles": "O=CC1=CC=CC=C1", "iupac": "benzaldehyde", "common": "Benzaldehyde"},
    "naphthalene": {"smiles": "C1=CC2=CC=CC=C2C=C1", "iupac": "naphthalene", "common": "Naphthalene"},
    "cyclohexane": {"smiles": "C1CCCCC1", "iupac": "cyclohexane", "common": "Cyclohexane"},
    "propane": {"smiles": "CCC", "iupac": "propane", "common": "Propane"},
    "butane": {"smiles": "CCCC", "iupac": "butane", "common": "Butane"},
    "pentane": {"smiles": "CCCCC", "iupac": "pentane", "common": "Pentane"},
    "hexane": {"smiles": "CCCCCC", "iupac": "hexane", "common": "Hexane"},
    "ethene": {"smiles": "C=C", "iupac": "ethene", "common": "Ethylene"},
    "ethylene": {"smiles": "C=C", "iupac": "ethene", "common": "Ethylene"},
    "propene": {"smiles": "CC=C", "iupac": "propene", "common": "Propylene"},
    "ethyne": {"smiles": "C#C", "iupac": "ethyne", "common": "Acetylene"},
    "acetylene": {"smiles": "C#C", "iupac": "ethyne", "common": "Acetylene"},
    "water": {"smiles": "O", "iupac": "water", "common": "Water"},
    "ammonia": {"smiles": "N", "iupac": "ammonia", "common": "Ammonia"},
    "urea": {"smiles": "NC(=O)N", "iupac": "urea", "common": "Urea"},
    "glycine": {"smiles": "NCC(=O)O", "iupac": "glycine", "common": "Glycine"},
    "alanine": {"smiles": "CC(N)C(=O)O", "iupac": "alanine", "common": "Alanine"},
    "sucrose": {"smiles": "OC[C@H]1O[C@@](CO)(O[C@H]2O[C@H](CO)[C@@H](O)[C@H](O)[C@H]2O)[C@@H](O)[C@@H]1O", "iupac": "sucrose", "common": "Sucrose"},
    "fructose": {"smiles": "OC[C@H]1OC(O)(CO)[C@@H](O)[C@@H]1O", "iupac": "D-fructose", "common": "Fructose"},
    "citric acid": {"smiles": "OC(=O)CC(O)(CC(=O)O)C(=O)O", "iupac": "2-hydroxypropane-1,2,3-tricarboxylic acid", "common": "Citric Acid"},
    "lactic acid": {"smiles": "CC(O)C(=O)O", "iupac": "2-hydroxypropanoic acid", "common": "Lactic Acid"},
    "salicylic acid": {"smiles": "OC(=O)C1=CC=CC=C1O", "iupac": "2-hydroxybenzoic acid", "common": "Salicylic Acid"},
    "theobromine": {"smiles": "CN1C=NC2=C1C(=O)NC(=O)N2C", "iupac": "3,7-dimethylpurine-2,6-dione", "common": "Theobromine"},
    "theophylline": {"smiles": "CN1C(=O)N(C)C2=C1N=CN2", "iupac": "1,3-dimethyl-7H-purine-2,6-dione", "common": "Theophylline"},
    "dopamine": {"smiles": "NCCC1=CC(O)=C(O)C=C1", "iupac": "4-(2-aminoethyl)benzene-1,2-diol", "common": "Dopamine"},
    "serotonin": {"smiles": "NCCC1=CNC2=CC=C(O)C=C12", "iupac": "3-(2-aminoethyl)-1H-indol-5-ol", "common": "Serotonin"},
    "adrenaline": {"smiles": "CNC[C@H](O)C1=CC(O)=C(O)C=C1", "iupac": "4-(1-hydroxy-2-(methylamino)ethyl)benzene-1,2-diol", "common": "Adrenaline"},
    "epinephrine": {"smiles": "CNC[C@H](O)C1=CC(O)=C(O)C=C1", "iupac": "4-(1-hydroxy-2-(methylamino)ethyl)benzene-1,2-diol", "common": "Epinephrine"},
}


def is_likely_smiles(text: str) -> bool:
    """Check if the input looks like a SMILES string rather than a name."""
    text = text.strip()
    
    # IUPAC names typically contain these patterns
    iupac_indicators = [
        '-yl', '-ol', '-al', '-one', '-ane', '-ene', '-yne', '-oic', '-ate',
        '-amine', '-amide', '-oxide', '-ide', 'methyl', 'ethyl', 'propyl',
        'butyl', 'pentyl', 'hexyl', 'heptyl', 'octyl', 'nonyl', 'decyl',
        'phenyl', 'benzyl', 'cyclo', 'iso', 'neo', 'tert-', 'sec-', 'n-',
        'hydroxy', 'oxo', 'amino', 'nitro', 'chloro', 'bromo', 'fluoro',
        'acid', 'ester', 'ether', '-oxy', 'thio', 'sulfo', 'phospho',
        'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa', 'nona', 'deca',
        '1,', '2,', '3,', '4,', '5,', '6,', '7,', '8,', '9,',
        '1-', '2-', '3-', '4-', '5-', '6-', '7-', '8-', '9-',
    ]
    
    text_lower = text.lower()
    for indicator in iupac_indicators:
        if indicator in text_lower:
            return False
    
    # SMILES typically contain these characters prominently
    smiles_chars = set('=@#[]()+-/\\%')
    char_count = sum(1 for c in text if c in smiles_chars)
    
    # If more than 10% are SMILES-specific characters, likely SMILES
    if len(text) > 0 and char_count / len(text) > 0.1:
        return True
    
    # If it contains only valid SMILES characters and is short
    valid_smiles_chars = set('CNOPSFIBrcnopsfibl0123456789=@#[]()+-/\\%.')
    if all(c in valid_smiles_chars for c in text) and len(text) < 50:
        # Try to parse as SMILES
        mol = Chem.MolFromSmiles(text)
        if mol is not None:
            return True
    
    return False


def search_pubchem_by_name(name: str) -> dict:
    """Search PubChem REST API for a compound by name (handles IUPAC and common names)."""
    result = {"smiles": None, "iupac": None, "common": None}
    
    try:
        # URL encode the name properly
        encoded_name = urllib.parse.quote(name, safe='')
        
        # First, try to get CID from name
        cid_url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{encoded_name}/cids/JSON"
        print(f"PubChem lookup: {name}")
        
        cid_response = requests.get(cid_url, timeout=15)
        
        if cid_response.status_code != 200:
            print(f"PubChem CID lookup failed: {cid_response.status_code}")
            return result
            
        cid_data = cid_response.json()
        if 'IdentifierList' not in cid_data or 'CID' not in cid_data['IdentifierList']:
            print("No CID found in PubChem response")
            return result
            
        cid = cid_data['IdentifierList']['CID'][0]
        print(f"Found CID: {cid}")
        
        # Get properties using CID
        props_url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/property/IsomericSMILES,CanonicalSMILES,IUPACName/JSON"
        props_response = requests.get(props_url, timeout=15)
        
        if props_response.status_code == 200:
            props_data = props_response.json()
            if 'PropertyTable' in props_data and 'Properties' in props_data['PropertyTable']:
                props_list = props_data['PropertyTable']['Properties']
                if props_list and len(props_list) > 0:
                    props = props_list[0]
                    # Prefer IsomericSMILES, fall back to CanonicalSMILES
                    result['smiles'] = props.get('IsomericSMILES') or props.get('CanonicalSMILES')
                    result['iupac'] = props.get('IUPACName') or name
                    result['common'] = name.title()
                    if result['smiles']:
                        print(f"PubChem success: SMILES={result['smiles'][:30] if result['smiles'] else 'None'}...")
                    else:
                        print("PubChem returned no SMILES")
        
        # If no SMILES from properties, try to get structure directly
        if not result['smiles']:
            print(f"Trying direct SMILES fetch for CID {cid}")
            smiles_url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/property/CanonicalSMILES/TXT"
            smiles_response = requests.get(smiles_url, timeout=15)
            if smiles_response.status_code == 200:
                smiles_text = smiles_response.text.strip()
                if smiles_text and not smiles_text.startswith('{'):
                    result['smiles'] = smiles_text
                    result['iupac'] = name
                    result['common'] = name.title()
                    print(f"Got SMILES from TXT endpoint: {smiles_text[:30]}...")
                
    except requests.exceptions.Timeout:
        print("PubChem request timed out")
    except Exception as e:
        print(f"PubChem API error: {e}")
        import traceback
        traceback.print_exc()
    
    return result


def get_iupac_from_smiles(smiles: str) -> tuple:
    """Get IUPAC name from SMILES using PubChem."""
    iupac_name = ""
    common_name = ""
    
    try:
        encoded_smiles = urllib.parse.quote(smiles, safe='')
        url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/{encoded_smiles}/property/IUPACName/JSON"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if 'PropertyTable' in data and 'Properties' in data['PropertyTable']:
                props = data['PropertyTable']['Properties']
                if props and 'IUPACName' in props[0]:
                    iupac_name = props[0]['IUPACName']
    except Exception as e:
        print(f"IUPAC lookup error: {e}")
    
    return iupac_name, common_name


def get_compound_by_name(name: str) -> tuple:
    """Search for a compound by name - tries local DB first, then PubChem."""
    mol = None
    iupac_name = ""
    common_name = name
    smiles = ""
    
    # Check local database first (case-insensitive)
    name_lower = name.lower().strip()
    if name_lower in COMMON_MOLECULES:
        data = COMMON_MOLECULES[name_lower]
        smiles = data['smiles']
        iupac_name = data['iupac']
        common_name = data['common']
        mol = Chem.MolFromSmiles(smiles)
        if mol:
            print(f"Found in local DB: {name}")
            return mol, iupac_name, common_name, smiles
    
    # Try PubChem for any name (common or IUPAC)
    print(f"Searching PubChem for: {name}")
    pubchem_result = search_pubchem_by_name(name)
    
    if pubchem_result['smiles']:
        smiles = pubchem_result['smiles']
        iupac_name = pubchem_result['iupac'] or name
        common_name = pubchem_result['common'] or name
        mol = Chem.MolFromSmiles(smiles)
        if mol:
            print(f"PubChem returned valid molecule")
            return mol, iupac_name, common_name, smiles
        else:
            print(f"PubChem SMILES could not be parsed: {smiles}")
    
    return None, "", "", ""


def generate_2d_svg(mol: Chem.Mol) -> str:
    """Generate SVG representation."""
    try:
        mol_copy = Chem.Mol(mol)
        AllChem.Compute2DCoords(mol_copy)
        drawer = rdMolDraw2D.MolDraw2DSVG(400, 300)
        opts = drawer.drawOptions()
        opts.addStereoAnnotation = True
        opts.addAtomIndices = False
        opts.bondLineWidth = 2.0
        drawer.DrawMolecule(mol_copy)
        drawer.FinishDrawing()
        return drawer.GetDrawingText()
    except Exception as e:
        print(f"SVG error: {e}")
        return ""


def get_properties_from_mol(mol: Chem.Mol) -> dict:
    """Extract properties from molecule."""
    try:
        inchi = ""
        try:
            inchi = Chem.MolToInchi(mol)
        except:
            pass
        return {
            "smiles": Chem.MolToSmiles(mol, isomericSmiles=True),
            "molecular_formula": rdMolDescriptors.CalcMolFormula(mol),
            "molecular_weight": round(Descriptors.MolWt(mol), 4),
            "exact_mass": round(Descriptors.ExactMolWt(mol), 4),
            "inchi": inchi,
        }
    except Exception as e:
        print(f"Properties error: {e}")
        return {}


def detect_functional_groups(mol: Chem.Mol) -> list:
    """Detect functional groups with improved accuracy."""
    groups = []
    detected_patterns = {}
    
    for name, smarts in FUNCTIONAL_GROUPS.items():
        try:
            pattern = Chem.MolFromSmarts(smarts)
            if pattern:
                matches = mol.GetSubstructMatches(pattern)
                if matches:
                    detected_patterns[name] = len(matches)
        except:
            continue
    
    # Priority-based filtering to avoid redundant groups
    priority_groups = [
        # Nitrogen (specific to general)
        "Urea/Urea-like", "Lactam (Cyclic Amide)", "Amide", "Imide", "Imine", "Nitrile", "Nitro",
        "N-Methyl",
        "Amine (Tertiary)", "Amine (Secondary)", "Amine (Primary)",
        # Oxygen (specific to general)
        "Carboxylic Acid", "Ester", "Aldehyde", "Ketone", "Carbonyl (C=O)",
        "Phenol", "Alcohol", "Ether",
        # Aromatic
        "Benzene Ring", "Purine", "Imidazole", "Heterocyclic (N)", "Heterocyclic (O)", "Heterocyclic (S)", "Aromatic Ring",
        # Unsaturated
        "Alkyne", "Alkene",
        # Halides
        "Fluoride", "Chloride", "Bromide", "Iodide",
        # Sulfur
        "Sulfone", "Sulfoxide", "Sulfide", "Thiol",
        # Other
        "Phosphate", "Methyl Group",
    ]
    
    for group in priority_groups:
        if group in detected_patterns:
            groups.append(group)
    
    # Only add "Alkane" if no other significant groups found
    if not groups and "Alkane (saturated C)" in detected_patterns:
        groups.append("Alkane")
    
    return groups


def generate_3d_coords(mol: Chem.Mol) -> str:
    """Generate 3D coordinates."""
    try:
        mol_3d = Chem.AddHs(mol)
        
        # Try ETKDGv3 first
        params = AllChem.ETKDGv3()
        params.randomSeed = 42
        result = AllChem.EmbedMolecule(mol_3d, params)
        
        if result == -1:
            # Fallback to ETKDGv2
            params = AllChem.ETKDGv2()
            params.randomSeed = 42
            result = AllChem.EmbedMolecule(mol_3d, params)
        
        if result == -1:
            # Last resort: random coordinates
            params = AllChem.EmbedParameters()
            params.randomSeed = 42
            params.useRandomCoords = True
            result = AllChem.EmbedMolecule(mol_3d, params)
        
        if result == 0:
            try:
                AllChem.MMFFOptimizeMolecule(mol_3d, maxIters=200)
            except:
                try:
                    AllChem.UFFOptimizeMolecule(mol_3d, maxIters=200)
                except:
                    pass
            return Chem.MolToMolBlock(mol_3d)
            
    except Exception as e:
        print(f"3D error: {e}")
    return None


def process_structure(input_data: str, input_type: str) -> StructureResponse:
    """Main processing function."""
    mol = None
    iupac_name = ""
    common_name = ""
    
    try:
        if input_type == "smiles":
            # Direct SMILES input
            mol = Chem.MolFromSmiles(input_data)
            if not mol:
                return StructureResponse(
                    iupac_name="", smiles="", molecular_formula="",
                    molecular_weight=0, exact_mass=0, inchi="",
                    functional_groups=[], mol_block_2d="",
                    error="Invalid SMILES string."
                )
            iupac_name, common_name = get_iupac_from_smiles(input_data)
            if not iupac_name:
                iupac_name = "Name not available"

        elif input_type == "name":
            # Name input - ALWAYS search by name, never try to parse as SMILES
            print(f"Processing name input: {input_data}")
            mol, iupac_name, common_name, _ = get_compound_by_name(input_data)
            
            if not mol:
                return StructureResponse(
                    iupac_name="", smiles="", molecular_formula="",
                    molecular_weight=0, exact_mass=0, inchi="",
                    functional_groups=[], mol_block_2d="",
                    error=f"Could not find compound: '{input_data}'. Try a common name (e.g., Aspirin) or check spelling."
                )

        # Sanitize
        try:
            Chem.SanitizeMol(mol)
        except Exception as e:
            return StructureResponse(
                iupac_name="", smiles="", molecular_formula="",
                molecular_weight=0, exact_mass=0, inchi="",
                functional_groups=[], mol_block_2d="",
                error=f"Invalid structure: {str(e)}"
            )
        
        # Generate outputs
        AllChem.Compute2DCoords(mol)
        mol_block_2d = Chem.MolToMolBlock(mol)
        svg_2d = generate_2d_svg(mol)
        mol_block_3d = generate_3d_coords(mol)
        props = get_properties_from_mol(mol)
        groups = detect_functional_groups(mol)
        
        return StructureResponse(
            iupac_name=iupac_name or "Unknown",
            common_name=common_name,
            smiles=props.get("smiles", ""),
            molecular_formula=props.get("molecular_formula", ""),
            molecular_weight=props.get("molecular_weight", 0),
            exact_mass=props.get("exact_mass", 0),
            inchi=props.get("inchi", ""),
            functional_groups=groups,
            mol_block_2d=mol_block_2d,
            mol_block_3d=mol_block_3d,
            svg_2d=svg_2d
        )

    except Exception as e:
        print(f"Process error: {e}")
        return StructureResponse(
            iupac_name="", smiles="", molecular_formula="",
            molecular_weight=0, exact_mass=0, inchi="",
            functional_groups=[], mol_block_2d="",
            error=f"Error processing: {str(e)}"
        )


def generate_explanation(structure_data: StructureResponse) -> str:
    """Generate explanation."""
    if not structure_data.iupac_name or structure_data.iupac_name == "Unknown":
        return "Unable to generate explanation."
    
    lines = []
    lines.append(f"**{structure_data.iupac_name}**")
    if structure_data.common_name and structure_data.common_name.lower() != structure_data.iupac_name.lower():
        lines.append(f"Common name: {structure_data.common_name}")
    
    lines.append("")
    lines.append(f"**Formula:** {structure_data.molecular_formula}")
    lines.append(f"**Weight:** {structure_data.molecular_weight} g/mol")
    
    if structure_data.functional_groups:
        lines.append("")
        lines.append("**Functional Groups:**")
        for g in structure_data.functional_groups:
            lines.append(f"• {g}")
    
    return "\n".join(lines)

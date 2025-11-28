from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import StructureRequest, StructureResponse, ExplanationResponse
from .chemistry import process_structure, generate_explanation
import os

app = FastAPI(title="Organic Chemistry AI", version="1.0.0")

# Configure CORS - allow specific origins in production
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "service": "Organic Chemistry AI API"}

@app.post("/api/resolve", response_model=StructureResponse)
async def resolve_structure(request: StructureRequest):
    """
    Convert Name or SMILES to full structure data.
    """
    try:
        # Handle empty input
        if not request.structure or not request.structure.strip():
            return StructureResponse(
                iupac_name="", smiles="", molecular_formula="",
                molecular_weight=0, exact_mass=0, inchi="",
                functional_groups=[], mol_block_2d="",
                error="Please provide a structure or name"
            )
        
        response = process_structure(request.structure.strip(), request.inputType)
        # Return the response even if there's an error - let frontend handle it
        return response
    except Exception as e:
        # Return error in response body instead of HTTP error
        return StructureResponse(
            iupac_name="", smiles="", molecular_formula="",
            molecular_weight=0, exact_mass=0, inchi="",
            functional_groups=[], mol_block_2d="",
            error=f"Analysis failed: {str(e)}"
        )

@app.post("/api/explain", response_model=ExplanationResponse)
async def explain_structure(request: StructureResponse):
    """
    Generate an educational explanation for the structure.
    """
    try:
        explanation = generate_explanation(request)
        return ExplanationResponse(explanation=explanation)
    except Exception as e:
        return ExplanationResponse(explanation=f"Could not generate explanation: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

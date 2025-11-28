from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import StructureRequest, StructureResponse, ExplanationResponse
from .chemistry import process_structure, generate_explanation
import os

app = FastAPI(title="Organic Chemistry AI", version="1.0.0")

# Configure CORS - allow specific origins in production
# Default fallback includes common Vercel deployment URL
DEFAULT_VERCEL_URL = "https://organic-chem-web-app.vercel.app"
cors_origins_str = os.getenv("CORS_ORIGINS", DEFAULT_VERCEL_URL)

# Split by comma and strip whitespace, filter out empty strings
if cors_origins_str and cors_origins_str.strip() and cors_origins_str.strip() != "*":
    cors_origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]
    use_credentials = True
    print(f"CORS Origins configured: {cors_origins} (with credentials)")  # Debug log
else:
    # Fallback: allow all origins but without credentials (required by CORS spec)
    cors_origins = ["*"]
    use_credentials = False
    print(f"CORS Origins configured: {cors_origins} (no credentials - set CORS_ORIGINS env var for production)")  # Debug log

# Add CORS middleware - must be added before routes
# This automatically handles OPTIONS preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=use_credentials,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
    max_age=3600,
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Organic Chemistry AI API",
        "cors_origins": cors_origins,
        "cors_credentials": use_credentials
    }

@app.get("/health")
def health_check():
    """Health check endpoint with CORS info"""
    return {
        "status": "healthy",
        "cors_configured": len(cors_origins) > 0,
        "cors_origins": cors_origins if cors_origins != ["*"] else "all origins",
        "cors_credentials": use_credentials
    }

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

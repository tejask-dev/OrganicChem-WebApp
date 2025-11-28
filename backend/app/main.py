from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from .models import StructureRequest, StructureResponse, ExplanationResponse
from .chemistry import process_structure, generate_explanation
import os

# Allowed origins - hardcoded for reliability
ALLOWED_ORIGINS = [
    "https://organic-chem-web-app.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# Add any additional origins from environment variable
env_origins = os.getenv("CORS_ORIGINS", "")
if env_origins:
    for origin in env_origins.split(","):
        origin = origin.strip()
        if origin and origin not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(origin)

print(f"CORS Allowed Origins: {ALLOWED_ORIGINS}")


class CORSHandler(BaseHTTPMiddleware):
    """Custom CORS middleware that handles preflight requests properly"""
    
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")
        
        # Check if origin is allowed
        is_allowed = origin in ALLOWED_ORIGINS or not origin
        
        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            response = Response(
                content="",
                status_code=200,
                headers={
                    "Access-Control-Allow-Origin": origin if is_allowed else ALLOWED_ORIGINS[0],
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-Requested-With, Origin",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Max-Age": "3600",
                }
            )
            return response
        
        # Process the actual request
        response = await call_next(request)
        
        # Add CORS headers to response
        if is_allowed and origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Expose-Headers"] = "*"
        
        return response


app = FastAPI(title="Organic Chemistry AI", version="1.0.0")

# Add custom CORS handler first (before other middleware)
app.add_middleware(CORSHandler)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Organic Chemistry AI API",
        "cors_origins": ALLOWED_ORIGINS
    }

@app.get("/health")
def health_check():
    """Health check endpoint with CORS info"""
    return {
        "status": "healthy",
        "cors_configured": True,
        "cors_origins": ALLOWED_ORIGINS
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

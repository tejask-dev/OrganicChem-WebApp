# Organic Chemistry AI Web App

A professional, full-stack web application for drawing, naming, and analyzing organic molecules.

## Features

*   **Interactive Molecule Editor**: Draw structures using the Kekulé.js powered canvas.
*   **Name Resolution**: Type IUPAC or common names to generate structures (powered by PubChem & RDKit).
*   **Structure Analysis**: Instant calculation of Molecular Weight, Formula, Exact Mass.
*   **Functional Group Detection**: Identifies common organic groups (Alcohols, Ketones, Acids, etc.).
*   **3D Visualization**: View valid structures in 3D using NGL Viewer with ETKDG embedding.
*   **AI Tutor**: Simple explanations of naming logic and structure properties.

## Tech Stack

*   **Frontend**: React, TypeScript, Vite, Tailwind CSS, Kekule.js, NGL.
*   **Backend**: Python, FastAPI, RDKit, PubChemPy.
*   **Infrastructure**: Docker, Docker Compose.

## Setup & Deployment

### Prerequisites

*   Docker and Docker Compose
*   Node.js (for local development)
*   Python 3.9+ (for local development)

### Quick Start (Docker)

1.  Clone the repository.
2.  Run with Docker Compose:
    ```bash
    docker-compose up --build
    ```
3.  Open your browser to `http://localhost:3000`.
4.  The API is available at `http://localhost:8000`.

### Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Architecture

### Backend (`/backend`)
*   **`app/main.py`**: FastAPI entry point, handles API routes.
*   **`app/chemistry.py`**: Core logic using RDKit for structure processing and PubChemPy for name resolution.
*   **`app/models.py`**: Pydantic models for type safety.

### Frontend (`/frontend`)
*   **`components/KekuleEditor.tsx`**: React wrapper for the Kekulé.js chemistry editor.
*   **`components/Viewer3D.tsx`**: React wrapper for NGL 3D viewer.
*   **`api.ts`**: Centralized API client.

## Troubleshooting

*   **RDKit Installation**: If you encounter issues installing RDKit via pip, ensure you have the system dependencies (`libxrender1`, etc.) installed or use the Docker container which handles this.
*   **PubChem Errors**: Name resolution requires internet access to reach the PubChem API.
*   **Kekule.js**: This project uses Kekule.js via CDN in `index.html` to avoid Webpack bundling issues with the legacy library.

## License

MIT


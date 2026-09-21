<div align="center">

# 🧪 MoleculeAI

### **The Ultimate Organic Chemistry Structure ↔ Name Conversion Web Application**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![RDKit](https://img.shields.io/badge/RDKit-2023.9-FF6B6B?logo=python)](https://www.rdkit.org/)

**Transform molecular structures into IUPAC names and vice versa with AI-powered precision**

[🚀 Deployed Interface](https://organic-chem-web-app.vercel.app) • [📖 Documentation](#-features) • [🐛 Report Bug](https://github.com/tejask-dev/OrganicChem-WebApp/issues) • [💡 Request Feature](https://github.com/tejask-dev/OrganicChem-WebApp/issues)

</div>

---

## ✨ Features

### 🎨 **Beautiful, Modern UI**
- **Glassmorphism Design** - Stunning visual effects with frosted glass aesthetics
- **Smooth Animations** - Powered by Framer Motion for fluid interactions
- **Dark/Light Mode Ready** - Beautiful gradient backgrounds and color schemes
- **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Tutorial** - Step-by-step onboarding for new users

### 🧬 **Powerful Chemistry Engine**
- **IUPAC Name Generation** - Accurate systematic naming for any organic compound
- **Structure Recognition** - Convert names to precise 2D molecular structures
- **Functional Group Detection** - Automatically identifies:
  - Amines (Primary, Secondary, Tertiary)
  - Amides, Imides, Imines
  - Alcohols, Phenols, Ethers
  - Aldehydes, Ketones, Carboxylic Acids
  - Esters, Aromatics, Heterocycles
  - And 20+ more functional groups!
- **3D Molecular Visualization** - Interactive 3D viewer with NGL.js
- **PubChem Integration** - Access to millions of compounds

### 🎯 **Dual Input Modes**

#### 1. **Draw Mode** 🖊️
- Interactive molecule editor powered by Kekulé.js
- Drag-and-drop atoms and bonds
- Ring templates (benzene, cyclohexane, etc.)
- Undo/Redo functionality
- Real-time structure validation

#### 2. **Search by Name** 🔍
- Type IUPAC or common names (e.g., "Aspirin", "Caffeine")
- Instant structure generation
- Quick example buttons for common molecules
- Supports complex IUPAC nomenclature

### 📊 **Comprehensive Analysis**
- **Molecular Formula** - Precise chemical formula with subscripts
- **Molecular Weight** - Exact mass calculations
- **SMILES Notation** - Copy-to-clipboard functionality
- **InChI Identifier** - Standard chemical identifier
- **SVG Structure Export** - High-quality 2D renderings
- **Detailed Explanations** - Educational insights into naming rules

### 🚀 **Performance & Quality**
- **Lightning Fast** - Optimized API calls with local molecule database
- **Error Handling** - Graceful error messages and recovery
- **Type Safety** - Full TypeScript coverage
- **Production Ready** - Docker support, deployment guides included

---

## 🎬 Demo

### Search by Name
```
Input: "Caffeine"
Output: 
  • IUPAC: 1,3,7-trimethylpurine-2,6-dione
  • Formula: C₈H₁₀N₄O₂
  • Weight: 194.194 g/mol
  • Functional Groups: Lactam, Amide, N-Methyl, Carbonyl, Heterocyclic (N)
```

### Draw Structure
```
Draw any molecule → Get instant IUPAC name and analysis
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Kekulé.js** - Molecular structure editor
- **NGL Viewer** - 3D molecular visualization
- **Axios** - HTTP client

### Backend
- **FastAPI** - High-performance Python web framework
- **RDKit** - Cheminformatics toolkit
- **PubChemPy** - PubChem API integration
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

---

## 📦 Installation

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **npm** or **yarn**

The commands below use Bash/zsh and npm. `frontend/` and `backend/` are directly inside the cloned repository.

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/tejask-dev/OrganicChem-WebApp.git
cd OrganicChem-WebApp
```

2. **Set up Backend** (from the repository root)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

On Windows, use `py -m venv .venv`, then activate with `.venv\Scripts\Activate.ps1` in PowerShell or `.venv\Scripts\activate.bat` in Command Prompt. Create a fresh environment for your machine; the repository's existing root `venv/` is not used by these instructions.

3. **Set up Frontend** in a **second terminal**, starting at the repository root (`OrganicChem-WebApp/`). Leave the backend running in the first terminal.
```bash
cd frontend
npm install
npm run dev
```

For this local setup, no environment file is required: the API client defaults to `http://localhost:8000/api`, and the backend allows `http://localhost:5173`.

4. **Open your browser**
```
Frontend: http://localhost:5173
Backend API: http://localhost:8000
API documentation: http://localhost:8000/docs
```

---

## 🐳 Docker Deployment

### Using Docker Compose

Run from the repository root. Docker Engine and the Compose plugin must be installed.

```bash
docker compose up --build
```

Open `http://localhost:3000`; the backend is available at `http://localhost:8000`. These defaults are for a browser running on the same machine as Docker. For a hosted frontend, configure `VITE_API_URL` before building (see [Configuration](#-configuration)).

### Individual Services

Run these commands from the repository root as an alternative to Compose. The shared network and backend container name match the frontend's Nginx configuration.

```bash
docker network create moleculeai

# Backend
docker build -t moleculeai-backend ./backend
docker run -d --name backend --network moleculeai -p 8000:8000 moleculeai-backend

# Frontend
docker build -t moleculeai-frontend ./frontend
docker run -d --name frontend --network moleculeai -p 3000:80 moleculeai-frontend
```

---

## 🚀 Production Deployment

### Recommended: Vercel + Render

**Frontend (Vercel)**
1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory: `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
5. Build with `npm run build`; use `dist` as the output directory. Set the API URL before the build and redeploy after changing it.

**Backend (Render)**
1. Create new Web Service in [Render](https://render.com)
2. Connect GitHub repository
3. Set root directory: `backend`
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `CORS_ORIGINS=https://your-frontend-url.com`

📖 **Full deployment guide:** See [DEPLOY.md](DEPLOY.md) or [QUICK_DEPLOY.md](QUICK_DEPLOY.md)

---

## 📁 Project Structure

```
OrganicChem-WebApp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── KekuleEditor.tsx    # Molecule drawing editor
│   │   │   ├── Viewer3D.tsx         # 3D molecular visualization
│   │   │   ├── InfoPanel.tsx        # Results display panel
│   │   │   ├── Tutorial.tsx         # Interactive tutorial
│   │   │   └── StructureDisplay.tsx # SVG structure preview
│   │   ├── App.tsx                   # Main application component
│   │   ├── api.ts                    # API client
│   │   └── types.ts                  # TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI application
│   │   ├── chemistry.py              # Core chemistry logic
│   │   └── models.py                 # Pydantic models
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── DEPLOY.md                          # Detailed deployment guide
├── QUICK_DEPLOY.md                    # Quick deployment steps
└── README.md                          # This file
```

---

## 🧪 Supported Compounds

### Functional Groups
✅ Alkanes, Alkenes, Alkynes  
✅ Aromatics (Benzene, Naphthalene, etc.)  
✅ Halides (Fluoride, Chloride, Bromide, Iodide)  
✅ Alcohols & Phenols  
✅ Aldehydes & Ketones  
✅ Carboxylic Acids & Esters  
✅ Amides & Amines  
✅ Cyclic Compounds (including bicyclic)  
✅ Heterocycles (N, O, S)  
✅ Basic Biomolecules  

### Example Molecules
- **Pharmaceuticals:** Aspirin, Caffeine, Ibuprofen, Acetaminophen
- **Biomolecules:** Glucose, Dopamine, Serotonin, Adrenaline
- **Common Compounds:** Ethanol, Benzene, Acetone, Toluene
- **Complex Structures:** Cholesterol, Morphine, Nicotine

---

## 🎓 Educational Features

### Smart Tutor Mode
- Interactive step-by-step tutorial
- Highlights UI elements with explanations
- Teaches IUPAC naming rules
- Explains functional group priorities

### Detailed Explanations
- Why this is the IUPAC name
- Functional group priority rules
- Structure naming logic
- Chemical property insights

---

## 🔧 Configuration

### Environment Variables

**Frontend** (`frontend/.env.local`, or the hosting platform's build environment)
```env
VITE_API_URL=http://localhost:8000/api
```

Vite reads `VITE_API_URL` when the development server starts or the production bundle is built. Restart `npm run dev` after editing it; rebuild and redeploy production assets after changing it. Set the full backend URL ending in `/api`, without a trailing slash. For Docker builds, `frontend/.env.production.local` can supply the value before the image is built; runtime container environment variables do not rewrite the bundle.

**Backend** (process environment, or the hosting platform's service settings)

The backend reads `CORS_ORIGINS` from the process environment; it does not automatically load a `.env` file. For a custom origin, export it before starting the backend:

```bash
# Run from backend/ with the virtual environment activated.
export CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
python -m uvicorn app.main:app --reload --port 8000
```

Use a comma-separated list of frontend origins (scheme, host, and optional port; no path or trailing slash). The documented localhost origins already work without this variable. On hosts that provide `PORT`, the deployment start command passes it explicitly with `--port $PORT`.

---

## 📊 API Endpoints

### `POST /api/resolve`
Convert structure (SMILES or name) to full molecular data.

**Request:**
```json
{
  "structure": "Caffeine",
  "inputType": "name"
}
```

**Response:**
```json
{
  "iupac_name": "1,3,7-trimethylpurine-2,6-dione",
  "common_name": "Caffeine",
  "smiles": "Cn1c(=O)c2c(ncn2C)n(C)c1=O",
  "molecular_formula": "C8H10N4O2",
  "molecular_weight": 194.194,
  "functional_groups": ["Lactam (Cyclic Amide)", "Amide", "N-Methyl", ...],
  "mol_block_2d": "...",
  "mol_block_3d": "...",
  "svg_2d": "<svg>...</svg>"
}
```

### `POST /api/explain`
Generate educational explanation for a structure.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **RDKit** - For powerful cheminformatics capabilities
- **PubChem** - For comprehensive chemical database
- **Kekulé.js** - For molecular structure editing
- **NGL Viewer** - For 3D molecular visualization
- **FastAPI** - For blazing-fast API framework
- **React & Vite** - For modern frontend development

---

## 📧 Contact

**Tejas K** - [@tejask-dev](https://github.com/tejask-dev)

Project Link: [https://github.com/tejask-dev/OrganicChem-WebApp](https://github.com/tejask-dev/OrganicChem-WebApp)

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ for the chemistry community**

[⬆ Back to Top](#-moleculeai)

</div>

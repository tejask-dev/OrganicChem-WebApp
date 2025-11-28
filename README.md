<div align="center">

# 🧪 MoleculeAI

### **The Ultimate Organic Chemistry Structure ↔ Name Conversion Web Application**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![RDKit](https://img.shields.io/badge/RDKit-2023.9-FF6B6B?logo=python)](https://www.rdkit.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Transform molecular structures into IUPAC names and vice versa with AI-powered precision**

[🚀 Live Demo](#) • [📖 Documentation](#features) • [🐛 Report Bug](https://github.com/tejask-dev/OrganicChem-WebApp/issues) • [💡 Request Feature](https://github.com/tejask-dev/OrganicChem-WebApp/issues)

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

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/tejask-dev/OrganicChem-WebApp.git
cd OrganicChem-WebApp/organic-chem-app
```

2. **Set up Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

3. **Set up Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Open your browser**
```
Frontend: http://localhost:5173
Backend API: http://localhost:8000
```

---

## 🐳 Docker Deployment

### Using Docker Compose
```bash
docker-compose up --build
```

### Individual Services
```bash
# Backend
cd backend
docker build -t moleculeai-backend .
docker run -p 8000:8000 moleculeai-backend

# Frontend
cd frontend
docker build -t moleculeai-frontend .
docker run -p 3000:80 moleculeai-frontend
```

---

## 🚀 Production Deployment

### Recommended: Vercel + Render

**Frontend (Vercel)**
1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory: `organic-chem-app/frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`

**Backend (Render)**
1. Create new Web Service in [Render](https://render.com)
2. Connect GitHub repository
3. Set root directory: `organic-chem-app/backend`
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `CORS_ORIGINS=https://your-frontend-url.com`

📖 **Full deployment guide:** See [DEPLOY.md](DEPLOY.md) or [QUICK_DEPLOY.md](QUICK_DEPLOY.md)

---

## 📁 Project Structure

```
organic-chem-app/
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

**Frontend** (`.env.local`)
```env
VITE_API_URL=http://localhost:8000/api
```

**Backend** (`.env`)
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
PORT=8000
```

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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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

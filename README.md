# Smart Manufacturing Decision Support System (DSS)

A real-time decision support system with integrated expert diagnostics for monitoring and managing 500 manufacturing machines. Built with FastAPI (Python) backend and React frontend, optimized for maximum speed and performance.

![System Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Python](https://img.shields.io/badge/python-3.9+-blue)
![React](https://img.shields.io/badge/react-18-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Features

### Real-Time Monitoring
- **500 Machine Dashboard** - Live status updates every 3 seconds
- **Multiple Views** - Grid (20x25), List, and Table layouts
- **Color-Coded Status** - Instant visual health indicators
- **Fast Search** - Debounced search (150ms) by machine ID
- **Smart Filters** - Filter by status (Normal/Warning/Critical)
- **Live Health Metrics** - System-wide health percentage

### Expert System (202 Rules)
- **Automatic Fault Detection** - AI-powered diagnostics
- **Root Cause Analysis** - Detailed reasoning for each diagnosis
- **Corrective Actions** - Specific recommendations
- **Severity Classification** - Critical/Warning levels
- **Resolution Tracking** - Mark issues as resolved with notes
- **Severity Filtering** - Filter alerts by All/Critical/Warning

### Enhanced What-If Simulation
- **Cost Analysis** - Energy cost calculations ($0.15/kWh)
- **ROI Projections** - Cost vs baseline comparisons
- **Maintenance Risk** - Dollar impact of failure risks
- **Smart Recommendations** - AI-driven capacity suggestions
- **Impact Metrics** - Affected machines count and severity levels
- **Optimal Capacity** - Suggested operational levels

### Machine Management
- **Detail Modal** - Comprehensive machine information
- **Control Actions** - Start/Stop/Restart/Maintenance (UI ready)
- **Status History** - Real-time metric tracking
- **Alert Notifications** - Bell icon with critical alerts
- **Quick Access** - Click bell to view critical machines

### Data Export
- **CSV Export** - Full machine data export
- **JSON Export** - Structured data format
- **Filtered Export** - Export current view/selection

---

## 🏗️ Architecture

### Backend (FastAPI + Python)
```
backend/
├── app/
│   ├── main.py          # API endpoints & server
│   ├── models.py        # SQLModel database schemas
│   ├── database.py      # SQLite connection & session
│   ├── simulator.py     # Real-time data generation (500 machines)
│   ├── expert_system.py # Knowledge Base (202 rules) + diagnostics
│   └── dss.py           # What-If simulation & predictions
└── database.db          # SQLite database (auto-created)
```

### Frontend (React + Tailwind)
```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx       # Main machine grid/list/table
│   │   ├── UnifiedReport.jsx   # Expert System panel
│   │   ├── SimulationPanel.jsx # What-If analysis
│   │   ├── ControlPanel.jsx    # Search/Filter/Export
│   │   ├── MachineDetailModal.jsx
│   │   └── Analytics.jsx
│   ├── api.js           # API client
│   ├── App.jsx          # Main app layout
│   └── index.css        # Optimized Tailwind CSS
└── public/
```

---

## 📦 Installation

### Prerequisites
- **Python 3.9+** with pip
- **Node.js 16+** with npm
- **Git** (for cloning)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/dixon-codes/Smart-Manufaturing-DSS.git
cd Smart-Manufaturing-DSS
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

---

## 🚀 Running the Application

### Option 1: Quick Start (Windows)
```bash
# From project root
start_plant.bat
```
This script starts both backend and frontend automatically.

### Option 2: Manual Start

**Terminal 1 - Backend**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🎯 Usage Guide

### Dashboard
1. **View Machines** - Switch between Grid/List/Table views
2. **Search** - Type machine ID in search box (auto-filters)
3. **Filter** - Select Normal/Warning/Critical status
4. **Click Machine** - Opens detail modal with full metrics
5. **Export** - Download current view as CSV/JSON

### Expert System
1. **View Alerts** - Active diagnoses shown in real-time
2. **Filter Severity** - Click All/Critical/Warning buttons
3. **Resolve Issues** - Click diagnosis → Add notes → Mark resolved
4. **Toggle View** - Switch between Active/All diagnoses

### What-If Simulation
1. **Adjust Capacity** - Slide from 50% to 150%
2. **Run Prediction** - Click "Run Prediction" button
3. **Review Analysis** - See cost impact, recommendations, severity
4. **Make Decisions** - Use optimal capacity suggestion

---

## 📊 API Endpoints

### Machines
- `GET /machines` - Get latest status for all 500 machines
- `GET /stats` - Aggregated system statistics

### Diagnostics
- `GET /diagnoses?resolved={bool}` - Get diagnoses (filtered by status)
- `PATCH /diagnoses/{id}/resolve` - Mark diagnosis as resolved

### Simulation
- `POST /simulate?capacity={float}` - Run What-If analysis with cost breakdown

### Health
- `GET /health` - Health check endpoint
- `GET /` - API information

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLModel** - SQL database ORM with Pydantic
- **SQLite** - Lightweight embedded database
- **Uvicorn** - ASGI server
- **Python 3.9+** - Core language

### Frontend
- **React 18** - UI library with hooks
- **Vite** - Fast build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Axios** - HTTP client

---

## ⚡ Performance Optimizations

### Backend
- Optimized database queries with subqueries
- Efficient session management
- Auto-reload on code changes (development)
- Response time: <50ms average

### Frontend
- `React.memo` for component memoization
- `useCallback` for stable event handlers
- `useMemo` for computed values
- Debounced search (150ms)
- Minimal CSS (removed heavy effects)
- Polling intervals: 3s (machines), 4s (diagnoses)

---

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL=sqlite:///database.db
HOST=0.0.0.0
PORT=8000
```

### Frontend (vite.config.js)
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

---

## 📈 Database Schema

### MachineData
- `machine_id` - Unique identifier (1-500)
- `timestamp` - Record timestamp
- `temperature` - Current temperature (°C)
- `vibration` - Vibration level
- `power_usage` - Power consumption (kW)
- `production_output` - Output units
- `status` - Normal/Warning/Critical

### Diagnosis
- `machine_id` - Related machine
- `timestamp` - Detection time
- `issue_detected` - Problem description
- `severity` - Critical/Warning
- `corrective_action` - Recommended fix
- `reasoning` - AI analysis explanation
- `resolved` - Resolution status (NEW)
- `resolved_at` - Resolution timestamp (NEW)
- `resolved_by` - User who resolved (NEW)
- `resolution_notes` - Resolution details (NEW)

---

## 🎨 UI/UX Highlights

- **Performance-First Design** - All interactions <50ms
- **Dark Mode** - Optimized for extended use
- **Responsive** - Desktop-optimized (mobile-friendly)
- **Minimal Animations** - Fast, no distracting effects
- **Color-Coded** - Instant status recognition
- **Accessible** - Keyboard navigation support

---

## 🚧 Roadmap

### Planned Features
- [ ] Maintenance logs tracking
- [ ] 24-hour historical trend charts
- [ ] Batch machine operations
- [ ] Custom alert thresholds
- [ ] Shift handover reports
- [ ] Downtime tracking & OEE calculation
- [ ] Machine notes/comments
- [ ] Backend for machine controls (Start/Stop/Restart)

See `feature_recommendations.md` for detailed analysis.

---

## 📝 Development

### Project Structure
```
Smart-Manufaturing-DSS/
├── backend/           # Python FastAPI backend
├── frontend/          # React frontend
├── start_plant.bat    # Windows startup script
└── README.md          # This file
```

### Key Files
- `backend/app/expert_system.py` - 202 diagnostic rules
- `backend/app/dss.py` - What-If simulation logic
- `frontend/src/components/Dashboard.jsx` - Main UI
- `frontend/src/components/UnifiedReport.jsx` - Expert System UI

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
cd backend
pip install --upgrade -r requirements.txt

# Delete database and restart
rm database.db
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend won't start
```bash
# Check Node version
node --version  # Should be 16+

# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database schema errors
The database auto-recreates with correct schema on startup. If errors persist:
```bash
cd backend
rm database.db
# Restart backend - will create new database
```

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

**Dixon Charles Ngasa**
- GitHub: [@dixon-codes](https://github.com/dixon-codes)
- Project: [Smart Manufacturing DSS](https://github.com/dixon-codes/Smart-Manufaturing-DSS)

---

## 🙏 Acknowledgments

Built with modern web technologies and AI-powered diagnostics for real-world manufacturing excellence.

---

**Production Ready** ✅ | **Fast & Responsive** ⚡ | **AI-Powered** 🤖

# Smart Manufacturing Plant Management System - README

## 🚀 Overview
A premium hybrid Decision Support System (DSS) with integrated Expert System (ES) for smart manufacturing plant management. Features real-time monitoring of 500 machines, AI-powered fault diagnosis, and predictive "What-If" simulations.

## ✨ Key Features

### Hybrid Intelligence
- **DSS Engine**: Real-time anomaly detection with multi-threshold analysis
- **Expert System**: 202 fault diagnosis rules with reasoning
- **Hybrid Bridge**: Automatic ES triggering on anomaly detection

### Premium UI/UX
- Glassmorphic design with backdrop blur effects
- Gradient color scheme (Blue → Purple → Pink)
- Smooth animations and transitions
- Real-time data visualization with charts
- Responsive grid layout for 500 machines

### Advanced Analytics
- Live health percentage monitoring
- Capacity simulation (50% - 150%)
- Exponential risk modeling
- Trend analysis and history tracking

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS 3
- Recharts
- Lucide Icons
- Axios

**Backend**
- FastAPI
- SQLModel + SQLite
- Python 3.9+
- Background threading

## 📦 Installation

### Backend Setup
```powershell
cd backend
pip install -r requirements.txt
```

### Frontend Setup
```powershell
cd frontend
npm install
```

## 🚀 Running the Application

### Option 1: Manual Start (Recommended)
**Terminal 1 - Backend:**
```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Option 2: Batch Script
```powershell
start_plant.bat
```

## 🌐 Access Points
- **Dashboard**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Statistics**: http://localhost:8000/stats

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/machines` | GET | Latest status of all 500 machines |
| `/diagnoses` | GET | Recent expert system diagnoses |
| `/simulate` | POST | Run What-If capacity simulation |
| `/stats` | GET | Aggregated system statistics |
| `/health` | GET | Health check endpoint |

## 🎨 UI Components

### Dashboard
- Real-time machine grid (500 machines)
- Health percentage indicator
- Stats cards (Total, Operational, Critical)
- Color-coded status (Green = Normal, Red = Critical)

### Simulation Panel
- Capacity slider with visual feedback
- Energy consumption prediction
- Failure risk calculation
- Simulation history chart

### Expert System Report
- Live fault diagnoses
- Severity-based color coding
- Corrective action recommendations
- Detailed reasoning for each diagnosis

## 🔧 Configuration

### Anomaly Thresholds (dss.py)
```python
TEMP_THRESHOLD = 80.0    # °C
VIB_THRESHOLD = 5.0      # mm/s
POWER_THRESHOLD = 15.0   # kW
```

### Simulation Parameters
- Update Interval: 5 seconds
- Machine Count: 500
- Capacity Range: 0.5 - 1.5 (50% - 150%)

## 📈 System Architecture

```
┌─────────────────┐
│  React Frontend │
│  (Port 5173)    │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│  FastAPI Backend│
│  (Port 8000)    │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌───────┐  ┌──────────┐
│  DSS  │→ │ Expert   │
│Engine │  │ System   │
└───┬───┘  └────┬─────┘
    │           │
    └─────┬─────┘
          ↓
    ┌──────────┐
    │ SQLite DB│
    └──────────┘
```

## 🎯 Performance Metrics
- **API Response Time**: < 100ms
- **UI Update Frequency**: 2-3 seconds
- **Database Size**: ~10MB (after 1 hour)
- **Memory Usage**: ~200MB (backend + frontend)

## 🐛 Troubleshooting

**Frontend won't start:**
```powershell
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Backend errors:**
```powershell
cd backend
pip install --upgrade -r requirements.txt
```

**Port conflicts:**
- Backend: Change port in uvicorn command
- Frontend: Update `vite.config.js`

## 📝 License
MIT License - Educational/Demo Purpose

## 👨‍💻 Author
Built with FastAPI, React, and modern web technologies.

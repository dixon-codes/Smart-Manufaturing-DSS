from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, func
from typing import List
import logging

from .database import create_db_and_tables, get_session
from .models import MachineData, Diagnosis, SimulationResult
from .simulator import start_simulation
from .dss import predict_impact

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Manufacturing DSS",
    description="Hybrid Decision Support System with Expert System Integration",
    version="1.0.0"
)

# CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    logger.info("Starting Smart Manufacturing DSS...")
    create_db_and_tables()
    start_simulation()
    logger.info("System initialized successfully")

@app.get("/")
def read_root():
    return {
        "message": "Smart Manufacturing DSS API is running",
        "version": "1.0.0",
        "endpoints": {
            "machines": "/machines",
            "diagnoses": "/diagnoses",
            "simulate": "/simulate",
            "docs": "/docs"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "service": "Smart Manufacturing DSS"}

# --- Dashboard Endpoints ---

@app.get("/machines", response_model=List[MachineData])
def get_machines(session: Session = Depends(get_session)):
    """
    Returns the latest status for all 500 machines.
    Uses a subquery to get the most recent record for each machine.
    """
    try:
        # Get the latest timestamp for each machine
        subquery = (
            select(
                MachineData.machine_id,
                func.max(MachineData.timestamp).label('max_timestamp')
            )
            .group_by(MachineData.machine_id)
            .subquery()
        )
        
        # Join to get full records
        statement = (
            select(MachineData)
            .join(
                subquery,
                (MachineData.machine_id == subquery.c.machine_id) &
                (MachineData.timestamp == subquery.c.max_timestamp)
            )
            .order_by(MachineData.machine_id)
        )
        
        results = session.exec(statement).all()
        logger.info(f"Retrieved {len(results)} machine records")
        return results
    except Exception as e:
        logger.error(f"Error fetching machines: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch machine data")

@app.get("/diagnoses", response_model=List[Diagnosis])
def get_diagnoses(limit: int = 50, resolved: bool = None, session: Session = Depends(get_session)):
    """
    Returns recent diagnoses from the Expert System.
    Can filter by resolved status.
    """
    try:
        # Build query
        if resolved is None:
            # Return all diagnoses
            statement = select(Diagnosis).order_by(Diagnosis.timestamp.desc()).limit(limit)
        else:
            # Filter by resolved status
            statement = select(Diagnosis).where(Diagnosis.resolved == resolved).order_by(Diagnosis.timestamp.desc()).limit(limit)
        
        results = session.exec(statement).all()
        logger.info(f"Retrieved {len(results)} diagnoses (resolved={resolved})")
        return results
    except Exception as e:
        logger.error(f"Error fetching diagnoses: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch diagnoses: {str(e)}")

# --- Simulation Endpoint ---

@app.post("/simulate")
def run_simulation(capacity: float, session: Session = Depends(get_session)):
    """
    Enhanced What-If simulation with cost analysis and recommendations.
    """
    if capacity < 0.1 or capacity > 2.0:
        raise HTTPException(
            status_code=400, 
            detail="Capacity factor must be between 0.1 and 2.0"
        )
    
    try:
        result = predict_impact(capacity)
        
        # Cost calculations ($0.15 per kWh)
        energy_cost = result["predicted_energy"] * 0.15
        baseline_cost = 6500 * 0.15  # 100% capacity baseline
        cost_impact = energy_cost - baseline_cost
        
        # Maintenance cost implications ($50 per % risk increase)
        maintenance_cost = result["failure_risk_percentage"] * 50
        
        # Generate recommendations
        if capacity < 0.7:
            recommendation = "⚠️ Under-utilized. Consider reducing machine count or increasing production."
            optimal = 0.85
        elif capacity > 1.2:
            recommendation = "🚨 Overload risk! High failure probability. Reduce load immediately."
            optimal = 1.1
        else:
            recommendation = "✅ Operating within safe parameters. Capacity is optimal."
            optimal = capacity
        
        # Calculate affected machines
        total_machines = session.exec(select(func.count(func.distinct(MachineData.machine_id)))).one()
        affected = int(total_machines * abs(capacity - 1.0))
        
        logger.info(f"Simulation run for capacity {capacity}: {result}")
        
        return {
            "capacity_factor": capacity,
            "predicted_energy": result["predicted_energy"],
            "failure_risk_increase": result["failure_risk_percentage"],
            "energy_cost_usd": round(energy_cost, 2),
            "cost_impact_usd": round(cost_impact, 2),
            "maintenance_cost_usd": round(maintenance_cost, 2),
            "total_cost_impact_usd": round(cost_impact + maintenance_cost, 2),
            "recommendation": recommendation,
            "optimal_capacity": optimal,
            "affected_machines": affected,
            "severity": "high" if abs(capacity - 1.0) > 0.3 else "medium" if abs(capacity - 1.0) > 0.15 else "low"
        }
    except Exception as e:
        logger.error(f"Simulation error: {e}")
        raise HTTPException(status_code=500, detail="Simulation failed")

@app.get("/stats")
def get_stats(session: Session = Depends(get_session)):
    """
    Returns aggregated statistics about the system.
    """
    try:
        # Count machines by status
        total_machines = session.exec(select(func.count(func.distinct(MachineData.machine_id)))).one()
        
        # Get latest records for status count
        subquery = (
            select(
                MachineData.machine_id,
                func.max(MachineData.timestamp).label('max_timestamp')
            )
            .group_by(MachineData.machine_id)
            .subquery()
        )
        
        latest_records = session.exec(
            select(MachineData)
            .join(
                subquery,
                (MachineData.machine_id == subquery.c.machine_id) &
                (MachineData.timestamp == subquery.c.max_timestamp)
            )
        ).all()
        
        critical_count = sum(1 for r in latest_records if r.status == 'Critical')
        normal_count = sum(1 for r in latest_records if r.status == 'Normal')
        
        # Count total diagnoses
        total_diagnoses = session.exec(select(func.count(Diagnosis.id))).one()
        
        return {
            "total_machines": total_machines,
            "normal_machines": normal_count,
            "critical_machines": critical_count,
            "total_diagnoses": total_diagnoses,
            "health_percentage": (normal_count / total_machines * 100) if total_machines > 0 else 0
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch statistics")

@app.patch("/diagnoses/{diagnosis_id}/resolve")
def resolve_diagnosis(
    diagnosis_id: int, 
    resolution_notes: str = None,
    resolved_by: str = "System User",
    session: Session = Depends(get_session)
):
    """Mark a diagnosis as resolved."""
    try:
        diagnosis = session.get(Diagnosis, diagnosis_id)
        if not diagnosis:
            raise HTTPException(status_code=404, detail="Diagnosis not found")
        
        from datetime import datetime
        diagnosis.resolved = True
        diagnosis.resolved_at = datetime.now()
        diagnosis.resolved_by = resolved_by
        diagnosis.resolution_notes = resolution_notes
        
        session.add(diagnosis)
        session.commit()
        session.refresh(diagnosis)
        
        logger.info(f"Diagnosis {diagnosis_id} marked as resolved by {resolved_by}")
        return {"message": "Diagnosis resolved successfully", "diagnosis": diagnosis}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving diagnosis: {e}")
        raise HTTPException(status_code=500, detail="Failed to resolve diagnosis")

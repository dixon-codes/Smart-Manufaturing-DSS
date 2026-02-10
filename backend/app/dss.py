from sqlmodel import Session, select
from .models import MachineData, Diagnosis
import logging

logger = logging.getLogger(__name__)

# Simple threshold-based anomaly detection for the "Hybrid Bridge"
TEMP_THRESHOLD = 80.0
VIB_THRESHOLD = 5.0
POWER_THRESHOLD = 15.0

def analyze_data_point(data: MachineData, session: Session):
    """
    Hybrid Bridge: Checks if data is abnormal. 
    If so, triggers the Expert System.
    """
    is_abnormal = False
    anomaly_reasons = []
    
    if data.temperature > TEMP_THRESHOLD:
        is_abnormal = True
        anomaly_reasons.append(f"High temperature: {data.temperature}°C")
    
    if data.vibration > VIB_THRESHOLD:
        is_abnormal = True
        anomaly_reasons.append(f"High vibration: {data.vibration}mm/s")
    
    if data.power_usage > POWER_THRESHOLD:
        is_abnormal = True
        anomaly_reasons.append(f"High power usage: {data.power_usage}kW")
    
    if is_abnormal:
        data.status = "Critical"
        logger.warning(f"Machine {data.machine_id} flagged as Critical: {', '.join(anomaly_reasons)}")
        
        # Trigger Expert System
        from .expert_system import diagnose_fault
        try:
            diagnose_fault(data, session)
        except Exception as e:
            logger.error(f"Expert System error for machine {data.machine_id}: {e}")
    else:
        data.status = "Normal"

def predict_impact(capacity_factor: float):
    """
    What-If Logic: Predicts energy and failure risk based on capacity.
    Base capacity is 1.0 (100%).
    
    Enhanced model with more realistic calculations.
    """
    # Base values for 100% capacity
    base_energy = 1000  # kWh total for plant
    base_risk = 5.0     # 5% base risk
    
    # Energy scales linearly with capacity
    predicted_energy = base_energy * capacity_factor
    
    # Risk calculation with exponential growth above optimal range
    if capacity_factor <= 0.8:
        # Below optimal: risk decreases slightly
        risk_multiplier = 0.8 + (capacity_factor * 0.2)
    elif capacity_factor <= 1.0:
        # Optimal range: minimal risk increase
        risk_multiplier = 1.0
    elif capacity_factor <= 1.2:
        # Slight overload: linear risk increase
        risk_multiplier = 1.0 + ((capacity_factor - 1.0) * 3)
    else:
        # Heavy overload: exponential risk increase
        excess = capacity_factor - 1.2
        risk_multiplier = 1.6 + (excess * excess * 10)
    
    failure_risk = base_risk * risk_multiplier
    
    logger.info(f"Capacity {capacity_factor:.2f}: Energy={predicted_energy:.2f}kWh, Risk={failure_risk:.2f}%")
    
    return {
        "predicted_energy": round(predicted_energy, 2),
        "failure_risk_percentage": round(failure_risk, 2)
    }

def get_trend_analysis(machine_id: int, session: Session, limit: int = 10):
    """
    Analyzes trends for a specific machine over recent data points.
    Returns trend indicators for temperature, vibration, and power.
    """
    try:
        statement = (
            select(MachineData)
            .where(MachineData.machine_id == machine_id)
            .order_by(MachineData.timestamp.desc())
            .limit(limit)
        )
        records = session.exec(statement).all()
        
        if len(records) < 2:
            return None
        
        # Calculate trends (simple linear)
        temp_trend = records[0].temperature - records[-1].temperature
        vib_trend = records[0].vibration - records[-1].vibration
        power_trend = records[0].power_usage - records[-1].power_usage
        
        return {
            "temperature_trend": "increasing" if temp_trend > 2 else "decreasing" if temp_trend < -2 else "stable",
            "vibration_trend": "increasing" if vib_trend > 1 else "decreasing" if vib_trend < -1 else "stable",
            "power_trend": "increasing" if power_trend > 2 else "decreasing" if power_trend < -2 else "stable",
        }
    except Exception as e:
        logger.error(f"Trend analysis error for machine {machine_id}: {e}")
        return None

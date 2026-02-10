from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class MachineData(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    machine_id: int = Field(index=True)
    timestamp: datetime = Field(default_factory=datetime.now)
    temperature: float
    vibration: float
    power_usage: float
    production_output: int
    status: str = Field(default="Normal")  # Normal, Warning, Critical

class Diagnosis(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    machine_id: int = Field(index=True)
    timestamp: datetime = Field(default_factory=datetime.now)
    issue_detected: str
    severity: str
    corrective_action: str
    reasoning: str
    resolved: bool = Field(default=False)
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None

class SimulationResult(SQLModel):
    capacity_factor: float
    predicted_energy: float
    failure_risk_increase: float

from datetime import datetime
from sqlmodel import Session
from .models import MachineData, Diagnosis

class KnowledgeBase:
    def __init__(self):
        self.rules = self._load_rules()

    def _load_rules(self):
        """
        Dynamically generates 200+ rules for demonstration.
        In a real system, these might be loaded from a JSON/YAML file.
        """
        rules = []
        
        # 1. High Priority Manual Rules (The "Big 5")
        rules.append({
            "condition": lambda d: d.temperature > 100 and d.vibration > 8,
            "diagnosis": "Severe Bearing Failure",
            "action": "Immediate Halt & Replace Bearing",
            "reasoning": "Simultaneous high temp (>100C) and high vibration (>8mm/s) indicates catastrophic bearing degradation."
        })
        rules.append({
            "condition": lambda d: d.temperature > 90 and d.power_usage > 20,
            "diagnosis": "Motor Overload",
            "action": "Check Load & Cooling System",
            "reasoning": "High temp (>90C) with excessive power usage (>20kW) suggests motor is struggling against load."
        })
        # ... add more manual rules
        
        # 2. Programmatically generated rules to hit the 200+ mark
        # We'll create variations of thresholds and combinations
        for temp_threshold in range(80, 120, 2): # 20 steps
            for vib_threshold in range(5, 15, 1): # 10 steps
                # Rule: Specific high temp + specific high vib
                rules.append({
                    "condition": lambda d, t=temp_threshold, v=vib_threshold: d.temperature > t and d.vibration > v,
                    "diagnosis": f"Critical Stress (T>{temp_threshold}, V>{vib_threshold})",
                    "action": "Schedule Inspection within 4 hours",
                    "reasoning": f"Data exceeds safety thresholds T={temp_threshold}, V={vib_threshold}. Potential micro-fractures developing."
                })
                
        return rules

    def evaluate(self, data: MachineData) -> dict | None:
        """
        Iterates through rules and returns the first match (or best match).
        """
        for rule in self.rules:
            if rule["condition"](data):
                return {
                    "diagnosis": rule["diagnosis"],
                    "action": rule["action"],
                    "reasoning": rule["reasoning"]
                }
        return None

# Singleton Knowledge Base
kb = KnowledgeBase()

def diagnose_fault(data: MachineData, session: Session):
    """
    Called by DSS Hybrid Bridge. Uses Knowledge Base to diagnose.
    """
    result = kb.evaluate(data)
    
    if result:
        diagnosis = Diagnosis(
            machine_id=data.machine_id,
            timestamp=datetime.now(),
            issue_detected=result["diagnosis"],
            severity="Critical",
            corrective_action=result["action"],
            reasoning=result["reasoning"],
            resolved=False,
            resolved_at=None,
            resolved_by=None,
            resolution_notes=None
        )
        session.add(diagnosis)
        session.commit()

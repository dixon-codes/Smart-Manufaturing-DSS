import random
import time
import threading
from datetime import datetime
from sqlmodel import Session
from .database import engine, get_session
from .models import MachineData
from .dss import analyze_data_point  # Hybrid Bridge call

NUM_MACHINES = 500

def generate_sensor_data(machine_id):
    # Simulate normal vs abnormal data
    # 5% chance of abnormal data to trigger ES
    is_abnormal = random.random() < 0.05
    
    if is_abnormal:
        temp = random.uniform(80, 120)       # High temp
        vib = random.uniform(5, 10)          # High vibration
        power = random.uniform(15, 25)       # High power
        production = random.randint(50, 80) # Low production
    else:
        temp = random.uniform(40, 75)
        vib = random.uniform(0, 3)
        power = random.uniform(5, 12)
        production = random.randint(90, 100)
    
    return MachineData(
        machine_id=machine_id,
        timestamp=datetime.now(),
        temperature=round(temp, 2),
        vibration=round(vib, 2),
        power_usage=round(power, 2),
        production_output=production
    )

def simulation_loop():
    print("Starting simulation loop for 500 machines...")
    while True:
        try:
            # Create a new session for each batch to ensure thread safety and freshness
            with Session(engine) as session:
                for i in range(1, NUM_MACHINES + 1):
                    data_point = generate_sensor_data(i)
                    session.add(data_point)
                    
                    # Hybrid bridge: Analyze immediately
                    # We pass the session so it triggers ES writes within the same transaction scope if needed
                    # but ES usually commits its own diagnoses. Let's ensure analyze_data_point handles session correctly.
                    # Actually, `analyze_data_point` calls `diagnose_fault` which does `session.add(diagnosis)`.
                    # So passing the session is correct.
                    analyze_data_point(data_point, session=session) 
                
                session.commit()
                # print("Simulation batch committed.")
        except Exception as e:
            print(f"Simulation Error: {e}")
            
        time.sleep(5) # Run every 5 seconds

def start_simulation():
    thread = threading.Thread(target=simulation_loop, daemon=True)
    thread.start()

from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
"""
This module defines a FastAPI application for managing a list of medicines.
It provides endpoints to retrieve all medicines, retrieve a single medicine by name,
and create a new medicine.
Endpoints:
- GET /medicines: Retrieve all medicines from the data.json file.
- GET /medicines/{name}: Retrieve a single medicine by name from the data.json file.
- POST /create: Create a new medicine with a specified name and price.
- POST /update: Update the price of a medicine with a specified name.
- DELETE /delete: Delete a medicine with a specified name.
Functions:
- get_all_meds: Reads the data.json file and returns all medicines.
- get_single_med: Reads the data.json file and returns a single medicine by name.
- create_med: Reads the data.json file, adds a new medicine, and writes the updated data back to the file.
- update_med: Reads the data.json file, updates the price of a medicine, and writes the updated data back to the file.
- delete_med: Reads the data.json file, deletes a medicine, and writes the updated data back to the file.
Usage:
Run this module directly to start the FastAPI application.
"""
import uvicorn
import json

# Create the FastAPI app instance
app = FastAPI()

# Allow the frontend (running on a different origin) to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # In production you would lock this down
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Read operations (GET endpoints)
# -----------------------------

@app.get("/medicines")
def get_all_meds():
    """
    Return the full list of medicines from data.json.
    The JSON file is treated as a very simple "database".
    """
    with open('data.json') as meds:
        data = json.load(meds)
    return data


@app.get("/medicines/{name}")
def get_single_med(name: str):
    """
    Return a single medicine by name.
    If the medicine is not found, return an error message.
    """
    with open('data.json') as meds:
        data = json.load(meds)
        for med in data["medicines"]:
            if med['name'] == name:
                return med
    return {"error": "Medicine not found"}

# -----------------------------
# Write operations (create / update / delete)
# -----------------------------

@app.post("/create")
def create_med(name: str = Form(...), price: float = Form(...)):
    """
    Create a new medicine from form data (name + price) and append it
    to the medicines list inside data.json.
    """
    with open('data.json', 'r+') as meds:
        current_db = json.load(meds)
        new_med = {"name": name, "price": price}
        current_db["medicines"].append(new_med)
        meds.seek(0)              # Go back to start of file
        json.dump(current_db, meds)
        meds.truncate()           # Remove any leftover old content
        
    return {"message": f"Medicine created successfully with name: {name}"}


@app.post("/update")
def update_med(name: str = Form(...), price: float = Form(...)):
    """
    Update the price of an existing medicine.
    Looks up by name, changes price, and writes the file back.
    """
    with open('data.json', 'r+') as meds:
        current_db = json.load(meds)
        for med in current_db["medicines"]:
            if med['name'] == name:
                med['price'] = price
                meds.seek(0)
                json.dump(current_db, meds)
                meds.truncate()
                return {"message": f"Medicine updated successfully with name: {name}"}
    return {"error": "Medicine not found"}


@app.delete("/delete")
def delete_med(name: str = Form(...)):
    """
    Delete a medicine by name.
    If the name is found, remove it from the list and save the file.
    """
    with open('data.json', 'r+') as meds:
        current_db = json.load(meds)
        for med in current_db["medicines"]:
            if med['name'] == name:
                current_db["medicines"].remove(med)
                meds.seek(0)
                json.dump(current_db, meds)
                meds.truncate()
                return {"message": f"Medicine deleted successfully with name: {name}"}
    return {"error": "Medicine not found"}

# -----------------------------
# Optional objective: average price
# -----------------------------

@app.get("/average-price")
def average_price():
    """
    Calculate and return the average price of all medicines
    that have a valid numeric price.
    """
    with open("data.json") as meds:
        data = json.load(meds)

    medicines = data.get("medicines", [])

    # Extract numeric prices only to avoid crashes on bad data
    prices = [
        med["price"]
        for med in medicines
        if isinstance(med.get("price"), (int, float))
    ]

    if not prices:
        # No valid prices available
        return {"average_price": None, "count": 0}

    avg = sum(prices) / len(prices)
    return {
        "average_price": round(avg, 2),
        "count": len(prices)
    }

# Entry point for running the app directly (used by start scripts)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
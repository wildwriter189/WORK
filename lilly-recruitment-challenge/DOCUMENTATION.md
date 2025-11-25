# Lilly Technical Challenge Documentation

## Approach

I approached the challenge by first focusing on environment setup and then working from backend → frontend → UX → optional objective.

1. *Environment & Setup*
   - Installed Python, Git, and VS Code.
   - Cloned the challenge repository into a working folder and ensured `requirements.txt` was in the correct location for the start scripts.
   - Used the provided `start.ps1` script on Windows to:
     - Create a virtual environment,
     - Install all dependencies from `requirements.txt`,
     - Start the FastAPI backend using Uvicorn.

2. *Backend First*
   - Verified the backend API using browser and docs:
     - `http://127.0.0.1:8000/medicines`
     - `http://127.0.0.1:8000/docs`
   - Kept the provided structure (FastAPI + JSON file as a mock database) and added an extra endpoint for the optional objective.

3. *Frontend Integration*
   - Implemented `script.js` to fetch data from the backend and render it dynamically.
   - Connected the frontend to the backend using `fetch()` calls and CORS.

4. *User Experience & Optional Objective*
   - Built a simple but structured UI using HTML, CSS, and JavaScript.
   - Added a forms-based flow to send user input back to the backend.
   - Implemented an `/average-price` endpoint for the optional “quarterly report” type requirement and displayed it in the UI.

Throughout the challenge I tried to:
- Keep the solution simple and readable.
- Add just enough error handling and comments so it is easy to walk through in an interview.

---

## Objectives – Innovative Solutions & Key Decisions

### 1. Fetching Data and Displaying It

- *Backend:*Used an existing `GET /medicines` endpoint that reads `data.json` and returns the list of medicines.
- *Frontend:* Implemented the following functions in `script.js`:
  - `loadMedicines()` – calls `/medicines`, handles HTTP errors, and parses the JSON.
  - `renderMedicines(medicines)` – dynamically creates “cards” for each medicine and inserts them into the `#medicines-container` grid.
- *UI:* Medicines are displayed as responsive cards with name and price, using a CSS grid layout for a cleaner and more user-friendly presentation.

### 2. Handling Missing or Invalid Data

To protect the frontend from crashes due to bad data (e.g., missing fields or incorrect types), I:

- Used *safe defaults*:
  - `med.name ?? "Unknown name"`
  - `typeof med.price === "number" ? "£..." : "N/A"`
- Wrapped the rendering of each item in a `try/catch` block so a single bad record does not break the entire page.
- Checked for the shape of the backend response:
  - If the backend returns `{ "medicines": [...] }`, I use that.
  - If it returns `[...]` directly, the code still works.
- Added a user-facing fallback message:
  - `"No medicines found."` if the list is empty.
  - `"Error loading medicines."` if the fetch fails.

This means the frontend remains stable even if the underlying JSON is not perfect.

### 3. User-Friendly Input to the Backend

The backend already exposed `POST /create`, `POST /update`, and `DELETE /delete` and expects data as `Form(...)`. To make this user-friendly:

- I created a *“Add a new medicine”* form in `index.html`:
  - Fields for `name` and `price`.
  - A submit button that feels like a normal website form.
- In `script.js`, I:
  - Attached a `submit` handler to the form.
  - Used `event.preventDefault()` to stop a full page reload.
  - Created a `FormData` instance from the form and sent it directly to `/create`.
  - Handled the backend’s JSON response and showed a status message to the user.
  - Refreshed the medicine list and the average price by calling `loadMedicines()` and `loadAveragePrice()`.

This allows non-technical users to interact with the backend without needing tools like Postman.

### 4. Frontend Design and UX Improvements

I made several UI/UX improvements while keeping the design lightweight:

- *Layout & Structure*
  - Clear sections: disclaimer, header, summary, medicine list, and form panel.
  - Wrapped functional areas in `.panel` containers for visual grouping.

- *Styling*
  - Card-based design for medicines with shadow and rounded corners.
  - Responsive grid (`.medicine-grid`) so cards reflow on different screen sizes.
  - Consistent spacing, padding, and typography to make the content easier to scan.

- *Feedback to the User*
  - Loading messages when data is being fetched.
  - Clear “error” messages on failure.
  - Inline feedback for add-medicine actions (“Submitting…”, success, failures).

If given more time, I would add:
- Search/filter functionality to quickly find medicines by name.
- Inline edit and delete buttons on each card.
- Basic form validation on the frontend (e.g., preventing negative prices).

### 5. Optional Objective – Average Price Endpoint

For the optional objective (“quarterly report”), I added a new endpoint:

- *Backend (`/average-price`):*
  - Reads `data.json`.
  - Extracts only valid numeric prices.
  - Safely handles the case where there are no valid prices.
  - Returns a JSON object:  
    `{ "average_price": <number or null>, "count": <number of items used> }`.

- *Frontend:*
  - Calls `/average-price` when the page loads and after new items are added.
  - Displays the result in a summary panel:
    - `Average medicine price: £X.YZ (based on N medicines)`
    - Shows “N/A” if no valid prices exist.
  - This demonstrates simple reporting logic based on the existing dataset.

---

## Problems Faced & How I Solved Them

### 1. Git & Repository Setup

- *Problem:* Initially, there were issues with Git configuration (`.gitconfig` not found) and nested repositories (a repo inside another repo).
- **Solution:**  
  - Created/edited `.gitconfig` to set my global user name and email.
  - Removed the inner `.git` folder from the challenge subdirectory so only one Git repository was tracked.
  - Set up a clean remote structure with:
    - `origin` pointing to my own GitHub repo.
    - (Optionally) `upstream` pointing to the original challenge repo.

### 2. Virtual Environment / Dependencies

- *Problem:* The start script couldn’t find `requirements.txt` and FastAPI wasn’t installed.
- *Cause:* `requirements.txt` was in the wrong directory (inside `backend` instead of the project root).
- *Solution:* 
  - Moved `requirements.txt` to the root of `lilly-recruitment-challenge`.
  - Deleted the broken `venv` folder.
  - Re-ran `./start.ps1`, which successfully installed dependencies and started Uvicorn.

### 3. PowerShell Execution Policy

- *Problem:* Windows blocked the `start.ps1` script due to PowerShell execution policies.
- *Solution:*  
  - Used a temporary override:
    - `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
  - After that, `./start.ps1` ran without changing system-wide settings.

### 4. Frontend Showing Blank Cards / No Data

- *Problems:*
  - `script.js` was initially empty or not included properly.
  - The medicine container was accidentally placed inside the disclaimer div.
  - IDs in the HTML were duplicated (two forms with the same `id`).
- *Solutions:*
  - Linked `script.js` correctly at the bottom of `index.html`.
  - Moved `#medicines-container` into the `<main>` area and cleaned up duplicate form sections.
  - Implemented `loadMedicines()` and `renderMedicines()` properly.
  - Used browser DevTools (Console and Network tabs) to debug fetch calls and JS errors.

---

## Evaluation

Overall, the challenge was a good end-to-end exercise in:

- Getting a new codebase running locally.
- Debugging real-world issues (Git, paths, execution policies, venv).
- Building a small but complete flow:
  - Backend API (FastAPI + JSON “database”)
  - Frontend consumption of that API
  - User input and basic reporting.

*What went well:*

- Once the environment issues were resolved, the backend and frontend integration went smoothly.
- The structure of the endpoints and the clear scope helped focus on practical features rather than over-engineering.
- Adding the average price endpoint was straightforward and demonstrated simple analytical logic.

*What I would do with more time:*

- Add update and delete actions directly on each card (inline edit/delete).
- Implement client-side validation, tests for the backend endpoints, and better error messages.
- I would make a pop each and every Medicine when client hover overs it.
- Add Images for each and every Medicine type for user clarification.
- Introduce a small design system or component library to make the UI even more consistent.
- Add pagination or filtering for larger datasets.

Overall, the challenge let me demonstrate both *problem-solving (setup & debugging)** and **full-stack development skills (API, data handling, and UI).*
// Base URL where the FastAPI backend is running
const API_BASE = "http://127.0.0.1:8000";

// -----------------------------------------------------
// On page load, fetch initial data (list + average)
// -----------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
    loadMedicines();      // Fetch and render the list of medicines
    loadAveragePrice();   // Fetch and show the average price
});

// -----------------------------------------------------
// Fetch and render medicines from the backend
// -----------------------------------------------------
async function loadMedicines() {
    const container = document.getElementById("medicines-container");
    container.innerHTML = "Loading medicines...";

    try {
        // Call the /medicines endpoint
        const res = await fetch(`${API_BASE}/medicines`);
        if (!res.ok) throw new Error("Failed to load medicines");

        const data = await res.json();

        // Backend may return either { medicines: [...] } or just [...]
        const medicines = Array.isArray(data) ? data : data.medicines;

        renderMedicines(medicines);
    } catch (err) {
        console.error(err);
        container.innerHTML = "Error loading medicines.";
    }
}

/**
 * Render a list of medicine objects into cards on the page.
 * Handles basic missing/invalid data safely.
 */
function renderMedicines(medicines) {
    const container = document.getElementById("medicines-container");
    container.innerHTML = "";

    // Graceful fallback if no data is available
    if (!medicines || !medicines.length) {
        container.textContent = "No medicines found.";
        return;
    }

    medicines.forEach((rawMed, index) => {
        try {
            // Safe defaults for missing/invalid fields
            const name = rawMed.name ?? "Unknown name";
            const price =
                typeof rawMed.price === "number"
                    ? `£${rawMed.price.toFixed(2)}`
                    : "N/A";

            // Create a card element for each medicine
            const card = document.createElement("div");
            card.className = "medicine-card";

            card.innerHTML = `
                <h3>${name}</h3>
                <p><strong>Price:</strong> ${price}</p>
            `;

            container.appendChild(card);
        } catch (e) {
            // Log any unexpected item instead of breaking the whole page
            console.error("Error rendering medicine at index", index, rawMed, e);
        }
    });
}

// -----------------------------------------------------
// Add-medicine form: POST /create
// -----------------------------------------------------

// Grab the form and message elements once
const addForm = document.getElementById("add-medicine-form");
const addMessage = document.getElementById("add-message");

// Attach submit handler to send data to the backend
addForm.addEventListener("submit", async (event) => {
    event.preventDefault();              // Stop normal form submit + page reload
    addMessage.textContent = "Submitting...";

    // Build a FormData object that matches the FastAPI Form(...) parameters
    const formData = new FormData(addForm);

    try {
        const res = await fetch(`${API_BASE}/create`, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        // Show either success or error message from the backend
        addMessage.textContent = data.message || data.error || "Done.";

        addForm.reset();         // Clear the form fields

        // Refresh both the list and the average price after adding a new item
        loadMedicines();
        loadAveragePrice();
    } catch (err) {
        console.error(err);
        addMessage.textContent = "Error adding medicine.";
    }
});

// -----------------------------------------------------
// Load and display the average price (optional objective)
// -----------------------------------------------------
async function loadAveragePrice() {
    const avgSpan = document.getElementById("avg-price");
    const metaSpan = document.getElementById("avg-meta");

    avgSpan.textContent = "Loading...";

    try {
        // Call the /average-price endpoint
        const res = await fetch(`${API_BASE}/average-price`);
        if (!res.ok) throw new Error("Failed to load average price");

        const data = await res.json();

        // If backend couldn't compute an average, show N/A
        if (data.average_price === null) {
            avgSpan.textContent = "N/A";
            metaSpan.textContent = " (no valid prices found)";
        } else {
            avgSpan.textContent = `£${data.average_price.toFixed(2)}`;
            metaSpan.textContent = ` (based on ${data.count} medicines)`;
        }
    } catch (err) {
        console.error(err);
        avgSpan.textContent = "Error";
        metaSpan.textContent = "";
    }
}
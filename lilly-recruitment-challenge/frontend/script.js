const API_BASE = "http://127.0.0.1:8000";

// -----------------------------------------------------
// 1. Load medicines on page load
// -----------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
    loadMedicines();
});

// -----------------------------------------------------
// 2. Fetch and render medicines
// -----------------------------------------------------
async function loadMedicines() {
    const container = document.getElementById("medicines-container");
    container.innerHTML = "Loading medicines...";

    try {
        const res = await fetch(`${API_BASE}/medicines`);
        if (!res.ok) throw new Error("Failed to load medicines");

        const data = await res.json();

        // Handle both possible backend formats
        const medicines = Array.isArray(data) ? data : data.medicines;

        renderMedicines(medicines);
    } catch (err) {
        console.error(err);
        container.innerHTML = "Error loading medicines.";
    }
}

function renderMedicines(medicines) {
    const container = document.getElementById("medicines-container");
    container.innerHTML = "";

    // Safety: empty list
    if (!medicines || !medicines.length) {
        container.textContent = "No medicines found.";
        return;
    }

    medicines.forEach((rawMed, index) => {
        try {
            const name = rawMed.name ?? "Unknown name";
            const price =
                typeof rawMed.price === "number"
                    ? `£${rawMed.price.toFixed(2)}`
                    : "N/A";

            const card = document.createElement("div");
            card.className = "medicine-card";

            card.innerHTML = `
                <h3>${name}</h3>
                <p><strong>Price:</strong> ${price}</p>
            `;

            container.appendChild(card);
        } catch (e) {
            console.error("Error rendering medicine at index", index, rawMed, e);
        }
    });

// -----------------------------------------------------
// 3. Add-medicine form handler
// -----------------------------------------------------
const addForm = document.getElementById("add-medicine-form");
const addMessage = document.getElementById("add-message");

if (addForm) {
  addForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // ⬅ VERY important (stops page reload)

    addMessage.textContent = "Submitting...";

    const formData = new FormData(addForm);

    try {
      const res = await fetch(`${API_BASE}/create`, {
        method: "POST",
        body: formData, // matches FastAPI Form(...)
      });

      if (!res.ok) throw new Error("Failed to create medicine");

      const data = await res.json();
      addMessage.textContent = data.message || "Medicine added!";

      addForm.reset();

      // ⬅ This is what actually refreshes the list on the page
      loadMedicines();
    } catch (err) {
      console.error(err);
      addMessage.textContent = "Error adding medicine. Please try again.";
    }
  });
}
}
// Initialize family data
let familyData = [];

// Handle visibility of custom relation input
document.getElementById("relationType").addEventListener("change", (e) => {
  const customRelationInput = document.getElementById("customRelation");
  if (e.target.value === "custom") {
    customRelationInput.style.display = "block";
  } else {
    customRelationInput.style.display = "none";
    customRelationInput.value = ""; // Clear custom input if not needed
  }
});

// Add member logic
document.getElementById("addMember").addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const relation = document.getElementById("relation").value.trim();
  const relationType = document.getElementById("relationType").value;
  const customRelation = document.getElementById("customRelation").value.trim();
  const finalRelationType = relationType === "custom" ? customRelation : relationType;

  // Validate required fields
  if (!name || !relation || !finalRelationType) {
    alert("All fields are required.");
    return;
  }

  // Prevent circular relationships
  if (name === relation) {
    alert("A person cannot have a relationship with themselves.");
    return;
  }

  // Prevent duplicate relationships
  if (familyData.some(member => member.name === name && member.relation === relation && member.type === finalRelationType)) {
    alert(`The relationship "${name} (${finalRelationType} of ${relation})" already exists.`);
    return;
  }

  // Add valid relationship
  familyData.push({ name, relation, type: finalRelationType });
  document.getElementById("membersList").innerHTML += `<li>${name} (${finalRelationType} of ${relation})</li>`;
  document.getElementById("familyForm").reset();
  document.getElementById("customRelation").style.display = "none";
});

// Switch to graph view
document.getElementById("viewGraph").addEventListener("click", () => {
  document.getElementById("formView").style.display = "none";
  document.getElementById("graphView").style.display = "block";
  renderFamilyTree();
});

// Switch back to form view
document.getElementById("editForm").addEventListener("click", () => {
  document.getElementById("formView").style.display = "block";
  document.getElementById("graphView").style.display = "none";
});

// Render graph with relationships
function renderFamilyTree() {
  const nodes = [];
  const edges = [];

  familyData.forEach(({ name, relation, type }) => {
    if (!nodes.some(node => node.id === name)) {
      nodes.push({ id: name, label: name });
    }
    if (!nodes.some(node => node.id === relation)) {
      nodes.push({ id: relation, label: relation });
    }
    edges.push({
      from: type === "parent" || type === "grandparent" || type === "guardian" ? relation : name,
      to: type === "parent" || type === "grandparent" || type === "guardian" ? name : relation,
      label: type, // Display the relationship type on the edge
      color: {
        color: type === "parent" ? "blue" : type === "sibling" ? "green" : "gray",
      },
    });
  });

  const container = document.getElementById("familyTree");
  const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
  const options = {
    layout: {
      hierarchical: {
        direction: "UD",
        sortMethod: "directed",
      },
    },
    edges: {
      font: { align: "middle" },
      arrows: { to: { enabled: true } },
    },
    physics: {
      enabled: false,
    },
  };

  new vis.Network(container, data, options);
}

// Export JSON logic
document.getElementById("exportJson").addEventListener("click", () => {
  const dataStr = JSON.stringify(familyData, null, 2); // Format JSON for readability
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "family_tree.json";
  link.click();

  URL.revokeObjectURL(url); // Clean up
});

// Import JSON logic
document.getElementById("importJson").addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validate the structure of the JSON
        if (Array.isArray(importedData) && importedData.every(item => item.name && item.relation && item.type)) {
          familyData = importedData; // Update the global data
          updateMembersList(); // Refresh the members list
          alert("Family tree successfully imported!");
        } else {
          alert("Invalid JSON structure. Please ensure the file contains valid family tree data.");
        }
      } catch (err) {
        alert("Error parsing JSON. Please check the file.");
      }
    };

    reader.readAsText(file);
  }
});

// Update the members list in the form view
function updateMembersList() {
  const membersList = document.getElementById("membersList");
  membersList.innerHTML = "";

  familyData.forEach(({ name, relation, type }) => {
    membersList.innerHTML += `<li>${name} (${type} of ${relation})</li>`;
  });
}

// Show help modal
document.getElementById("helpButton").addEventListener("click", () => {
  document.getElementById("helpModal").style.display = "block";
  document.getElementById("modalOverlay").style.display = "block";
});

// Close help modal
document.getElementById("closeHelp").addEventListener("click", () => {
  document.getElementById("helpModal").style.display = "none";
  document.getElementById("modalOverlay").style.display = "none";
});

let familyData = [];

// Add member logic
document.getElementById("addMember").addEventListener("click", () => {
  const name = document.getElementById("name").value;
  const relation = document.getElementById("relation").value;
  const relationType = document.getElementById("relationType").value;

  if (name && relation) {
    familyData.push({ name, relation, type: relationType });
    document.getElementById("membersList").innerHTML += `<li>${name} (${relationType} of ${relation})</li>`;
    document.getElementById("familyForm").reset();
  }
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

// Render graph
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
        from: type === "parent" ? relation : name, // Parent points to child
        to: type === "parent" ? name : relation,  // Child points to parent
      });
    });
  
    const container = document.getElementById("familyTree");
    const data = {
      nodes: new vis.DataSet(nodes),
      edges: new vis.DataSet(edges),
    };
  
    const options = {
      layout: {
        hierarchical: {
          direction: "DU", // Top (Parent) to Down (Child)
          sortMethod: "directed",
        },
      },
      physics: {
        enabled: true, // Disable physics for cleaner layout
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

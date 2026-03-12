import React, { useState } from "react";

// --- MOCK DATA FOR DEMO MODE ---
const MOCK_INVENTORY = [
  { sku: "RM-100", name: "Steel Bracket", unit: "pcs", isSubAssembly: false, source: "Inventory" },
  { sku: "RM-101", name: "M6 Hex Bolt", unit: "pcs", isSubAssembly: false, source: "Inventory" },
  { sku: "RM-202", name: "Industrial Adhesive", unit: "kg", isSubAssembly: false, source: "Inventory" },
  { sku: "RM-305", name: "Aluminum Housing", unit: "pcs", isSubAssembly: false, source: "Inventory" },
];

const MOCK_PRODUCTS = [
  { sku: "SA-500", name: "Control Board Alpha", unit: "pcs", isSubAssembly: true, source: "Products" },
  { sku: "SA-900", name: "Wiring Loom V2", unit: "pcs", isSubAssembly: true, source: "Products" },
];

export default function ManufacturedProductRecord({ setView }) {
  // --- STATE: CORE METADATA ---
  const [productData, setProductData] = useState({
    name: "Standard Hub Assembly",
    sku: "PRD-2024-001",
    type: "manufactured",
    category: "Mechanical Systems",
    unit: "pcs",
    status: "active",
    default_supplier: "Global Fab Corp",
    lead_time_days: 14,
    costing_method: "standard",
    bom_enabled: true
  });

  const [bomItems, setBomItems] = useState([
    { component_sku: "RM-100", name: "Steel Bracket", quantity_required: 2, unit: "pcs", sub_assembly: false, notes: "Grade A" }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const colors = {
    primary: "#0d9488",
    indigo: "#4f46e5",
    border: "#e2e8f0",
    bg: "#f8fafc",
    text: "#1e293b"
  };

  // --- LOGIC: SIMULATED SEARCH ---
  const searchParts = (term) => {
    setSearchTerm(term);
    if (term.length < 2) { setSearchResults([]); return; }
    
    // Simulate searching both Inventory and Products locally
    const allOptions = [...MOCK_INVENTORY, ...MOCK_PRODUCTS];
    const results = allOptions.filter(item => 
      item.sku.toLowerCase().includes(term.toLowerCase()) || 
      item.name.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 5);

    setSearchResults(results);
  };

  const addPartToBOM = (part) => {
    if (bomItems.find(item => item.component_sku === part.sku)) return;
    setBomItems([...bomItems, {
      component_sku: part.sku,
      name: part.name,
      quantity_required: 1,
      unit: part.unit || "pcs",
      supplier_sku: part.supplier_sku || "",
      sub_assembly: part.isSubAssembly,
      notes: ""
    }]);
    setSearchTerm("");
    setSearchResults([]);
  };

  // --- LOGIC: SIMULATED SAVE ---
  const handleSave = async () => {
    if (!productData.sku || !productData.name) return alert("SKU and Name required.");
    setIsSaving(true);

    // Simulate Network Latency
    setTimeout(() => {
      console.log("DEMO MODE: Saved Product Object:", productData);
      console.log("DEMO MODE: Saved BOM Items:", bomItems);
      
      setIsSaving(false);
      alert("DEMO MODE: Master Product and BOM saved successfully to console!");
      if (typeof setView === "function") setView("home");
    }, 1500);
  };

  const fieldStyle = { display: "flex", flexDirection: "column", gap: "5px" };
  const inputStyle = { padding: "10px", borderRadius: "6px", border: `1px solid ${colors.border}`, outline: "none" };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px", fontFamily: "Inter, sans-serif", color: colors.text }}>
      
      {/* DEMO HEADER BANNER */}
      <div style={{ background: "#fef9c3", border: "1px solid #fde047", padding: "10px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center", fontWeight: "bold", color: "#854d0e" }}>
        🚀 You are in DEMO MODE. Database writes are simulated.
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
           <h1 style={{ margin: 0 }}>Master Product Record</h1>
           <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Create or update manufacturing specifications</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} style={{ padding: "12px 24px", background: colors.primary, color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", opacity: isSaving ? 0.7 : 1 }}>
          {isSaving ? "Simulating Save..." : "💾 Save Product Record"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div style={fieldStyle}>
          <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Product Name</label>
          <input style={inputStyle} value={productData.name} onChange={e => setProductData({...productData, name: e.target.value})} />
        </div>
        <div style={fieldStyle}>
          <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>SKU</label>
          <input style={inputStyle} value={productData.sku} onChange={e => setProductData({...productData, sku: e.target.value})} />
        </div>
        <div style={fieldStyle}>
          <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Type</label>
          <select style={inputStyle} value={productData.type} onChange={e => setProductData({...productData, type: e.target.value})}>
            <option value="manufactured">Manufactured</option>
            <option value="purchased">Purchased</option>
            <option value="service">Service</option>
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Category</label>
          <input style={inputStyle} value={productData.category} onChange={e => setProductData({...productData, category: e.target.value})} />
        </div>
        <div style={fieldStyle}>
          <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Unit of Measure</label>
          <select style={inputStyle} value={productData.unit} onChange={e => setProductData({...productData, unit: e.target.value})}>
            <option value="pcs">pcs</option>
            <option value="kg">kg</option>
            <option value="ft">ft</option>
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>Status</label>
          <select style={inputStyle} value={productData.status} onChange={e => setProductData({...productData, status: e.target.value})}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: "30px", background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <h3 style={{ marginTop: 0 }}>Bill of Materials (BOM)</h3>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>Define the raw materials and sub-assemblies required to build this product.</p>
        
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input 
            style={{ ...inputStyle, width: "100%", boxSizing: "border-box", border: `2px solid ${colors.indigo}` }} 
            placeholder="🔍 Search Demo Inventory (try 'Steel', 'Control', 'RM', 'SA')..." 
            value={searchTerm} 
            onChange={e => searchParts(e.target.value)} 
          />
          {searchResults.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: `1px solid ${colors.border}`, zIndex: 10, borderRadius: "0 0 8px 8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
              {searchResults.map(r => (
                <div key={r.sku} onClick={() => addPartToBOM(r)} style={{ padding: "12px", cursor: "pointer", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span><strong>{r.sku}</strong> - {r.name}</span>
                  <span style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "12px", background: r.isSubAssembly ? "#e0e7ff" : "#f1f5f9", color: r.isSubAssembly ? colors.indigo : "#64748b" }}>{r.source}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: `2px solid ${colors.bg}`, color: "#64748b", fontSize: "13px" }}>
              <th style={{ padding: "10px" }}>PART / SKU</th>
              <th style={{ padding: "10px" }}>QTY REQ</th>
              <th style={{ padding: "10px" }}>UNIT</th>
              <th style={{ padding: "10px" }}>TYPE</th>
              <th style={{ padding: "10px" }}>NOTES</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bomItems.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${colors.bg}` }}>
                <td style={{ padding: "10px" }}>
                  <div style={{ fontWeight: "bold" }}>{item.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>{item.component_sku}</div>
                </td>
                <td>
                  <input type="number" value={item.quantity_required} style={{ width: "60px", padding: "8px", borderRadius: "4px", border: `1px solid ${colors.border}` }} 
                    onChange={e => {
                      const up = [...bomItems]; up[idx].quantity_required = e.target.value; setBomItems(up);
                    }} 
                  />
                </td>
                <td style={{ fontSize: "14px", color: "#64748b" }}>{item.unit}</td>
                <td style={{ fontSize: "12px" }}>
                   <span style={{ padding: "2px 6px", borderRadius: "4px", background: item.sub_assembly ? "#fdf2f8" : "#f0fdf4", color: item.sub_assembly ? "#9d174d" : "#166534" }}>
                      {item.sub_assembly ? "📦 Sub-Assy" : "🔧 Component"}
                   </span>
                </td>
                <td>
                  <input placeholder="Alt part #..." value={item.notes} style={{ ...inputStyle, padding: "5px", fontSize: "12px", width: "100%" }}
                    onChange={e => {
                      const up = [...bomItems]; up[idx].notes = e.target.value; setBomItems(up);
                    }} 
                  />
                </td>
                <td>
                  <button onClick={() => setBomItems(bomItems.filter((_, i) => i !== idx))} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>✕</button>
                </td>
              </tr>
            ))}
            {bomItems.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontStyle: "italic" }}>No components added to BOM yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
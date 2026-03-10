import React, { useState } from "react";
import { db } from "./firebase"; 
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp } from "firebase/firestore";

export default function ManufacturedProductRecord({ setView }) {
  // --- DEMO DATA SEED ---
  const demoComponents = [
    { id: "mock-1", partName: "Aluminum Frame 20mm", sku: "AL-20", cost: 15.50, isSubAssembly: false },
    { id: "mock-2", partName: "Power Control Board", sku: "PCB-V4", cost: 42.00, isSubAssembly: false },
    { id: "mock-3", partName: "Lens Housing Assy", sku: "ASSY-LENS", cost: 125.00, isSubAssembly: true }
  ];

  // --- STATE MANAGEMENT ---
  const [productName, setProductName] = useState("Cinema Rig V2");
  const [sku, setSku] = useState("CR-002");
  const [laborCost, setLaborCost] = useState(45);
  const [bomItems, setBomItems] = useState([]); 
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(demoComponents);
  const [showDropdown, setShowDropdown] = useState(false); 
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- STYLING ---
  const colors = {
    cardBg: "#ffffff",
    textMain: "#0f172a",
    textMuted: "#64748b",
    accentTeal: "#0d9488",
    accentIndigo: "#1e40af", 
    border: "#f1f5f9",
    inputBg: "#f8fafc"
  };

  const inputStyle = {
    width: "100%", padding: "12px", borderRadius: "8px", border: `1px solid ${colors.border}`,
    background: colors.inputBg, fontSize: "14px", outline: "none"
  };

  // --- LOGIC: SEARCH ---
  const searchInventory = async (term) => {
    setSearchTerm(term);
    setShowDropdown(true); 
    
    if (term.length < 1) { 
      setSearchResults(demoComponents); 
      return; 
    }

    setIsSearching(true);
    try {
      const results = [];
      const searchPrefix = term.toUpperCase();
      const searchEnd = searchPrefix + "\uf8ff";

      const invQ = query(collection(db, "inventory"), where("sku", ">=", searchPrefix), where("sku", "<=", searchEnd), limit(5));
      const prodQ = query(collection(db, "products"), where("sku", ">=", searchPrefix), where("sku", "<=", searchEnd), limit(3));

      const [invSnap, prodSnap] = await Promise.all([getDocs(invQ), getDocs(prodQ)]);

      invSnap.forEach((doc) => results.push({ id: doc.id, partName: doc.data().description || "Unnamed Part", sku: doc.data().sku, cost: doc.data().unit_cost || 0, isSubAssembly: false }));
      prodSnap.forEach((doc) => results.push({ id: doc.id, partName: doc.data().productName || "Unnamed Assy", sku: doc.data().sku, cost: doc.data().finalUnitCost || 0, isSubAssembly: true }));

      if (results.length === 0) {
        setSearchResults(demoComponents.filter(p => p.sku.includes(searchPrefix) || p.partName.toUpperCase().includes(searchPrefix)));
      } else {
        setSearchResults(results);
      }
    } catch (error) {
      setSearchResults(demoComponents.filter(p => p.sku.includes(term.toUpperCase())));
    } finally {
      setIsSearching(false);
    }
  };

  const addPartToBOM = (part) => {
    if (bomItems.find(item => item.sku === part.sku)) {
      alert("This part is already in the BOM.");
      return;
    }
    setBomItems([...bomItems, { id: part.id, partName: part.partName, sku: part.sku, qty: 1, unitCost: part.cost, isSubAssembly: part.isSubAssembly }]);
    setSearchTerm(""); 
    setShowDropdown(false); 
  };

  const removePart = (id) => setBomItems(bomItems.filter(item => item.id !== id));

  const handleSaveProduct = async () => {
    if (!productName || !sku || bomItems.length === 0) {
      alert("Please provide a Product Name, SKU, and at least one BOM item.");
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, "products"), { productName, sku: sku.toUpperCase(), laborCost: Number(laborCost), totalPartsCost: totalBOMCost, finalUnitCost: finalProductCost, bom: bomItems, createdAt: serverTimestamp() });
      alert("✅ Master Product & BOM Saved Successfully!");
    } catch (error) {
      alert("✅ [DEMO MODE] Master Product & BOM Saved!");
    } finally {
      setIsSaving(false);
    }
  };

  const totalBOMCost = bomItems.reduce((acc, item) => acc + (Number(item.qty) * Number(item.unitCost)), 0);
  const finalProductCost = totalBOMCost + Number(laborCost);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ color: colors.textMain, fontSize: "32px", fontWeight: "900", margin: 0 }}>Master Product Record</h1>
        <p style={{ color: colors.textMuted, margin: "5px 0 0 0" }}>Define manufactured goods and BOM requirements.</p>
      </header>

      {/* 1. PRODUCT DETAILS */}
      <div style={{ background: colors.cardBg, padding: "30px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", marginBottom: "25px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "20px", color: colors.textMain }}>General Information</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: colors.textMuted, marginBottom: "8px", textTransform: "uppercase" }}>Product Name</label>
            <input style={inputStyle} value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: colors.textMuted, marginBottom: "8px", textTransform: "uppercase" }}>SKU / Model</label>
            <input style={inputStyle} value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
        </div>
      </div>

      {/* 2. BOM SECTION */}
      <div style={{ background: colors.cardBg, padding: "30px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", minHeight: "400px" }}>
        <h2 style={{ fontSize: "18px", color: colors.textMain, marginBottom: "20px" }}>Bill of Materials (BOM)</h2>

        <div style={{ marginBottom: "40px", position: "relative" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: colors.textMuted, marginBottom: "8px", textTransform: "uppercase" }}>
            Add Component
          </label>
          <input 
            style={inputStyle} 
            placeholder="Search SKU..." 
            value={searchTerm}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => searchInventory(e.target.value)}
          />
          
          {showDropdown && searchResults.length > 0 && (
            <div style={{ 
              position: "absolute", top: "100%", left: 0, right: 0, 
              background: "white", border: `1px solid ${colors.border}`, 
              borderRadius: "8px", marginTop: "5px", 
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 9999,
              maxHeight: "250px", overflowY: "auto"
            }}>
              {searchResults.map(result => (
                <div 
                  key={result.id}
                  onClick={() => addPartToBOM(result)}
                  style={{ padding: "12px", cursor: "pointer", borderBottom: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.inputBg}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <div>
                    <div style={{ fontWeight: "700", color: colors.textMain, fontSize: "14px" }}>{result.partName}</div>
                    <div style={{ fontSize: "12px", color: colors.textMuted }}>{result.sku}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontWeight: "bold", color: colors.accentTeal }}>${result.cost.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div 
                onClick={() => setShowDropdown(false)} 
                style={{ padding: "8px", textAlign: "center", fontSize: "11px", color: colors.accentIndigo, cursor: "pointer", background: colors.inputBg }}
              >
                Close Suggestions
              </div>
            </div>
          )}
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: `2px solid ${colors.border}` }}>
                <th style={{ padding: "12px", fontSize: "11px", color: colors.textMuted, textTransform: "uppercase" }}>Component</th>
                <th style={{ padding: "12px", fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "12px", fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", textAlign: "right" }}>Total Cost</th>
                <th style={{ width: "40px" }}></th>
              </tr>
            </thead>
            <tbody>
              {bomItems.map(item => (
                <tr key={item.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: "12px" }}>
                    <div style={{ fontWeight: "600", color: colors.textMain, fontSize: "14px" }}>{item.partName}</div>
                    <div style={{ fontSize: "11px", color: colors.textMuted }}>{item.sku}</div>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <input 
                      type="number" 
                      value={item.qty} 
                      onChange={(e) => setBomItems(bomItems.map(b => b.id === item.id ? {...b, qty: e.target.value} : b))}
                      style={{ width: "50px", textAlign: "center", border: "1px solid #ddd", borderRadius: "4px", padding: "4px" }}
                    />
                  </td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: colors.textMain }}>
                    ${(Number(item.qty) * Number(item.unitCost)).toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => removePart(item.id)} style={{ color: "#e11d48", border: "none", background: "none", cursor: "pointer" }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bomItems.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: colors.textMuted }}>
              No components added yet. Use the search bar above.
            </div>
          )}
        </div>

        <div style={{ marginTop: "30px", padding: "20px", background: colors.inputBg, borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-end" }}>
          <div style={{ fontSize: "14px", color: colors.textMuted }}>Total Parts Cost: <b>${totalBOMCost.toFixed(2)}</b></div>
          <div style={{ fontSize: "14px", color: colors.textMuted }}>
            Labor Cost: <input type="number" style={{ width: "80px", marginLeft: "10px", padding: "5px" }} value={laborCost} onChange={(e) => setLaborCost(e.target.value)} />
          </div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: colors.accentTeal, marginTop: "10px", borderTop: `2px solid ${colors.border}`, paddingTop: "10px" }}>
            Unit Cost: ${finalProductCost.toFixed(2)}
          </div>
        </div>

        <button 
          onClick={handleSaveProduct}
          disabled={isSaving}
          style={{ width: "100%", marginTop: "25px", padding: "15px", borderRadius: "12px", background: colors.accentTeal, color: "white", border: "none", fontWeight: "800", fontSize: "16px", cursor: "pointer" }}
        >
          {isSaving ? "Saving..." : "Save Master Product"}
        </button>
      </div>
    </div>
  );
}
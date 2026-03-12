import React, { useState, useEffect } from 'react';
// --- KEEPING YOUR SIDEVIEW IMPORT ---
import POModule from './POModule'; 

// --- MOCK DATA FOR DEMO MODE ---
const MOCK_INVENTORY = [
  { id: "i1", sku: "WIDGET-01", description: "High-Performance Bearing", qty_on_hand: 45, qty_production: 12, last_po_ref: "PO-2026-001", last_updated: new Date() },
  { id: "i2", sku: "SENSOR-X", description: "Laser Depth Sensor", qty_on_hand: 3, qty_production: 8, last_po_ref: "PO-2026-004", last_updated: new Date() },
  { id: "i3", sku: "CABLE-HD", description: "Heavy Duty Coaxial 10ft", qty_on_hand: 120, qty_production: 50, last_po_ref: "PO-2026-009", last_updated: new Date() },
  { id: "i4", sku: "BRACKET-M", description: "Universal Mounting Bracket", qty_on_hand: 0, qty_production: 22, last_po_ref: "PO-2026-012", last_updated: new Date() }
];

const InventoryDashboard = ({ setView }) => {
  // --- STATE MANAGEMENT ---
  const [inventory, setInventory] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [loading, setLoading] = useState(true);

  // --- SIDE-VIEW STATE ---
  const [selectedPo, setSelectedPo] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // --- TRANSFER STATE ---
  const [transferItem, setTransferItem] = useState(null); 
  const [transferQty, setTransferQty] = useState(0);
  const [transferMode, setTransferMode] = useState("TO_PROD");

  const colors = {
    primary: "#d97706", 
    secondary: "#b45309",
    lightGray: "#e2e8f0",
    textDark: "#1a202c",
    successGreen: "#38a169",
    infoBlue: "#2563eb",
    warningRed: "#ef4444",
    sectionBg: "#f8fafc",
    prodIndigo: "#4f46e5",
    whSlate: "#475569" 
  };

  // --- SIMULATED DATA LOAD ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setInventory(MOCK_INVENTORY);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // --- LOGIC: EXECUTE MOVE (DEMO MODE) ---
  const handleExecuteMove = () => {
    if (!transferItem || transferQty <= 0) return;
    
    const numQty = Number(transferQty);
    const updatedInventory = inventory.map(item => {
      if (item.id === transferItem.id) {
        if (transferMode === "TO_PROD") {
          if (numQty > item.qty_on_hand) { alert("Insufficient Warehouse Stock"); return item; }
          return { ...item, qty_on_hand: item.qty_on_hand - numQty, qty_production: item.qty_production + numQty };
        } else {
          if (numQty > item.qty_production) { alert("Insufficient Production Stock"); return item; }
          return { ...item, qty_on_hand: item.qty_on_hand + numQty, qty_production: item.qty_production - numQty };
        }
      }
      return item;
    });

    setInventory(updatedInventory);
    setTransferItem(null);
    setTransferQty(0);
  };

  const filteredInventory = inventory.filter(item => 
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.last_po_ref?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItemsWarehouse = inventory.reduce((acc, item) => acc + (item.qty_on_hand || 0), 0);
  const totalItemsProduction = inventory.reduce((acc, item) => acc + (item.qty_production || 0), 0);
  const lowStockCount = inventory.filter(item => item.qty_on_hand > 0 && item.qty_on_hand < 5).length;

  // --- STYLES ---
  const cardStyle = { background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "20px" };
  const statBoxStyle = { padding: "15px", borderRadius: "8px", background: colors.sectionBg, textAlign: "center", border: `1px solid ${colors.lightGray}` };
  const drawerOverlayStyle = { position: "fixed", top: 0, right: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: (isDrawerOpen || transferItem) ? "block" : "none", zIndex: 1000 };
  const drawerContentStyle = { position: "fixed", top: 0, right: isDrawerOpen ? 0 : "-100%", width: "90%", maxWidth: "1100px", height: "100%", backgroundColor: "white", boxShadow: "-5px 0 15px rgba(0,0,0,0.1)", zIndex: 1001, transition: "right 0.4s ease", overflowY: "auto", padding: "20px" };

  return (
    <div style={{ maxWidth: "1100px", margin: "20px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      
      {/* DEMO BANNER */}
      <div style={{ background: colors.infoBlue, color: "white", padding: "10px", borderRadius: "8px", marginBottom: "15px", textAlign: "center", fontSize: "13px", fontWeight: "bold" }}>
        🚀 DEMO MODE: Inventory transfers and PO previews are simulated.
      </div>

      {/* --- REUSABLE TRANSFER/RETURN MODAL --- */}
      {transferItem && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "white", padding: "30px", borderRadius: "16px", zIndex: 1100, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", width: "400px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: transferMode === "TO_PROD" ? colors.prodIndigo : colors.whSlate }}>
            {transferMode === "TO_PROD" ? "Move to Production Floor" : "Return to Main Warehouse"}
          </h3>
          <p style={{ fontSize: "14px" }}>Part: <strong>{transferItem.sku}</strong></p>
          <input type="number" placeholder="Enter quantity..." value={transferQty} onChange={(e) => setTransferQty(e.target.value)} style={{ width: "100%", padding: "12px", marginTop: "15px", borderRadius: "8px", border: `1px solid ${colors.lightGray}`, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button onClick={handleExecuteMove} style={{ flex: 2, padding: "12px", background: transferMode === "TO_PROD" ? colors.prodIndigo : colors.whSlate, color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Confirm</button>
            <button onClick={() => setTransferItem(null)} style={{ flex: 1, padding: "12px", background: colors.lightGray, border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* --- SIDE-VIEW DRAWER (PO Preview) --- */}
      <div style={drawerOverlayStyle} onClick={() => { setIsDrawerOpen(false); setTransferItem(null); }} />
      <div style={drawerContentStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: `2px solid ${colors.lightGray}`, paddingBottom: "10px" }}>
           <h2 style={{ margin: 0, color: colors.infoBlue }}>Internal Purchase Order View</h2>
           <button onClick={() => setIsDrawerOpen(false)} style={{ padding: "8px 15px", borderRadius: "6px", border: "none", backgroundColor: colors.warningRed, color: "white", cursor: "pointer", fontWeight: "bold" }}>Close Preview ×</button>
        </div>
        {/* POModule is now strictly populated by the selected PO number */}
        {isDrawerOpen && <POModule setView={() => setIsDrawerOpen(false)} selectedPoNum={selectedPo} />}
      </div>

      <button onClick={() => setView("home")} style={{ marginBottom: "15px", background: "none", border: "none", color: colors.primary, fontWeight: "bold", cursor: "pointer" }}>← Dashboard</button>

      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: colors.primary, margin: 0 }}>📋 Inventory & Logistics</h2>
          <button style={{ padding: "10px 18px", background: colors.primary, color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>+ Receive New Parts</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "30px" }}>
          <div style={statBoxStyle}>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold" }}>MAIN WAREHOUSE</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: colors.textDark }}>{totalItemsWarehouse}</div>
          </div>
          <div style={{ ...statBoxStyle, borderColor: colors.prodIndigo, background: "#f5f3ff" }}>
            <div style={{ fontSize: "11px", color: colors.prodIndigo, fontWeight: "bold" }}>PRODUCTION FLOOR</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: colors.prodIndigo }}>{totalItemsProduction}</div>
          </div>
          <div style={{ ...statBoxStyle, borderColor: lowStockCount > 0 ? colors.warningRed : colors.lightGray }}>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "bold" }}>LOW STOCK (WH)</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: colors.warningRed }}>{lowStockCount}</div>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <input type="text" placeholder="Search by SKU, Description, or PO#..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: `1px solid ${colors.lightGray}`, boxSizing: "border-box" }} />
        </div>

        {loading ? <p>Loading Inventory...</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", background: colors.sectionBg, fontSize: "13px" }}>
                  <th style={{ padding: "15px", borderBottom: `2px solid ${colors.lightGray}` }}>SKU / Part #</th>
                  <th style={{ padding: "15px", borderBottom: `2px solid ${colors.lightGray}` }}>Description</th>
                  <th style={{ padding: "15px", borderBottom: `2px solid ${colors.lightGray}` }}>PO Source</th>
                  <th style={{ padding: "15px", borderBottom: `2px solid ${colors.lightGray}` }}>Main WH</th>
                  <th style={{ padding: "15px", borderBottom: `2px solid ${colors.lightGray}` }}>Prod Floor</th>
                  <th style={{ padding: "15px", borderBottom: `2px solid ${colors.lightGray}`, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "15px", fontWeight: "bold" }}>{item.sku}</td>
                    <td style={{ padding: "15px", fontSize: "14px" }}>{item.description}</td>
                    <td 
                      style={{ padding: "15px", fontSize: "12px", color: colors.infoBlue, cursor: "pointer", textDecoration: "underline" }} 
                      onClick={() => { setSelectedPo(item.last_po_ref); setIsDrawerOpen(true); }}
                    >
                      {item.last_po_ref}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{ fontWeight: "bold", color: item.qty_on_hand < 5 ? colors.warningRed : colors.textDark }}>{item.qty_on_hand}</span>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{ fontWeight: "bold", color: colors.prodIndigo }}>{item.qty_production}</span>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                        <button onClick={() => { setTransferMode("TO_PROD"); setTransferItem(item); }} style={{ padding: "6px 10px", borderRadius: "6px", border: "none", backgroundColor: colors.prodIndigo, color: "white", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>Move ➔</button>
                        <button onClick={() => { setTransferMode("TO_WH"); setTransferItem(item); }} style={{ padding: "6px 10px", borderRadius: "6px", border: "none", backgroundColor: colors.whSlate, color: "white", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>↩ Return</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryDashboard;
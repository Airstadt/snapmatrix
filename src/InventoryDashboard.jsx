import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, onSnapshot, orderBy, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
// --- KEEPING YOUR SIDEVIEW IMPORT ---
import POModule from './POModule'; 

const InventoryDashboard = ({ setView }) => {
  // --- STATE MANAGEMENT (FULL RESTORE) ---
  const [inventory, setInventory] = useState([]); // All inventory records
  const [searchTerm, setSearchTerm] = useState(""); // For the search bar
  const [loading, setLoading] = useState(true);

  // --- SIDE-VIEW STATE (FULL RESTORE) ---
  const [selectedPo, setSelectedPo] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // --- NEW TRANSFER STATE ---
  const [transferItem, setTransferItem] = useState(null); 
  const [transferQty, setTransferQty] = useState(0);

  // --- UI THEME COLORS ---
  const colors = {
    primary: "#d97706", // Amber-600
    secondary: "#b45309",
    lightGray: "#e2e8f0",
    textDark: "#1a202c",
    successGreen: "#38a169",
    infoBlue: "#2563eb",
    warningRed: "#ef4444",
    sectionBg: "#f8fafc",
    prodIndigo: "#4f46e5" // Indigo for Production Floor
  };

  // --- REAL-TIME DATA LISTENER (AUDITED FOR LOCATIONS) ---
// --- REAL-TIME DATA LISTENER (DEMO ENHANCED) ---
  useEffect(() => {
    const q = query(collection(db, "inventory"), orderBy("received_at", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // --- INJECT DEMO DATA IF DB IS EMPTY/DISCONNECTED ---
        const demoData = [
          { id: "demo-1", sku: "CAM-RED-01", description: "RED V-Raptor Body", po_ref: "PO-8821", qty_on_hand: 2, qty_production: 1 },
          { id: "demo-2", sku: "LENS-PRM-35", description: "35mm Prime T1.5", po_ref: "PO-8821", qty_on_hand: 12, qty_production: 4 },
          { id: "demo-3", sku: "GRIP-SD-09", description: "C-Stand 40 inch", po_ref: "PO-7740", qty_on_hand: 3, qty_production: 20 },
        ];
        setInventory(demoData);
        setLoading(false);
      } else {
        const invData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          qty_production: doc.data().qty_production || 0 
        }));
        setInventory(invData);
        setLoading(false);
      }
    }, (error) => {
      console.error("Firebase Listener Error:", error);
      // Fallback for complete connection failure
      setInventory([
        { id: "err-1", sku: "OFFLINE-MODE", description: "Running on local demo data", po_ref: "DEMO-001", qty_on_hand: 5, qty_production: 5 }
      ]);
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, []);

  // --- LOGIC: TRANSFER TO PRODUCTION ---
  const executeTransfer = async () => {
    if (!transferItem || transferQty <= 0) return;
    
    // UI Update for the demo so it "feels" real
    const updatedInventory = inventory.map(item => {
      if (item.id === transferItem.id) {
        return {
          ...item,
          qty_on_hand: item.qty_on_hand - Number(transferQty),
          qty_production: (item.qty_production || 0) + Number(transferQty)
        };
      }
      return item;
    });

    try {
      const batch = writeBatch(db);
      const itemRef = doc(db, "inventory", transferItem.id);
      batch.update(itemRef, {
        qty_on_hand: transferItem.qty_on_hand - Number(transferQty),
        qty_production: (transferItem.qty_production || 0) + Number(transferQty),
        last_transfer_date: serverTimestamp()
      });
      await batch.commit();
    } catch (err) {
      console.warn("Firebase Batch failed (Demo Mode):", err.message);
      // We still update the local state so the UI changes for the viewer!
      setInventory(updatedInventory);
    } finally {
      setTransferItem(null);
      setTransferQty(0);
    }
  };

  // --- FILTERING LOGIC ---
  const filteredInventory = inventory.filter(item => 
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.po_ref?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- CALCULATE QUICK STATS ---
  const totalItemsWarehouse = inventory.reduce((acc, item) => acc + (item.qty_on_hand || 0), 0);
  const totalItemsProduction = inventory.reduce((acc, item) => acc + (item.qty_production || 0), 0);
  const lowStockCount = inventory.filter(item => item.qty_on_hand > 0 && item.qty_on_hand < 5).length;

  // --- STYLES (NO TRIMMING) ---
  const cardStyle = {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    marginBottom: "20px"
  };

  const statBoxStyle = {
    padding: "15px",
    borderRadius: "8px",
    background: colors.sectionBg,
    textAlign: "center",
    border: `1px solid ${colors.lightGray}`
  };

  const drawerOverlayStyle = {
    position: "fixed",
    top: 0,
    right: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: (isDrawerOpen || transferItem) ? "block" : "none",
    zIndex: 1000,
    transition: "opacity 0.3s ease"
  };

  const drawerContentStyle = {
    position: "fixed",
    top: 0,
    right: isDrawerOpen ? 0 : "-100%",
    width: "85%", 
    maxWidth: "1100px",
    height: "100%",
    backgroundColor: "white",
    boxShadow: "-5px 0 15px rgba(0,0,0,0.1)",
    zIndex: 1001,
    transition: "right 0.4s cubic-bezier(0.075, 0.82, 0.165, 1)",
    overflowY: "auto",
    padding: "20px"
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "20px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      
      {/* --- TRANSFER MODAL --- */}
      {transferItem && (
        <div style={{ 
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", 
          background: "white", padding: "30px", borderRadius: "16px", zIndex: 1100, 
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", width: "400px" 
        }}>
          <h3 style={{ margin: "0 0 10px 0", color: colors.prodIndigo }}>Move to Production Floor</h3>
          <p style={{ fontSize: "14px" }}>Part: <strong>{transferItem.sku}</strong></p>
          <p style={{ fontSize: "12px", color: colors.textMuted }}>Warehouse Max: {transferItem.qty_on_hand}</p>
          
          <input 
            type="number" 
            placeholder="Qty to move..."
            value={transferQty}
            onChange={(e) => setTransferQty(e.target.value)}
            style={{ width: "100%", padding: "12px", marginTop: "15px", borderRadius: "8px", border: `1px solid ${colors.lightGray}` }}
          />
          
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button onClick={executeTransfer} style={{ flex: 2, padding: "12px", background: colors.prodIndigo, color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Confirm Move</button>
            <button onClick={() => setTransferItem(null)} style={{ flex: 1, padding: "12px", background: colors.lightGray, border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* --- SIDE-VIEW DRAWER --- */}
      <div style={drawerOverlayStyle} onClick={() => { setIsDrawerOpen(false); setTransferItem(null); }} />
      <div style={drawerContentStyle}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
           <button 
             onClick={() => setIsDrawerOpen(false)}
             style={{ padding: "8px 15px", borderRadius: "6px", border: "none", backgroundColor: colors.warningRed, color: "white", cursor: "pointer", fontWeight: "bold" }}
           >
             Close Preview ×
           </button>
        </div>
        {isDrawerOpen && <POModule setView={() => setIsDrawerOpen(false)} selectedPoNum={selectedPo} />}
      </div>

      {/* NAVIGATION */}
      <button 
        onClick={() => setView("home")} 
        style={{ marginBottom: "15px", background: "none", border: "none", color: colors.primary, fontWeight: "bold", cursor: "pointer" }}
      >
        ← Back to Main Menu   (Be patient, this is a demo, the realtime dabase connection will react instantly!)
      </button>

      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: colors.primary, margin: 0 }}>📋 Inventory & Logistics</h2>
          <button 
            onClick={() => setView("receiving")}
            style={{ padding: "10px 18px", background: colors.primary, color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
          >
            + Receive New Parts
          </button>
        </div>

        {/* QUICK STATS (UPDATED FOR LOCATIONS) */}
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

        {/* SEARCH & FILTER */}
        <div style={{ marginBottom: "20px" }}>
          <input 
            type="text" 
            placeholder="Search by SKU, Description, or PO#..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: `1px solid ${colors.lightGray}`, boxSizing: "border-box" }}
          />
        </div>

        {/* INVENTORY TABLE (AUDITED & COMPLETE) */}
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
                      onClick={() => {
                        setSelectedPo(item.po_ref);
                        setIsDrawerOpen(true);
                      }}
                    >
                      {item.po_ref}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{ fontWeight: "bold", color: item.qty_on_hand < 5 ? colors.warningRed : colors.textDark }}>
                        {item.qty_on_hand}
                      </span>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{ fontWeight: "bold", color: colors.prodIndigo }}>
                        {item.qty_production}
                      </span>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <button 
                        onClick={() => setTransferItem(item)}
                        style={{ 
                          padding: "6px 12px", borderRadius: "6px", border: "none", 
                          backgroundColor: colors.prodIndigo, color: "white", 
                          fontSize: "11px", fontWeight: "bold", cursor: "pointer" 
                        }}
                      >
                        Move ➔
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInventory.length === 0 && (
              <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No matching inventory found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryDashboard;
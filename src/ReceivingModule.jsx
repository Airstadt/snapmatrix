import React, { useState, useEffect } from 'react';

const ReceivingModuleDemo = ({ setView }) => {
  // --- MOCK DATA FOR DEMO ---
  const initialMockPOs = [
    { 
      id: "po_123", 
      poNumber: "PO-5001", 
      vendorName: "B&H Photo", 
      status: "In Transit", 
      lastTrackingNumber: "1Z999AA1012345678",
      items: [
        { sku: "SON-A7S3", description: "Sony A7S III Camera Body", qty: 2, previouslyReceived: 0, unitPrice: 3499.99 },
        { sku: "LEN-2470GM", description: "Sony 24-70mm f/2.8 GM II", qty: 2, previouslyReceived: 1, unitPrice: 2299.99 }
      ]
    },
    { 
      id: "po_456", 
      poNumber: "PO-5002", 
      vendorName: "FilmTools", 
      status: "Pending", 
      lastTrackingNumber: "",
      items: [
        { sku: "GRP-CSTAND", description: "Matthews 40\" C-Stand", qty: 10, previouslyReceived: 0, unitPrice: 185.00 }
      ]
    }
  ];

  // --- STATE MANAGEMENT ---
  const [purchaseOrders, setPurchaseOrders] = useState(initialMockPOs);
  const [selectedPO, setSelectedPO] = useState(null);
  const [receivingItems, setReceivingItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [receivingRef] = useState(`REC-DEMO-${Math.floor(1000 + Math.random() * 9000)}`);

  // --- UI THEME ---
  const colors = {
    primary: "#d97706",
    secondary: "#b45309",
    lightGray: "#e2e8f0",
    textDark: "#1a202c",
    successGreen: "#059669",
    infoBlue: "#2563eb",
    errorRed: "#ef4444",
    sectionBg: "#f8fafc"
  };

  // --- DEMO ACTIONS ---
  const handleSelectPO = (po) => {
    setSelectedPO(po);
    setReceivingItems(po.items.map(item => ({ ...item, receivedNow: 0 })));
    setTrackingNumber(po.lastTrackingNumber || '');
  };

  const handleUpdateTrackingOnly = () => {
    if (!trackingNumber.trim()) return alert("Enter a tracking number for the demo.");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(`✅ [DEMO] Tracking updated to: ${trackingNumber}`);
      setSelectedPO({ ...selectedPO, lastTrackingNumber: trackingNumber, status: "In Transit" });
    }, 800);
  };

  const submitReceiving = () => {
    const hasItems = receivingItems.some(i => i.receivedNow > 0);
    if (!hasItems) return alert("Enter quantities to 'receive' them in the demo.");

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("✅ [DEMO] Receipt confirmed! In the live version, this would add items to your Inventory and update the PO status.");
      setSelectedPO(null);
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Transit': return { bg: "#eff6ff", text: colors.infoBlue };
      case 'Partial': return { bg: "#f3e8ff", text: "#7e22ce" };
      default: return { bg: colors.sectionBg, text: colors.secondary };
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px", borderRadius: "6px", border: `1px solid ${colors.lightGray}`, marginTop: "5px"
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "20px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "20px" }}>
        <div style={{ display: 'inline-block', padding: '4px 12px', background: '#fef3c7', color: '#92400e', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
          DEMO MODE: LOGISTICS
        </div>
        <h2 style={{ color: colors.primary, margin: 0 }}>📦 Logistics & Receiving</h2>
      </header>

      <div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        {!selectedPO ? (
          <div>
            <p style={{ color: "#64748b" }}>Select an incoming shipment to process:</p>
            <div style={{ display: "grid", gap: "10px" }}>
              {purchaseOrders.map(po => {
                const style = getStatusColor(po.status);
                return (
                  <div key={po.id} onClick={() => handleSelectPO(po)} style={{ padding: "15px", border: `1px solid ${colors.lightGray}`, borderRadius: "8px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#f9fafb"} onMouseOut={(e) => e.currentTarget.style.background = "white"}>
                    <div>
                      <strong style={{ fontSize: "16px" }}>{po.poNumber}</strong>
                      <span style={{ margin: "0 10px", color: "#cbd5e1" }}>|</span>
                      <span>{po.vendorName}</span>
                      {po.lastTrackingNumber && <div style={{ fontSize: "12px", color: colors.infoBlue, marginTop: "4px" }}>🚚 {po.lastTrackingNumber}</div>}
                    </div>
                    <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", background: style.bg, color: style.text }}>{po.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            {/* BACK BUTTON */}
            <button onClick={() => setSelectedPO(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginBottom: "20px", padding: 0 }}>← Back to Shipments</button>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px", background: colors.sectionBg, padding: "15px", borderRadius: "8px" }}>
              <span><strong>PO:</strong> {selectedPO.poNumber}</span>
              <span><strong>Vendor:</strong> {selectedPO.vendorName}</span>
            </div>

            {/* TRACKING SECTION */}
            <div style={{ marginBottom: "30px", padding: "20px", border: `2px solid ${colors.infoBlue}`, borderRadius: "8px", background: "#eff6ff" }}>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: colors.infoBlue, display: "block", marginBottom: "10px" }}>SHIPMENT TRACKING</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input style={inputStyle} placeholder="Update Tracking..." value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                <button onClick={handleUpdateTrackingOnly} disabled={loading} style={{ padding: "0 20px", background: colors.infoBlue, color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                   {loading ? "..." : "Update"}
                </button>
              </div>
            </div>

            {/* RECEIVING TABLE */}
            <h4 style={{ borderBottom: `1px solid ${colors.lightGray}`, paddingBottom: "10px" }}>Line Item Receipt</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: "12px", color: "#64748b" }}>
                  <th style={{ padding: "10px 0" }}>SKU / DESCRIPTION</th>
                  <th>ORDERED</th>
                  <th>REC'D TODAY</th>
                </tr>
              </thead>
              <tbody>
                {receivingItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "15px 0" }}>
                      <div style={{ fontWeight: "bold" }}>{item.sku}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{item.description}</div>
                    </td>
                    <td>{item.qty} <span style={{ fontSize: "11px", color: "#94a3b8" }}>({item.previouslyReceived} prev)</span></td>
                    <td>
                      <input 
                        type="number" 
                        style={{ ...inputStyle, width: "70px" }} 
                        value={item.receivedNow} 
                        onChange={(e) => {
                           const newItems = [...receivingItems];
                           newItems[idx].receivedNow = Number(e.target.value);
                           setReceivingItems(newItems);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={submitReceiving} disabled={loading} style={{ width: "100%", marginTop: "30px", padding: "16px", background: colors.successGreen, color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>
              {loading ? "Processing Receipt..." : "Confirm Item Receipt"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivingModuleDemo;
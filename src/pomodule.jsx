import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; 

// --- MOCK DATABASE FOR DEMO MODE ---
// Populated with all fields to demonstrate the "Clicked" state
const DEMO_PURCHASE_ORDERS = {
  "PO-2026-001": {
    poNumber: "PO-2026-001",
    poDate: "2026-03-01",
    vendorName: "Industrial Bearings Co.",
    vendorContact: "123 Industrial Way, Ohio\nSales: (555) 900-1234",
    buyerName: "SnapCopy AI Solutions",
    buyerContact: "ops@snapcopyai.com",
    buyerContactPerson: "Ric Manager",
    paymentTerms: "Net 30",
    deliveryTerms: "FOB Destination",
    currency: "USD",
    shipTo: "Main Warehouse Dock 4\n456 Logistics Lane, NY 10001",
    billTo: "Finance Dept\n789 Corporate Plaza, NY 10001",
    expectedDelivery: "2026-03-25",
    shippingMethod: "LTL Freight",
    deliveryInstructions: "Gate code 1234. High-side dock only.",
    specialInstructions: "Rush order for production line maintenance. Please confirm receipt.",
    shippingCost: 150.00,
    discount: 50.00,
    items: [
      { sku: 'WIDGET-01', description: 'High-Performance Bearing', qty: 50, uom: 'ea', unitPrice: 12.50, total: 625.00, taxCategory: 'Standard', notes: 'Stainless steel grade' }
    ]
  }
};

const POModule = ({ setView, selectedPoNum }) => {
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState(""); 

  const colors = {
    primary: "#d97706",
    secondary: "#b45309",
    lightGray: "#e2e8f0",
    textDark: "#1a202c",
    errorRed: "#e53e3e",
    successGreen: "#38a169",
    sectionBg: "#f8fafc",
    darkBlueBg: "#1e293b" 
  };

  const [poData, setPoData] = useState({
    poNumber: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
    poDate: new Date().toISOString().split('T')[0],
    vendorName: '',
    vendorContact: '',
    buyerName: 'SnapCopy AI Solutions',
    buyerContact: '',
    buyerContactPerson: '',
    paymentTerms: 'Net 30',
    deliveryTerms: 'FOB Destination',
    currency: 'USD',
    shipTo: '',
    billTo: '',
    expectedDelivery: '',
    shippingMethod: 'UPS Ground',
    deliveryInstructions: '',
    specialInstructions: '', 
    shippingCost: 0,
    discount: 0 
  });

  const [items, setItems] = useState([
    { sku: '', description: '', qty: 1, uom: 'ea', unitPrice: 0, total: 0, taxCategory: 'Standard', notes: '' }
  ]);

  // --- RESTORED: SEARCH LOGIC (DEMO VERSION) ---
  const handleSearch = () => {
    const term = searchId.trim() || selectedPoNum;
    if (!term) return alert("Please enter a PO Number");
    
    setLoading(true);
    setTimeout(() => {
      const found = DEMO_PURCHASE_ORDERS[term];
      if (found) {
        setPoData(found);
        setItems(found.items || []);
      } else {
        alert("Demo Record not found. Try searching: PO-2026-001");
      }
      setLoading(false);
    }, 400);
  };

  // Auto-trigger when clicking from Inventory
  useEffect(() => {
    if (selectedPoNum) {
      setSearchId(selectedPoNum);
      const found = DEMO_PURCHASE_ORDERS[selectedPoNum];
      if (found) {
        setPoData(found);
        setItems(found.items || []);
      }
    }
  }, [selectedPoNum]);

  const subtotal = items.reduce((acc, item) => acc + (Number(item.qty) * Number(item.unitPrice)), 0);
  const tax = subtotal * 0.08; 
  const grandTotal = subtotal + tax + Number(poData.shippingCost) - Number(poData.discount);

  const getInputStyle = (isFocused) => ({
    width: "100%",
    padding: "10px",
    marginTop: "4px",
    borderRadius: "6px",
    border: `1px solid ${isFocused ? colors.primary : colors.lightGray}`,
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  });

  const handleAddItem = () => {
    setItems([...items, { sku: '', description: '', qty: 1, uom: 'ea', unitPrice: 0, total: 0, taxCategory: 'Standard', notes: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'qty' || field === 'unitPrice') {
      newItems[index].total = Number(newItems[index].qty || 0) * Number(newItems[index].unitPrice || 0);
    }
    setItems(newItems);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const primaryColor = [217, 119, 6]; 
    const secondaryColor = [71, 85, 105]; 

    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("PURCHASE ORDER", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`PO Number: ${poData.poNumber}`, 140, 15);
    doc.text(`PO Date: ${poData.poDate}`, 140, 20);

    autoTable(doc, {
      startY: 125,
      head: [['SKU', 'Description', 'Qty', 'UOM', 'Unit Price', 'Total']],
      body: items.map(i => [i.sku, i.description, i.qty, i.uom, `$${Number(i.unitPrice).toFixed(2)}`, `$${Number(i.total).toFixed(2)}`]),
      headStyles: { fillColor: primaryColor }
    });

    doc.save(`${poData.poNumber}_DEMO.pdf`);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      generatePDF();
      alert("PO Logged (Demo Mode) & PDF Generated!");
      setLoading(false);
      if(setView) setView("home");
    }, 800);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "20px auto", fontFamily: "sans-serif", color: colors.textDark }}>
      
      {/* SEARCH HEADER */}
      <div style={{ background: colors.darkBlueBg, padding: "20px 30px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <label style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>QUICK SEARCH BY PO #</label>
          <input 
            type="text" 
            placeholder="Enter PO Number..." 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{ background: "transparent", border: "none", borderBottom: "1px solid #334155", color: "white", width: "100%", maxWidth: "600px", padding: "5px 0", outline: "none", fontSize: "16px" }} 
          />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSearch} style={{ background: "#334155", color: "white", border: "1px solid #475569", padding: "10px 25px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Find PO</button>
        </div>
      </div>

      <div style={{ background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `3px solid ${colors.primary}`, paddingBottom: "20px", marginBottom: "30px" }}>
          <div>
            <h1 style={{ margin: 0, color: colors.primary }}>PURCHASE ORDER</h1>
            <p style={{margin: "5px 0 0 0", fontSize: "14px", color: "#64748b"}}>Procurement Management System</p>
          </div>
          <div style={{ display: "flex", gap: "15px" }}>
            <div><label style={{fontSize: "11px", fontWeight: "bold"}}>PO NUMBER</label><input style={getInputStyle()} value={poData.poNumber} onChange={e => setPoData({...poData, poNumber: e.target.value})} /></div>
            <div><label style={{fontSize: "11px", fontWeight: "bold"}}>PO DATE</label><input type="date" style={getInputStyle()} value={poData.poDate} onChange={e => setPoData({...poData, poDate: e.target.value})} /></div>
            <div><label style={{fontSize: "11px", fontWeight: "bold"}}>CURRENCY</label><input style={getInputStyle()} value={poData.currency} onChange={e => setPoData({...poData, currency: e.target.value})} /></div>
          </div>
        </div>

        {/* VENDOR & BUYER SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "30px" }}>
          <div>
            <h4 style={{ color: colors.secondary, borderBottom: "1px solid #eee" }}>Vendor / Supplier</h4>
            <input style={getInputStyle()} placeholder="Supplier Name" value={poData.vendorName} onChange={e => setPoData({...poData, vendorName: e.target.value})} />
            <textarea style={{...getInputStyle(), height: "70px", marginTop: "10px"}} placeholder="Contact Info" value={poData.vendorContact} onChange={e => setPoData({...poData, vendorContact: e.target.value})} />
            <div style={{display: "flex", gap: "10px", marginTop: "10px"}}>
                <input style={getInputStyle()} placeholder="Payment Terms" value={poData.paymentTerms} onChange={e => setPoData({...poData, paymentTerms: e.target.value})} />
                <input style={getInputStyle()} placeholder="Delivery Terms" value={poData.deliveryTerms} onChange={e => setPoData({...poData, deliveryTerms: e.target.value})} />
            </div>
          </div>
          <div>
            <h4 style={{ color: colors.secondary, borderBottom: "1px solid #eee" }}>Buyer / Company</h4>
            <input style={getInputStyle()} value={poData.buyerName} onChange={e => setPoData({...poData, buyerName: e.target.value})} />
            <input style={{...getInputStyle(), marginTop: "10px"}} placeholder="Contact Person" value={poData.buyerContactPerson} onChange={e => setPoData({...poData, buyerContactPerson: e.target.value})} />
            <input style={{...getInputStyle(), marginTop: "10px"}} placeholder="Buyer Email/Phone" value={poData.buyerContact} onChange={e => setPoData({...poData, buyerContact: e.target.value})} />
          </div>
        </div>

        {/* SHIPPING & BILLING ADDRESSES */}
        <div style={{ background: colors.sectionBg, padding: "20px", borderRadius: "8px", marginBottom: "30px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
          <div><label style={{fontSize: "11px", fontWeight: "bold"}}>📍 SHIP TO ADDRESS</label><textarea style={{...getInputStyle(), height: "80px"}} value={poData.shipTo} onChange={e => setPoData({...poData, shipTo: e.target.value})} /></div>
          <div><label style={{fontSize: "11px", fontWeight: "bold"}}>💳 BILL TO ADDRESS</label><textarea style={{...getInputStyle(), height: "80px"}} value={poData.billTo} onChange={e => setPoData({...poData, billTo: e.target.value})} /></div>
          <div>
            <label style={{fontSize: "11px", fontWeight: "bold"}}>SHIPPING METHOD</label>
            <select style={getInputStyle()} value={poData.shippingMethod} onChange={e => setPoData({...poData, shippingMethod: e.target.value})}>
                <option value="UPS Ground">UPS Ground</option>
                <option value="UPS Next Day Air">UPS Next Day Air</option>
                <option value="FedEx Ground">FedEx Ground</option>
                <option value="LTL Freight">LTL Freight</option>
                <option value="Will Call / Pickup">Will Call / Pickup</option>
            </select>
            <label style={{fontSize: "11px", fontWeight: "bold", marginTop: "10px", display: "block"}}>EXP. DELIVERY</label>
            <input type="date" style={getInputStyle()} value={poData.expectedDelivery} onChange={e => setPoData({...poData, expectedDelivery: e.target.value})} />
            <input style={{...getInputStyle(), marginTop: "8px"}} placeholder="Gate code/Dock #" value={poData.deliveryInstructions} onChange={e => setPoData({...poData, deliveryInstructions: e.target.value})} />
          </div>
        </div>

        {/* LINE ITEMS TABLE */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", gap: "8px", fontWeight: "bold", padding: "12px", background: "#f1f5f9", borderRadius: "5px", fontSize: "11px", marginBottom: "10px" }}>
            <div style={{ flex: 1.5 }}>SKU / ITEM #</div><div style={{ flex: 2.5 }}>DESCRIPTION</div><div style={{ flex: 1 }}>QTY</div><div style={{ flex: 1 }}>UOM</div><div style={{ flex: 1 }}>TAX CAT</div><div style={{ flex: 1.2 }}>UNIT PRICE</div><div style={{ flex: 1, textAlign: "right" }}>TOTAL</div><div style={{ width: "30px" }}></div>
          </div>
          {items.map((item, index) => (
            <div key={index} style={{ marginBottom: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input style={{...getInputStyle(), flex: 1.5}} value={item.sku} onChange={e => updateItem(index, 'sku', e.target.value)} />
                <input style={{...getInputStyle(), flex: 2.5}} value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} />
                <input type="number" style={{...getInputStyle(), flex: 1}} value={item.qty} onChange={e => updateItem(index, 'qty', e.target.value)} />
                <input style={{...getInputStyle(), flex: 1}} value={item.uom} onChange={e => updateItem(index, 'uom', e.target.value)} />
                <input style={{...getInputStyle(), flex: 1}} value={item.taxCategory} onChange={e => updateItem(index, 'taxCategory', e.target.value)} />
                <input type="number" style={{...getInputStyle(), flex: 1.2}} value={item.unitPrice} onChange={e => updateItem(index, 'unitPrice', e.target.value)} />
                <div style={{ flex: 1, textAlign: "right", fontWeight: "bold" }}>${Number(item.total).toFixed(2)}</div>
                <button onClick={() => removeItem(index)} style={{ border: "none", background: "none", color: colors.errorRed, cursor: "pointer", fontSize: "20px" }}>×</button>
              </div>
              <input style={{...getInputStyle(), width: "40%", height: "30px", fontSize: "12px"}} placeholder="Item specific notes (optional)" value={item.notes} onChange={e => updateItem(index, 'notes', e.target.value)} />
            </div>
          ))}
          <button onClick={handleAddItem} style={{ marginTop: "10px", padding: "10px 20px", border: `2px dashed ${colors.primary}`, background: "none", color: colors.primary, borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>+ Add New Line Item</button>
        </div>

        {/* TOTALS & FOOTER */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "50px", borderTop: `2px solid ${colors.lightGray}`, paddingTop: "30px" }}>
          <div>
            <label style={{fontSize: "12px", fontWeight: "bold"}}>📝 ADDITIONAL TERMS & SPECIAL INSTRUCTIONS</label>
            <textarea style={{...getInputStyle(), height: "100px", marginTop: "10px"}} value={poData.specialInstructions} onChange={e => setPoData({...poData, specialInstructions: e.target.value})} />
          </div>
          <div style={{ background: colors.sectionBg, padding: "25px", borderRadius: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}><span>Discounts:</span><input type="number" style={{...getInputStyle(), width: "90px", marginTop: 0}} value={poData.discount} onChange={e => setPoData({...poData, discount: e.target.value})} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span>Tax (8%):</span><span>${tax.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}><span>Shipping:</span><input type="number" style={{...getInputStyle(), width: "90px", marginTop: 0}} value={poData.shippingCost} onChange={e => setPoData({...poData, shippingCost: e.target.value})} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", fontWeight: "bold", fontSize: "22px", borderTop: `3px solid ${colors.primary}`, paddingTop: "15px" }}><span>Total:</span><span style={{ color: colors.primary }}>${grandTotal.toFixed(2)}</span></div>
            <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", marginTop: "25px", padding: "18px", background: colors.primary, color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>{loading ? "Processing..." : "Submit & Generate PDF 🧾"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POModule;
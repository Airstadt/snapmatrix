import { useState, useEffect } from "react";

/**
 * REUSABLE UI COMPONENTS (Slightly polished for Demo)
 */
function Section({ title, color, children }) {
  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "15px", borderRadius: "12px", marginBottom: "15px", borderLeft: `4px solid ${color}` }}>
      <h3 style={{ fontSize: "16px", color: color, marginTop: 0, marginBottom: "15px", fontWeight: "700" }}>{title}</h3>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: "12px", flex: 1, minWidth: "200px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "5px" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}

export default function ProductionOnboardingDemo({ setView }) {
  // --- DEMO DATA SEED ---
  const mockClients = [
    { id: 1, clientName: "Netflix", productionName: "Stranger Things S5", clientContact: "Shawn Levy", clientEmail: "s.levy@netflix.com" },
    { id: 2, clientName: "HBO", productionName: "The Last of Us", clientContact: "Craig Mazin", clientEmail: "craig@hbo.com" },
    { id: 3, clientName: "Marvel Studios", productionName: "Avengers: Secret Wars", clientContact: "Kevin Feige", clientEmail: "feige@marvel.com" }
  ];

  // --- STATE: UI TOGGLES ---
  const [showInventoryBottom, setShowInventoryBottom] = useState(false);
  const [inventorySearch, setInventorySearch] = useState(""); 

  // --- STATE: AUTO-COMPLETE ---
  const [filteredClients, setFilteredClients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- STATE: PRODUCTION FIELDS ---
  const [clientName, setClientName] = useState("");
  const [productionName, setProductionName] = useState(""); 
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [productNumber, setProductNumber] = useState("PROD-" + Math.floor(1000 + Math.random() * 9000)); 
  const [jobType, setJobType] = useState("Studio Shoot"); 
  const [productDesc, setProductDesc] = useState(""); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");

  const [productsToOrder, setProductsToOrder] = useState([
    { partName: "", qty: 1, notes: "" }
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- DEMO LOGIC: CLIENT SEARCH ---
  const handleClientNameChange = (val) => {
    setClientName(val);
    if (val.length > 1) {
      const filtered = mockClients.filter(c => 
        c.clientName.toLowerCase().includes(val.toLowerCase()) || 
        c.productionName.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredClients(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectClient = (client) => {
    setClientName(client.clientName);
    setProductionName(client.productionName);
    setClientContact(client.clientContact);
    setClientEmail(client.clientEmail);
    setShowSuggestions(false);
  };

  const addProductRow = () => {
    setProductsToOrder([...productsToOrder, { partName: "", qty: 1, notes: "" }]);
  };

  const updateProductRow = (index, field, value) => {
    const updated = [...productsToOrder];
    updated[index][field] = value;
    setProductsToOrder(updated);
  };

  // --- DEMO LOGIC: SUBMIT ---
  const handleOnboard = () => {
    if (!clientName || !productNumber) {
      setMessage("❌ Error: Client Name and Product Number are required.");
      return;
    }
    setLoading(true);
    
    // Simulate API/Firebase Call
    setTimeout(() => {
      setLoading(false);
      setMessage("✅ [DEMO MODE] Production Client Onboarded Successfully!");
      
      // Reset after a delay
      setTimeout(() => {
        setClientName(""); setProductionName(""); setProductNumber("PROD-" + Math.floor(Math.random() * 9000));
        setProductsToOrder([{ partName: "", qty: 1, notes: "" }]);
        setMessage("");
      }, 2000);
    }, 1500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "40px 20px", fontFamily: "sans-serif" }}>
      
      {/* NAVIGATION DOCK */}
      <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 1000, display: "flex", flexDirection: "column", gap: "10px" }}>
        <button 
          onClick={() => setShowInventoryBottom(!showInventoryBottom)} 
          style={{ padding: "12px 24px", background: "#1e40af", color: "white", border: "none", borderRadius: "50px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 12px rgba(30, 64, 175, 0.3)" }}
        >
          {showInventoryBottom ? "✖ Close Inventory" : "🔍 View Inventory (Demo)"}
        </button>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <header style={{ textAlign: "left", marginBottom: "30px" }}>
          <div style={{ display: 'inline-block', padding: '4px 12px', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>
            DEMO MODE ACTIVE
          </div>
          <h1 style={{ color: "#0f172a", fontSize: "28px", fontWeight: "800", margin: 0 }}>Production Client Onboarding</h1>
          <p style={{ color: "#64748b", marginTop: "5px" }}>Setup new production projects and gear requirements.</p>
        </header>

        <div style={{ background: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", marginBottom: "40px" }}>
          
          <Section title="1. Production & Client Identity" color="#2563eb">
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", position: "relative" }}>
              <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                <InputField 
                  label="Client / Production House" 
                  value={clientName} 
                  onChange={handleClientNameChange} 
                  placeholder="Type 'Net' to see demo search..." 
                />
                {showSuggestions && (
                  <div style={{ position: "absolute", top: "70px", left: 0, width: "100%", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", zIndex: 10, boxShadow: "0 10px 15px rgba(0,0,0,0.1)" }}>
                    {filteredClients.map(client => (
                      <div 
                        key={client.id} 
                        onClick={() => selectClient(client)}
                        style={{ padding: "10px 15px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}
                      >
                        <strong>{client.clientName}</strong> - {client.productionName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <InputField label="Project Title" value={productionName} onChange={setProductionName} placeholder="Project Name" />
            </div>
          </Section>

          <Section title="2. Job Assignment" color="#d97706">
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <InputField label="Company Product #" value={productNumber} onChange={setProductNumber} />
              <div style={{ flex: 1, minWidth: "200px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "5px" }}>Job Type</label>
                <select value={jobType} onChange={(e) => setJobType(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "white" }}>
                  <option value="Studio Shoot">Production Product</option>
                  <option value="Location Rental">Raw Goods</option>
                  <option value="Equipment Lease">Equipment</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="3. Gear List to Order" color="#8b5cf6">
            {productsToOrder.map((prod, idx) => (
              <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                <input 
                  style={{ flex: 2, padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }} 
                  placeholder="e.g. ARRI Alexa 35" 
                  value={prod.partName}
                  onChange={(e) => updateProductRow(idx, "partName", e.target.value)}
                />
                <input 
                  type="number"
                  style={{ flex: 0.5, padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }} 
                  value={prod.qty}
                  onChange={(e) => updateProductRow(idx, "qty", e.target.value)}
                />
                <button 
                  onClick={() => setProductsToOrder(productsToOrder.filter((_, i) => i !== idx))}
                  style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}
                >✕</button>
              </div>
            ))}
            <button onClick={addProductRow} style={{ marginTop: "10px", background: "none", border: "1px dashed #8b5cf6", color: "#8b5cf6", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" }}>
              + Add Item to Order
            </button>
          </Section>

          <button 
            onClick={handleOnboard} 
            disabled={loading} 
            style={{ width: "100%", padding: "16px", background: loading ? "#94a3b8" : "#0f172a", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", transition: '0.2s' }}
          >
            {loading ? "Simulating Database Save..." : "Complete Demo Onboarding"}
          </button>
          
          {message && <div style={{ textAlign: "center", marginTop: "15px", padding: "10px", borderRadius: "8px", background: message.includes("✅") ? "#f0fdf4" : "#fef2f2", color: message.includes("✅") ? "#166534" : "#991b1b", fontWeight: "600" }}>{message}</div>}
        </div>

        {showInventoryBottom && (
          <div style={{ background: "#fff", padding: "20px", borderRadius: "16px", borderTop: "4px solid #1e40af" }}>
             <h2 style={{ color: "#1e40af", margin: 0 }}>Inventory Reference (Demo)</h2>
             <p><em>[Inventory Dashboard would render here in the live version]</em></p>
             <div style={{ background: '#f8fafc', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                Inventory Feed Active
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
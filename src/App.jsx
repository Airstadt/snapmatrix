import { useState, useEffect } from "react";
// --- FIREBASE ADDITIONS ---
import { db } from "./firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// --- COMPONENT HELPERS ---
function Section({ title, color, children }) {
  return (
    <div style={{ backgroundColor: "#f8fafc", padding: "15px", borderRadius: "12px", marginBottom: "15px" }}>
      <h3 style={{ fontSize: "16px", color: color, marginTop: 0, marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function FormField({ flex, minWidth, children }) {
  return <div style={{ flex: flex || "none", minWidth: minWidth || "auto" }}>{children}</div>;
}

function InputField({ label, value, onChange, placeholder, type = "text", getInputStyle }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "10px" }}>
      <label style={{ fontSize: "14px", fontWeight: "600", color: "#4a5568" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={getInputStyle(focused)}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, getInputStyle }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "10px" }}>
      <label style={{ fontSize: "14px", fontWeight: "600", color: "#4a5568" }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...getInputStyle(focused),
          minHeight: "80px",
          resize: "vertical",
          fontFamily: "inherit"
        }}
      />
    </div>
  );
}

export default function App() {
  // --- SEO INJECTION ---
  useEffect(() => {
    document.title = "Client Onboarding Tool | SnapCopy AI";
  }, []);

  // --- STATE ---
  const [jobDate, setJobDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [customerZip, setCustomerZip] = useState("");
  const [companyLocations, setCompanyLocations] = useState("");
  const [jobStartDate, setJobStartDate] = useState("");
  const [jobStartTime, setJobStartTime] = useState("");
  const [jobCompletionDate, setJobCompletionDate] = useState("");
  const [jobCompletionTime, setJobCompletionTime] = useState("");
  const [jobType, setJobType] = useState("");
  const [jobPriority, setJobPriority] = useState("Medium");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [assignedTeam, setAssignedTeam] = useState("");
  const [requiredMaterials, setRequiredMaterials] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const colors = {
    primary: "#d97706",
    secondary: "#b45309",
    lightGray: "#e2e8f0",
    textDark: "#1a202c",
    errorRed: "#e53e3e",
    successGreen: "#38a169",
    sectionBg: "#f8fafc"
  };

  const getInputStyle = (isFocused) => ({
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    borderRadius: "8px",
    border: `1px solid ${isFocused ? colors.primary : colors.lightGray}`,
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s",
    boxShadow: isFocused ? `0 0 0 3px ${colors.primary}33` : "none",
  });

  // --- ACTIONS ---
  const copyToClipboard = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const clearForm = () => {
    setJobDate(""); setCustomerName(""); setCustomerCompany(""); setCustomerEmail("");
    setCustomerPhone(""); setCustomerAddress(""); setCustomerCity(""); setCustomerState("");
    setCustomerZip(""); setCompanyLocations(""); setJobStartDate(""); setJobStartTime("");
    setJobCompletionDate(""); setJobCompletionTime(""); setJobType(""); setJobPriority("Medium");
    setEstimatedHours(""); setEstimatedCost(""); setJobDescription(""); setSpecialInstructions("");
    setAssignedTeam(""); setRequiredMaterials(""); setPaymentTerms(""); setNotes("");
    setOutput(""); setError(""); setCopied(false);
  };

  async function generate() {
    if (!jobDate || !customerName || !customerEmail || !customerAddress || !jobType || !jobDescription) {
      setError("Please fill out all required fields");
      return;
    }

    setError("");
    setLoading(true);

    const payload = {
      mode: "onboarding", jobDate, customerName, customerCompany, customerEmail, customerPhone,
      customerAddress, customerCity, customerState, customerZip, companyLocations, jobStartDate,
      jobStartTime, jobCompletionDate, jobCompletionTime, jobType, jobPriority, estimatedHours,
      estimatedCost, jobDescription, specialInstructions, assignedTeam, requiredMaterials,
      paymentTerms, notes
    };

    try {
      console.log("--- Step 1: Requesting AI Summary from Cloudflare Tunnel ---");
      const response = await fetch("https://api.snapmatrix.org/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Server error from backend");
      
      const aiSummary = data.onboarding || "No result found.";
      setOutput(aiSummary);

      await addDoc(collection(db, "client_onboarding"), {
        ...payload,
        aiSummary: aiSummary,
        createdAt: serverTimestamp()
      });

    } catch (err) {
      if (err.message.includes("permission-denied")) {
        setError("Firebase Error: Check your Firestore Database Rules.");
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Network Error: Could not reach https://api.snapmatrix.org.");
      } else {
        setError(`System Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#f0f2f5", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <header style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ color: colors.primary, fontSize: "32px", fontWeight: "800", margin: 0 }}>Client Onboarding</h1>
          <p style={{ color: "#64748b", marginTop: "10px", marginBottom: "20px" }}>Dispatch & Scheduling Built In</p>
          
          <a 
            href="https://snapcopy.online" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 20px",
              background: "white", 
              color: colors.primary, 
              border: `2px solid ${colors.primary}`, 
              borderRadius: "30px", 
              fontWeight: "bold", 
              fontSize: "14px",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = colors.primary;
              e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.color = colors.primary;
            }}
          >
            <span style={{ marginRight: "8px" }}>🚀</span> 
            Visit SnapCopy AI
          </a>
        </header>

        <div style={{ background: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          
          <Section title="1. 📋 Job Details" color={colors.primary}>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <FormField flex="1" minWidth="200px">
                <InputField label="Job Date" value={jobDate} onChange={setJobDate} type="date" getInputStyle={getInputStyle} />
              </FormField>
              <FormField flex="1" minWidth="200px">
                <InputField label="Job Type" value={jobType} onChange={setJobType} placeholder="e.g. Installation, Repair" getInputStyle={getInputStyle} />
              </FormField>
              <FormField flex="1" minWidth="150px">
                <label style={{ fontSize: "14px", fontWeight: "600", color: "#4a5568" }}>Priority</label>
                <select value={jobPriority} onChange={(e) => setJobPriority(e.target.value)} style={getInputStyle(false)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                </select>
              </FormField>
            </div>
          </Section>

          <Section title="2. 👤 Customer Information" color={colors.primary}>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <FormField flex="1" minWidth="200px">
                <InputField label="Name" value={customerName} onChange={setCustomerName} placeholder="John Doe" getInputStyle={getInputStyle} />
              </FormField>
              <FormField flex="1" minWidth="200px">
                <InputField label="Company" value={customerCompany} onChange={setCustomerCompany} placeholder="ACME Corp" getInputStyle={getInputStyle} />
              </FormField>
            </div>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <FormField flex="1" minWidth="200px">
                <InputField label="Email" value={customerEmail} onChange={setCustomerEmail} type="email" placeholder="john@example.com" getInputStyle={getInputStyle} />
              </FormField>
              <FormField flex="1" minWidth="200px">
                <InputField label="Phone" value={customerPhone} onChange={setCustomerPhone} placeholder="(555) 000-0000" getInputStyle={getInputStyle} />
              </FormField>
            </div>
            <InputField label="Address" value={customerAddress} onChange={setCustomerAddress} placeholder="123 Main St" getInputStyle={getInputStyle} />
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <FormField flex="2"><InputField label="City" value={customerCity} onChange={setCustomerCity} placeholder="Austin" getInputStyle={getInputStyle} /></FormField>
                <FormField flex="1"><InputField label="State" value={customerState} onChange={setCustomerState} placeholder="TX" getInputStyle={getInputStyle} /></FormField>
                <FormField flex="1"><InputField label="Zip" value={customerZip} onChange={setCustomerZip} placeholder="78701" getInputStyle={getInputStyle} /></FormField>
            </div>
          </Section>

          <Section title="3. 📅 Schedule & Logistics" color={colors.primary}>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <FormField flex="1"><InputField label="Start Date" value={jobStartDate} onChange={setJobStartDate} type="date" getInputStyle={getInputStyle} /></FormField>
                <FormField flex="1"><InputField label="Start Time" value={jobStartTime} onChange={setJobStartTime} type="time" getInputStyle={getInputStyle} /></FormField>
            </div>
            <InputField label="Our Office Location" value={companyLocations} onChange={setCompanyLocations} placeholder="Where is the team starting from?" getInputStyle={getInputStyle} />
          </Section>

          <Section title="4. 🔧 Work Details" color={colors.primary}>
            <TextAreaField label="Job Description" value={jobDescription} onChange={setJobDescription} placeholder="What needs to be done?" getInputStyle={getInputStyle} />
            <TextAreaField label="Special Instructions" value={specialInstructions} onChange={setSpecialInstructions} placeholder="Gate codes, parking, etc." getInputStyle={getInputStyle} />
            <InputField label="Assigned Team" value={assignedTeam} onChange={setAssignedTeam} placeholder="Technician names" getInputStyle={getInputStyle} />
          </Section>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={generate} disabled={loading} style={{ flex: 2, padding: "16px", background: colors.primary, color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Generating & Saving..." : "Generate Onboarding Summary"}
            </button>
            <button onClick={clearForm} style={{ flex: 1, padding: "16px", background: "#e2e8f0", color: "#475569", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
              Clear
            </button>
          </div>

          {error && <p style={{ color: colors.errorRed, textAlign: "center", marginTop: "15px", fontWeight: "600" }}>{error}</p>}

          {output && (
            <div style={{ marginTop: "30px", borderTop: "2px solid #f1f5f9", paddingTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: "16px" }}>AI Generated Summary:</h3>
                <button onClick={copyToClipboard} style={{ padding: "6px 12px", background: copied ? colors.successGreen : "#f1f5f9", color: copied ? "white" : colors.textDark, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                  {copied ? "✓ Copied" : "Copy to Clipboard"}
                </button>
              </div>
              <textarea readOnly value={output} style={{ width: "100%", height: "250px", padding: "15px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#fcfcfc", lineHeight: "1.5" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
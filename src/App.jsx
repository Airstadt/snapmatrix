import { useState, useEffect } from "react";
// --- FIREBASE ADDITIONS ---
import { db } from "./firebase"; 
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore"; 
// --- PDF ADDITION ---
import { jsPDF } from "jspdf";

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

// --- DASHBOARD VIEW COMPONENT ---
function DashboardView({ colors }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, "client_onboarding"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsData);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: colors.primary, fontSize: "32px", fontWeight: "800", margin: 0 }}>Onboarding Dashboard</h1>
        <p style={{ color: "#64748b", marginTop: "10px" }}>Database: client_onboarding</p>
      </header>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading Database Records...</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {jobs.map((job) => (
            <div key={job.id} style={{ background: "white", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderLeft: `5px solid ${colors.primary}` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0 }}>{job.customerName} <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "normal" }}>({job.customerCompany || "N/A"})</span></h3>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: colors.primary }}>{job.jobType} - {job.jobPriority}</span>
              </div>
              <p style={{ fontSize: "14px", color: "#475569", margin: "5px 0" }}><strong>Location:</strong> {job.customerAddress}, {job.customerCity} {job.customerState}</p>
              <p style={{ fontSize: "14px", color: "#475569", margin: "5px 0" }}><strong>Schedule:</strong> {job.jobStartDate} at {job.jobStartTime}</p>
              <div style={{ marginTop: "10px", padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px" }}>
                <strong>AI Summary Snippet:</strong> {job.aiSummary?.substring(0, 150)}...
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  // --- DASHBOARD TOGGLE ---
  const [view, setView] = useState("form");

  // --- SEO INJECTION ---
  useEffect(() => {
    document.title = "Client Onboarding Tool | SnapCopy AI";
  }, []);

  // --- STATE (ALL 24 FIELDS RESTORED) ---
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

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let cursorY = 20;

    doc.setFontSize(20);
    doc.setTextColor(217, 119, 6); 
    doc.text("Onboarding Brief", margin, cursorY);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    cursorY += 10;
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, cursorY);

    cursorY += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, cursorY, 190, cursorY);

    cursorY += 15;
    doc.setFontSize(14);
    doc.setTextColor(26, 32, 44);
    doc.text("Customer Information", margin, cursorY);
    
    doc.setFontSize(11);
    cursorY += 8;
    doc.text(`Client: ${customerName} (${customerCompany || "N/A"})`, margin, cursorY);
    cursorY += 6;
    doc.text(`Email: ${customerEmail}`, margin, cursorY);
    cursorY += 6;
    doc.text(`Job Type: ${jobType} | Priority: ${jobPriority}`, margin, cursorY);

    cursorY += 15;
    doc.setFontSize(14);
    doc.text("Work Summary & Instructions", margin, cursorY);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    cursorY += 8;
    
    // --- STRIP MAP LINKS FROM PDF ONLY ---
    const cleanOutput = output
      .split('\n')
      .filter(line => !line.toLowerCase().includes('google.com/maps') && !line.toLowerCase().includes('directions:'))
      .join('\n');

    const splitText = doc.splitTextToSize(cleanOutput, 170);
    doc.text(splitText, margin, cursorY);

    doc.save(`Onboarding_${customerName.replace(/\s+/g, '_')}.pdf`);
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
      const response = await fetch("https://api.snapmatrix.org/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Server error");
      const aiSummary = data.onboarding || "No result found.";
      setOutput(aiSummary);

      await addDoc(collection(db, "client_onboarding"), {
        ...payload,
        aiSummary: aiSummary,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      setError(`System Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#f0f2f5", padding: "40px 20px", fontFamily: "sans-serif" }}>
      
      {/* --- DASHBOARD TOGGLE BUTTON --- */}
      <button 
        onClick={() => setView(view === "form" ? "dash" : "form")}
        style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 1000, padding: "12px 24px", background: colors.primary, color: "white", border: "none", borderRadius: "50px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
      >
        {view === "form" ? "📊 View Dashboard" : "📝 Back to Form"}
      </button>

      {view === "form" ? (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          
          <header style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1 style={{ color: colors.primary, fontSize: "32px", fontWeight: "800", margin: 0 }}>Client Onboarding</h1>
            <p style={{ color: "#64748b", marginTop: "10px", marginBottom: "20px" }}>Dispatch & Scheduling Built In</p>
            <a href="https://snapcopy.online" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", padding: "8px 20px", background: "white", color: colors.primary, border: `2px solid ${colors.primary}`, borderRadius: "30px", fontWeight: "bold", fontSize: "14px", textDecoration: "none" }}>
              <span style={{ marginRight: "8px" }}>🚀</span> Visit SnapCopy AI
            </a>
          </header>

          <div style={{ background: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
            
            <Section title="1. 📋 Job Details" color={colors.primary}>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <FormField flex="1" minWidth="200px"><InputField label="Job Date" value={jobDate} onChange={setJobDate} type="date" getInputStyle={getInputStyle} /></FormField>
                <FormField flex="1" minWidth="200px"><InputField label="Job Type" value={jobType} onChange={setJobType} placeholder="e.g. Installation, Repair" getInputStyle={getInputStyle} /></FormField>
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
                <FormField flex="1" minWidth="200px"><InputField label="Name" value={customerName} onChange={setCustomerName} placeholder="John Doe" getInputStyle={getInputStyle} /></FormField>
                <FormField flex="1" minWidth="200px"><InputField label="Company" value={customerCompany} onChange={setCustomerCompany} placeholder="ACME Corp" getInputStyle={getInputStyle} /></FormField>
              </div>
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <FormField flex="1" minWidth="200px"><InputField label="Email" value={customerEmail} onChange={setCustomerEmail} type="email" placeholder="john@example.com" getInputStyle={getInputStyle} /></FormField>
                <FormField flex="1" minWidth="200px"><InputField label="Phone" value={customerPhone} onChange={setCustomerPhone} placeholder="(555) 000-0000" getInputStyle={getInputStyle} /></FormField>
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
                  <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={generatePDF} style={{ padding: "6px 12px", background: colors.primary, color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>📥 Download PDF Brief</button>
                      <button onClick={copyToClipboard} style={{ padding: "6px 12px", background: copied ? colors.successGreen : "#f1f5f9", color: copied ? "white" : colors.textDark, border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>{copied ? "✓ Copied" : "Copy to Clipboard"}</button>
                  </div>
                </div>
                <textarea readOnly value={output} style={{ width: "100%", height: "250px", padding: "15px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#fcfcfc", lineHeight: "1.5" }} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <DashboardView colors={colors} />
      )}
    </div>
  );
}
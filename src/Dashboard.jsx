import React, { useEffect, useState } from "react";

// --- MOCK DATA (Matching your Scheduling Calendar) ---
const DEMO_JOBS = [
  {
    id: "c1",
    customerName: "Quantum Systems",
    customerCompany: "Quantum Tech Group",
    customerEmail: "ops@quantumsystems.io",
    customerPhone: "555-0122",
    customerAddress: "404 Innovation Way",
    customerCity: "Tech City",
    customerState: "CA",
    customerZip: "94025",
    jobType: "Network Install",
    jobPriority: "High",
    assignedTeam: "Alex Rivera",
    jobDescription: "Full rack installation and fiber termination.",
    specialInstructions: "Requires badge access after 5 PM.",
    notes: "Client is very specific about cable management."
  },
  {
    id: "c2",
    customerName: "Skyline Realty",
    customerCompany: "Skyline Property Mgmt",
    customerEmail: "info@skylinerealty.com",
    customerPhone: "555-0988",
    customerAddress: "1200 Horizon Blvd",
    customerCity: "Cloud City",
    customerState: "NY",
    customerZip: "10001",
    jobType: "Maintenance",
    jobPriority: "Medium",
    assignedTeam: "Alex Rivera",
    jobDescription: "Quarterly security camera audit.",
    specialInstructions: "Bring a 12ft ladder.",
    notes: "Last tech noted the DVR is running hot."
  },
  {
    id: "c3",
    customerName: "Apex Manufacturing",
    customerCompany: "Apex Industrial",
    customerEmail: "maintenance@apex.com",
    customerPhone: "555-4433",
    customerAddress: "77 Factory Lane",
    customerCity: "Industrial Park",
    customerState: "OH",
    customerZip: "44101",
    jobType: "Repair",
    jobPriority: "Urgent",
    assignedTeam: "Jordan Smith",
    jobDescription: "Main conveyor sensor failure.",
    specialInstructions: "Check-in at Gate 4 security.",
    notes: "Production is down until this is fixed."
  }
];

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [isDemo] = useState(true); // Always true for this version
  
  const [editingJob, setEditingJob] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const colors = {
    primary: "#d97706",
    secondary: "#b45309",
    lightGray: "#e2e8f0",
    textDark: "#1a202c",
    textMuted: "#64748b",
    success: "#059669",
    danger: "#e53e3e"
  };

  const fetchJobs = () => {
    setLoading(true);
    // Simulating a database fetch delay
    setTimeout(() => {
      setJobs(DEMO_JOBS);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdate = () => {
    if (!editingJob) return;
    setIsSaving(true);
    
    // Simulating the updateDoc process locally
    setTimeout(() => {
      setJobs(prev => prev.map(j => j.id === editingJob.id ? editingJob : j));
      setIsSaving(false);
      setEditingJob(null);
      alert("Demo Mode: Record updated in local state!");
    }, 1000);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesPriority = filterPriority === "All" || job.jobPriority === filterPriority;
    const searchStr = (job.customerName + (job.customerAddress || "") + (job.customerCompany || "")).toLowerCase();
    return matchesPriority && searchStr.includes(searchTerm.toLowerCase());
  });

  // --- EDITOR VIEW ---
  if (editingJob) {
    return (
      <div style={{ padding: "20px", maxWidth: "1000px", margin: "20px auto", background: "white", borderRadius: "20px", boxShadow: "0 20px 25px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #f1f5f9", paddingBottom: "15px" }}>
          <h2 style={{ color: colors.primary, margin: 0 }}>Editing: {editingJob.customerName}</h2>
          <button onClick={() => setEditingJob(null)} style={{ background: "#f1f5f9", border: "none", padding: "10px 15px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>👤 Customer Contact</legend>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={editingJob.customerName || ""} onChange={(e) => setEditingJob({...editingJob, customerName: e.target.value})} />
            <label style={labelStyle}>Company</label>
            <input style={inputStyle} value={editingJob.customerCompany || ""} onChange={(e) => setEditingJob({...editingJob, customerCompany: e.target.value})} />
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={editingJob.customerEmail || ""} onChange={(e) => setEditingJob({...editingJob, customerEmail: e.target.value})} />
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={editingJob.customerPhone || ""} onChange={(e) => setEditingJob({...editingJob, customerPhone: e.target.value})} />
          </fieldset>

          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>📍 Location Details</legend>
            <label style={labelStyle}>Street Address</label>
            <input style={inputStyle} value={editingJob.customerAddress || ""} onChange={(e) => setEditingJob({...editingJob, customerAddress: e.target.value})} />
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 2 }}><label style={labelStyle}>City</label><input style={inputStyle} value={editingJob.customerCity || ""} onChange={(e) => setEditingJob({...editingJob, customerCity: e.target.value})} /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>ST</label><input style={inputStyle} value={editingJob.customerState || ""} onChange={(e) => setEditingJob({...editingJob, customerState: e.target.value})} /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Zip</label><input style={inputStyle} value={editingJob.customerZip || ""} onChange={(e) => setEditingJob({...editingJob, customerZip: e.target.value})} /></div>
            </div>
          </fieldset>

          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>📅 Job Specs</legend>
            <label style={labelStyle}>Job Type</label>
            <input style={inputStyle} value={editingJob.jobType || ""} onChange={(e) => setEditingJob({...editingJob, jobType: e.target.value})} />
            <label style={labelStyle}>Priority</label>
            <select style={inputStyle} value={editingJob.jobPriority || "Medium"} onChange={(e) => setEditingJob({...editingJob, jobPriority: e.target.value})}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
            <label style={labelStyle}>Assigned Team</label>
            <input style={inputStyle} value={editingJob.assignedTeam || ""} onChange={(e) => setEditingJob({...editingJob, assignedTeam: e.target.value})} />
          </fieldset>

          <fieldset style={{ ...fieldsetStyle, gridColumn: "span 1" }}>
            <legend style={legendStyle}>📝 Work Details</legend>
            <label style={labelStyle}>Job Description</label>
            <textarea style={{ ...inputStyle, height: "80px" }} value={editingJob.jobDescription || ""} onChange={(e) => setEditingJob({...editingJob, jobDescription: e.target.value})} />
            <label style={labelStyle}>Internal Notes</label>
            <textarea style={{ ...inputStyle, height: "60px" }} value={editingJob.notes || ""} onChange={(e) => setEditingJob({...editingJob, notes: e.target.value})} />
          </fieldset>
        </div>

        <div style={{ marginTop: "30px", display: "flex", gap: "15px" }}>
          <button onClick={handleUpdate} disabled={isSaving} style={{ flex: 2, padding: "16px", background: colors.success, color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
            {isSaving ? "Simulating Update..." : "💾 Update Demo Records"}
          </button>
          <button onClick={() => setEditingJob(null)} style={{ flex: 1, padding: "16px", background: "#64748b", color: "white", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
            Discard Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", background: "#f0f2f5", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* DEMO ALERT */}
      <div style={{ maxWidth: "1000px", margin: "0 auto 20px auto", background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", padding: "12px", borderRadius: "10px", textAlign: "center", fontWeight: "bold", fontSize: "14px" }}>
        🚀 DEMO MODE: Showing customers from your Schedule Grid. Changes are session-based only.
      </div>

      <h1 style={{ textAlign: "center", color: colors.primary, marginBottom: "30px" }}>Client Onboarding Dashboard</h1>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "15px", marginBottom: "30px", display: "flex", gap: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <input style={{ flex: 2, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} placeholder="Search name, company, or address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <select style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {loading ? <p style={{ textAlign: "center" }}>Loading records...</p> : (
          <div style={{ display: "grid", gap: "20px" }}>
            {filteredJobs.map(job => (
              <div key={job.id} style={{ background: "white", padding: "25px", borderRadius: "15px", borderLeft: `10px solid ${job.jobPriority === 'Urgent' ? colors.danger : colors.primary}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                    <h3 style={{ margin: 0 }}>{job.customerName}</h3>
                    <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", color: colors.textMuted }}>{job.jobType}</span>
                  </div>
                  <p style={{ margin: "2px 0", color: colors.textMuted, fontSize: "14px" }}><strong>{job.customerCompany}</strong> • {job.customerEmail}</p>
                  <p style={{ margin: "2px 0", color: colors.textDark, fontSize: "14px" }}>📍 {job.customerAddress}, {job.customerCity}</p>
                  <p style={{ margin: "5px 0", fontSize: "13px", color: colors.secondary }}><strong>Team Assigned:</strong> {job.assignedTeam || "TBD"}</p>
                </div>
                <div style={{ textAlign: "right", minWidth: "150px" }}>
                  <div style={{ marginBottom: "15px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "bold", color: job.jobPriority === 'Urgent' ? colors.danger : colors.primary }}>
                      {job.jobPriority?.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <button onClick={() => setEditingJob(job)} style={{ padding: "10px 18px", background: colors.primary, color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                    ✏️ Edit Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const fieldsetStyle = { border: "1px solid #e2e8f0", borderRadius: "12px", padding: "15px", marginBottom: "10px" };
const legendStyle = { fontWeight: "bold", fontSize: "14px", color: "#d97706", padding: "0 10px" };
const labelStyle = { display: "block", fontSize: "11px", fontWeight: "bold", color: "#64748b", marginTop: "10px", textTransform: "uppercase" };
const inputStyle = { width: "100%", padding: "10px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box", outline: "none" };
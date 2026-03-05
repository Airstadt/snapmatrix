import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

// MAKE SURE THIS NAME MATCHES THE IMPORT IN APP.JSX
export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");

  const colors = {
    primary: "#d97706",
    lightGray: "#e2e8f0"
  };

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

  // Filtering Logic
  const filteredJobs = jobs.filter(job => {
    const matchesPriority = filterPriority === "All" || job.jobPriority === filterPriority;
    const address = job.customerAddress || "";
    const matchesAddress = address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesAddress;
  });

  return (
    <div style={{ padding: "40px", background: "#f0f2f5", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", color: colors.primary }}>Onboarding Dashboard</h1>

      {/* --- FILTER SECTION --- */}
      <div style={{ 
        background: "white", padding: "20px", borderRadius: "15px", marginBottom: "20px", 
        border: "3px solid #d97706", display: "flex", gap: "20px" 
      }}>
        <div style={{ flex: 2 }}>
          <label style={{ fontWeight: "bold", fontSize: "12px" }}>🔍 ADDRESS SEARCH</label>
          <input 
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} 
            placeholder="Search street..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: "bold", fontSize: "12px" }}>⚡ PRIORITY</label>
          <select 
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {loading ? <p>Loading Data...</p> : (
        <div style={{ display: "grid", gap: "20px" }}>
          {filteredJobs.map(job => (
            <div key={job.id} style={{ background: "white", padding: "20px", borderRadius: "15px", borderLeft: "8px solid #d97706" }}>
              <h3>{job.customerName} <span style={{fontSize: '12px', color: '#64748b'}}>({job.customerCompany})</span></h3>
              <p><strong>Address:</strong> {job.customerAddress}</p>
              <p><strong>Priority:</strong> {job.jobPriority}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
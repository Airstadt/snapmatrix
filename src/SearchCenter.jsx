import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

export default function SearchCenter() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, "client_onboarding"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsData);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchJobs();
  }, []);

  const filtered = jobs.filter(j => {
    const matchP = filterPriority === "All" || j.jobPriority === filterPriority;
    const matchA = (j.customerAddress || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchP && matchA;
  });

  return (
    <div style={{ padding: "40px", background: "#ffffff", minHeight: "100vh", fontFamily: 'sans-serif' }}>
      <h1 style={{ color: "#d97706" }}>🔍 Job Search Center</h1>
      
      <div style={{ border: "2px solid #000", padding: "20px", marginBottom: "30px", borderRadius: "10px" }}>
        <h3>Filter Controls</h3>
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <label>Street Address:</label>
            <input 
              style={{ width: "100%", padding: "12px", fontSize: "16px" }} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search by street..."
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Priority:</label>
            <select 
              style={{ width: "100%", padding: "12px", fontSize: "16px" }} 
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
      </div>

      {loading ? <p>Loading...</p> : (
        <div>
          <p>Showing {filtered.length} results</p>
          {filtered.map(job => (
            <div key={job.id} style={{ borderBottom: "1px solid #ccc", padding: "15px 0" }}>
              <strong>{job.customerName}</strong> - {job.jobPriority} <br />
              <span>{job.customerAddress}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
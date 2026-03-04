import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const colors = {
    primary: "#d97706",
    textDark: "#1a202c",
    lightGray: "#e2e8f0",
    sectionBg: "#f8fafc"
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, "client_onboarding"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <header style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ color: colors.primary, fontSize: "32px", fontWeight: "800", margin: 0 }}>Onboarding Dashboard</h1>
          <p style={{ color: "#64748b", marginTop: "10px" }}>Active Job Briefs & Client Data</p>
        </header>

        {loading ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>Loading jobs...</p>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {jobs.map((job) => (
              <div key={job.id} style={{ 
                background: "white", 
                padding: "25px", 
                borderRadius: "20px", 
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                borderLeft: `6px solid ${job.jobPriority === 'High' || job.jobPriority === 'Urgent' ? '#e53e3e' : colors.primary}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", color: colors.textDark }}>{job.customerName}</h2>
                    <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>{job.customerCompany || "No Company"}</p>
                  </div>
                  <span style={{ 
                    padding: "4px 12px", 
                    borderRadius: "20px", 
                    background: colors.sectionBg, 
                    fontSize: "12px", 
                    fontWeight: "bold",
                    color: colors.primary,
                    border: `1px solid ${colors.lightGray}`
                  }}>
                    {job.jobType}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", fontSize: "14px" }}>
                  <div>
                    <strong>📍 Address:</strong>
                    <p style={{ margin: "5px 0", color: "#4a5568" }}>{job.customerAddress}, {job.customerCity}</p>
                  </div>
                  <div>
                    <strong>📅 Schedule:</strong>
                    <p style={{ margin: "5px 0", color: "#4a5568" }}>Starts: {job.jobStartDate} @ {job.jobStartTime}</p>
                  </div>
                  <div>
                    <strong>👥 Assigned:</strong>
                    <p style={{ margin: "5px 0", color: "#4a5568" }}>{job.assignedTeam || "Unassigned"}</p>
                  </div>
                </div>

                <div style={{ marginTop: "15px", padding: "12px", background: "#f1f5f9", borderRadius: "8px" }}>
                  <strong style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>AI Summary Snippet:</strong>
                  <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#334155", fontStyle: "italic" }}>
                    {job.aiSummary ? job.aiSummary.substring(0, 150) + "..." : "No summary generated."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
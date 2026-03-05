import React, { useEffect, useState, useMemo } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(
          collection(db, "client_onboarding"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setJobs(jobsData);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // ✅ Optimized Filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const priority = (j.jobPriority || "").trim().toLowerCase();
      const address = (j.customerAddress || "").toLowerCase();

      const matchPriority =
        filterPriority === "All" ||
        priority === filterPriority.toLowerCase();

      const matchAddress =
        address.includes(searchTerm.toLowerCase());

      return matchPriority && matchAddress;
    });
  }, [jobs, filterPriority, searchTerm]);

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#f4f6f9",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "30px",
          color: "#d97706",
        }}
      >
        Onboarding Dashboard
      </h1>

      {/* ✅ FILTER SECTION */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        {/* Address Filter */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "6px", fontWeight: "bold" }}>
            Search by Address
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter street name..."
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Priority Filter */}
        <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "6px", fontWeight: "bold" }}>
            Filter by Priority
          </label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "14px",
              backgroundColor: "white",
            }}
          >
            <option value="All">All</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* JOB LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredJobs.length === 0 ? (
        <p>No jobs match your filters.</p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "12px",
                borderLeft: "6px solid #d97706",
                boxShadow: "0 3px 8px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0" }}>
                {job.customerName || "Unnamed Client"}{" "}
                <span style={{ color: "#dc2626" }}>
                  ({job.jobPriority || "No Priority"})
                </span>
              </h3>

              <p style={{ margin: "4px 0" }}>
                <strong>Address:</strong>{" "}
                {job.customerAddress || "No address provided"}
              </p>

              {job.aiSummary && (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "13px",
                    fontStyle: "italic",
                    color: "#555",
                  }}
                >
                  {job.aiSummary.substring(0, 120)}...
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
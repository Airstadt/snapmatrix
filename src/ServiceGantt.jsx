import React, { useState, useEffect } from "react";

// Note: All Firebase/Database imports have been stripped.
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 18;

// --- TIME CALCULATION ENGINE ---
const getMinutesFromStart = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60 + minutes) - (WORK_START_HOUR * 60);
};

const calculatePosition = (startTime) => {
  const totalMinutesInDay = (WORK_END_HOUR - WORK_START_HOUR) * 60;
  return (getMinutesFromStart(startTime) / totalMinutesInDay) * 100;
};

const calculateWidth = (startTime, endTime) => {
  const totalMinutesInDay = (WORK_END_HOUR - WORK_START_HOUR) * 60;
  const duration = getMinutesFromStart(endTime) - getMinutesFromStart(startTime);
  return (duration / totalMinutesInDay) * 100;
};

export default function ServiceGantt({ setView }) {
  const [activeSchedule, setActiveSchedule] = useState([]); 
  const [allClients, setAllClients] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingClient, setEditingClient] = useState(null); 

  // --- MOCK DATA FOR DEMO ---
  const mockTechs = [
    { id: "t1", techName: "Alex Rivera", scheduleDocId: "t1", jobs: [
        { jobId: "c1", clientName: "Quantum Systems", startTime: "08:30", endTime: "10:30", date: new Date().toISOString().split('T')[0] },
        { jobId: "c2", clientName: "Skyline Realty", startTime: "13:00", endTime: "15:00", date: new Date().toISOString().split('T')[0] }
    ]},
    { id: "t2", techName: "Jordan Smith", scheduleDocId: "t2", jobs: [
        { jobId: "c3", clientName: "Apex Manufacturing", startTime: "09:00", endTime: "12:00", date: new Date().toISOString().split('T')[0] }
    ]},
    { id: "t3", techName: "Sarah Chen", scheduleDocId: "t3", jobs: [] },
    { id: "t4", techName: "Mike Voltz", scheduleDocId: "t4", jobs: [] }
  ];

  const mockClients = [
    { id: "c1", customerName: "Quantum Systems", jobType: "Network Install", assignedTeam: "Alex Rivera", startDate: currentDate, startTime: "08:30", stopTime: "10:30" },
    { id: "c2", customerName: "Skyline Realty", jobType: "Maintenance", assignedTeam: "Alex Rivera", startDate: currentDate, startTime: "13:00", stopTime: "15:00" },
    { id: "c3", customerName: "Apex Manufacturing", jobType: "Repair", assignedTeam: "Jordan Smith", startDate: currentDate, startTime: "09:00", stopTime: "12:00" },
    { id: "c4", customerName: "Riverside Clinic", jobType: "Urgent Diagnostic", assignedTeam: null },
    { id: "c5", customerName: "Nova Corp", jobType: "Calibration", assignedTeam: null },
    { id: "c6", customerName: "Standard Bank", jobType: "Safety Audit", assignedTeam: null }
  ];

  const timeSlots = [];
  for (let h = WORK_START_HOUR; h <= WORK_END_HOUR; h++) {
    timeSlots.push(`${h}:00`, `${h}:30`);
  }

  // --- LOCAL DATA LOAD ---
  useEffect(() => {
    setActiveSchedule(mockTechs);
    setAllClients(mockClients);
  }, [currentDate]);

  // --- LOCAL HANDLERS ---
  const handleRemoveFromSchedule = () => {
    if (!window.confirm("Remove this client from the schedule?")) return;
    const { id } = editingClient;
    setActiveSchedule(prev => prev.map(t => ({...t, jobs: t.jobs.filter(j => j.jobId !== id)})));
    setAllClients(prev => prev.map(c => c.id === id ? {...c, assignedTeam: null} : c));
    setEditingClient(null);
  };

  const handleManualSave = (e) => {
    if (e) e.preventDefault();
    const { id, customerName, assignedTeam, startTime, stopTime, startDate } = editingClient;
    const finalDate = startDate || currentDate;
    setActiveSchedule(prev => prev.map(t => {
        const cleanJobs = t.jobs.filter(j => j.jobId !== id);
        if (t.techName === assignedTeam) {
            return { ...t, jobs: [...cleanJobs, { jobId: id, clientName: customerName, startTime, endTime: stopTime, date: finalDate }] };
        }
        return { ...t, jobs: cleanJobs };
    }));
    setEditingClient(null);
  };

  const handleDragStart = (e, client) => {
    e.dataTransfer.setData("clientId", client.id || client.jobId);
    e.dataTransfer.setData("clientName", client.customerName || client.clientName);
  };

  const handleDrop = (e, tech) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData("clientId");
    const clientName = e.dataTransfer.getData("clientName");
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dropMinutes = (x / rect.width) * ((WORK_END_HOUR - WORK_START_HOUR) * 60);
    const hour = Math.floor(dropMinutes / 60) + WORK_START_HOUR;
    const min = Math.round((dropMinutes % 60) / 15) * 15;
    const startTime = `${hour}:${min === 0 ? "00" : min.toString().padStart(2, '0')}`;
    const stopTime = `${hour + 2}:${min === 0 ? "00" : min.toString().padStart(2, '0')}`;

    setActiveSchedule(prev => prev.map(t => {
        const filtered = t.jobs.filter(j => j.jobId !== clientId);
        if (t.id === tech.id) {
            return { ...t, jobs: [...filtered, { jobId: clientId, clientName, startTime, endTime: stopTime, date: currentDate }] };
        }
        return { ...t, jobs: filtered };
    }));
    setAllClients(prev => prev.map(c => c.id === clientId ? { ...c, assignedTeam: tech.techName, startDate: currentDate, startTime, stopTime } : c));
  };

  return (
    <div style={{ backgroundColor: "#f1f5f9", height: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
      
      {/* Banner is preserved, but the "Go Live" button is removed */}
      <div style={{ background: "#2563eb", color: "white", padding: "8px 25px", fontSize: "12px", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <span>🚀 DEMO MODE: Date changes will refresh the grid. Drag jobs to any time/date.</span>
      </div>

      <header style={{ padding: "12px 25px", background: "white", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button onClick={() => setView("home")} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}>← Dashboard</button>
          <h2 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: "800" }}>SERVICE DISPATCHER</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", padding: "5px 15px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
          <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d.toISOString().split('T')[0]); }} style={{ border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}>◀</button>
          <span style={{ fontWeight: "700", fontSize: "14px", color: "#334155" }}>{currentDate}</span>
          <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d.toISOString().split('T')[0]); }} style={{ border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}>▶</button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
        <div style={{ minWidth: "1300px", background: "white", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ display: "flex", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ width: "220px", padding: "15px", fontWeight: "800", color: "#64748b", fontSize: "12px" }}>TECHNICIAN</div>
            {timeSlots.map(t => <div key={t} style={{ flex: 1, textAlign: "center", fontSize: "10px", padding: "15px 0", color: "#94a3b8", borderLeft: "1px solid #f1f5f9" }}>{t.endsWith(":00") ? t : ""}</div>)}
          </div>

          {activeSchedule.map(tech => (
            <div key={tech.id} style={{ display: "flex", borderBottom: "1px solid #f1f5f9", minHeight: "95px" }}>
              <div style={{ width: "220px", padding: "20px", fontWeight: "700", borderRight: "1px solid #f1f5f9", display: "flex", alignItems: "center", background: "#fff" }}>{tech.techName}</div>
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, tech)} style={{ flex: 1, position: "relative", background: "repeating-linear-gradient(90deg, transparent, transparent calc(10% - 1px), #f8fafc 10%)" }}>
                {tech.jobs?.filter(j => j.date === currentDate).map((job, idx) => (
                  <div key={idx} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, job)}
                    onClick={() => setEditingClient(allClients.find(c => c.id === job.jobId) || {id: job.jobId, customerName: job.clientName, assignedTeam: tech.techName, startTime: job.startTime, stopTime: job.endTime})} 
                    style={{ position: "absolute", left: `${calculatePosition(job.startTime)}%`, width: `${calculateWidth(job.startTime, job.endTime)}%`, top: "15%", height: "70%", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", borderRadius: "8px", padding: "10px", fontSize: "11px", boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)", cursor: "grab", zIndex: 10 }}>
                    <div style={{ fontWeight: "800" }}>{job.clientName}</div>
                    <div style={{ fontSize: "9px", opacity: 0.9 }}>{job.startTime} - {job.endTime}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: "200px", background: "white", borderTop: "2px solid #3b82f6", padding: "20px" }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: "11px", color: "#64748b", fontWeight: "800" }}>CLIENT LEDGER</h4>
        <div style={{ display: "flex", gap: "15px", overflowX: "auto", paddingBottom: "15px" }}>
          {allClients.map(client => {
            const isLive = client.assignedTeam && client.startDate === currentDate;
            return (
              <div key={client.id} draggable onDragStart={(e) => handleDragStart(e, client)} onClick={() => setEditingClient({...client})}
                style={{ minWidth: "220px", background: isLive ? "#ecfdf5" : "#ffffff", padding: "15px", borderRadius: "12px", border: isLive ? "2px solid #10b981" : "1px solid #e2e8f0", cursor: "grab", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "800", fontSize: "14px", color: isLive ? "#065f46" : "#1e293b" }}>{client.customerName}</span>
                  {isLive && <span style={{ background: "#10b981", color: "white", fontSize: "8px", padding: "2px 5px", borderRadius: "10px" }}>LIVE</span>}
                </div>
                <div style={{ fontSize: "11px", color: isLive ? "#047857" : "#64748b", marginTop: "4px" }}>{isLive ? `Tech: ${client.assignedTeam}` : client.jobType}</div>
              </div>
            );
          })}
        </div>
      </div>

      {editingClient && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={() => setEditingClient(null)} style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)" }} />
          <div style={{ position: "relative", width: "450px", background: "white", padding: "30px", borderRadius: "20px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Edit Assignment</h3>
                <button type="button" onClick={handleRemoveFromSchedule} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Delete Job</button>
            </div>
            <form onSubmit={handleManualSave}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "11px", fontWeight: "bold" }}>TECHNICIAN</label>
                <select style={{ width: "100%", padding: "12px", marginTop: "5px", borderRadius: "8px", border: "1px solid #cbd5e1" }} 
                  value={editingClient.assignedTeam || ""} 
                  onChange={(e) => setEditingClient({...editingClient, assignedTeam: e.target.value})}>
                  <option value="">Unassigned</option>
                  {activeSchedule.map(t => <option key={t.id} value={t.techName}>{t.techName}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "11px", fontWeight: "bold" }}>START</label>
                  <input type="time" style={{ width: "100%", padding: "12px", marginTop: "5px", borderRadius: "8px", border: "1px solid #cbd5e1" }} 
                    value={editingClient.startTime || ""} onChange={(e) => setEditingClient({...editingClient, startTime: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "11px", fontWeight: "bold" }}>END</label>
                  <input type="time" style={{ width: "100%", padding: "12px", marginTop: "5px", borderRadius: "8px", border: "1px solid #cbd5e1" }} 
                    value={editingClient.stopTime || ""} onChange={(e) => setEditingClient({...editingClient, stopTime: e.target.value})} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{ flex: 2, background: "#3b82f6", color: "white", padding: "14px", borderRadius: "10px", border: "none", fontWeight: "bold", cursor: "pointer" }}>Update Schedule</button>
                <button type="button" onClick={() => setEditingClient(null)} style={{ flex: 1, background: "#f1f5f9", padding: "14px", borderRadius: "10px", border: "none", cursor: "pointer" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
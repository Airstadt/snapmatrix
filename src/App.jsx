import React, { useState, Suspense, lazy } from "react";
// Standard imports
import ServiceClientOnboarding from "./ServiceClientOnboarding"; 
import ProductionOnboarding from "./ProductionOnboarding";
import InventoryDashboard from "./InventoryDashboard";
import ReceivingModule from "./ReceivingModule"; 
import Dashboard from "./Dashboard"; 
import ManufacturedProductRecord from "./ManufacturedProductRecord"; 
// NEW MODULE IMPORT
import ServiceGantt from "./ServiceGantt";

const POModule = lazy(() => import("./pomodule"));

export default function App() {
  const [view, setView] = useState("home");

  const colors = {
    bg: "#f1f5f9",
    cardBg: "#ffffff",
    textMain: "#0f172a",
    textMuted: "#64748b",
    accentBlue: "#2563eb",
    accentAmber: "#d97706",
    accentIndigo: "#1e40af",
    accentGreen: "#059669",
    accentPurple: "#7c3aed",
    accentRose: "#e11d48",
    accentTeal: "#0d9488",
    accentViolet: "#8b5cf6" 
  };

  const MenuCard = ({ title, icon, description, target, color, disabled }) => (
    <div 
      onClick={() => !disabled && setView(target)}
      style={{
        background: colors.cardBg,
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        cursor: disabled ? "default" : "pointer",
        transition: "all 0.2s ease",
        borderTop: `6px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        opacity: disabled ? 0.7 : 1
      }}
      onMouseEnter={(e) => {
        if(!disabled) {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.1)";
        }
      }}
      onMouseLeave={(e) => {
        if(!disabled) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1)";
        }
      }}
    >
      <span style={{ fontSize: "32px" }}>{icon}</span>
      <h2 style={{ margin: 0, color: colors.textMain, fontSize: "20px", fontWeight: "800" }}>{title}</h2>
      <p style={{ margin: 0, color: colors.textMuted, fontSize: "14px", lineHeight: "1.5" }}>{description}</p>
    </div>
  );

  const DockButton = ({ label, icon, target, color }) => (
    <button
      onClick={() => setView(target)}
      style={{
        width: "100%",
        padding: "12px",
        marginBottom: "8px",
        background: view === target ? color : colors.cardBg,
        color: view === target ? "white" : colors.textMain,
        border: `1px solid ${colors.bg}`,
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "700",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        transition: "all 0.2s"
      }}
    >
      <span>{icon}</span> {label}
    </button>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', sans-serif" }}>
      
      <main style={{ flex: 1, padding: "40px", overflowY: "auto", marginRight: "260px" }}>
        
        {view === "home" && (
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "30px" }}>
              <a 
                href="https://snapcopy.online" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 20px",
                  background: "white",
                  color: colors.accentAmber,
                  borderRadius: "50px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "14px",
                  border: `2px solid ${colors.accentAmber}`,
                  boxShadow: "0 4px 12px rgba(217, 119, 6, 0.1)",
                  transition: "transform 0.2s"
                }}
              >
                <span style={{ marginRight: "8px" }}>✨</span> Visit SnapCopy.online
              </a>
            </div>

            <header style={{ marginBottom: "50px" }}>
              <div style={{ marginBottom: "15px" }}>
                <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>Demo Mode</span>
                <span style={{ color: colors.textMuted, fontSize: "12px", marginLeft: "8px" }}>(Not tied to a database)</span>
              </div>
              
              <h1 style={{ color: colors.textMain, fontSize: "48px", fontWeight: "900", letterSpacing: "-1.5px", margin: "0 0 10px 0" }}>
                SnapMatrix OS
              </h1>
              
              <div style={{ color: colors.accentGreen, fontWeight: "700", fontSize: "16px", marginBottom: "20px" }}>
                🚀 AI Forecasting, Reporting, and Shipping arriving in v3.0
              </div>

              <p style={{ color: colors.textMain, fontSize: "18px", lineHeight: "1.6", maxWidth: "800px", marginBottom: "30px", fontWeight: "500" }}>
                SnapMatrix OS is a lightweight MRP system for small and mid‑sized businesses that manage service work or production jobs. 
                It replaces scattered spreadsheets and messages with one simple place to track clients, jobs, materials, inventory, and purchasing 
                — without the complexity of big enterprise software.
              </p>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
              <MenuCard title="Service Scheduling" icon="📅" target="gantt" color={colors.accentViolet} description="Visual Gantt chart for scheduling technicians and managing live job tracks." />
              <MenuCard title="Service Onboarding" icon="🛠️" target="service" color={colors.accentBlue} description="Deploy AI copy-gen and onboarding flows for standard clients." />
              <MenuCard title="Client Ledger" icon="👥" target="ledger" color={colors.accentPurple} description="Manage client onboarding database and synced job records." />
              <MenuCard title="Production Portal" icon="🎬" target="production" color={colors.accentAmber} description="Manage film titles, production houses, and job numbers." />
              <MenuCard title="Product Master" icon="🏗️" target="mfg" color={colors.accentTeal} description="Define manufactured goods and manage Bills of Materials (BOM)." />
              <MenuCard title="Purchase Orders" icon="📜" target="po" color={colors.accentRose} description="Create and manage vendor POs for incoming gear." />
              <MenuCard title="Inventory Vault" icon="📦" target="inventory" color={colors.accentIndigo} description="Real-time gear tracking and stock level management." />
              <MenuCard title="Receiving Hub" icon="🚚" target="receiving" color={colors.accentGreen} description="Process incoming shipments and update stock levels." />
              
              {/* v3.0 COMING SOON CARD */}
              <MenuCard 
                title="v3.0 Roadmap" 
                icon="🚀" 
                target="home" 
                color="#94a3b8" 
                disabled={true}
                description="Upcoming: AI-powered demand forecasting, automated shipping labels, and advanced financial reporting modules." 
              />
            </div>
          </div>
        )}

        <div style={{ position: "relative" }}>
          <Suspense fallback={<div style={{padding: "20px", color: colors.textMuted}}>Loading Module...</div>}>
            {view === "gantt" && <ServiceGantt setView={setView} />}
            {view === "service" && <ServiceClientOnboarding setView={setView} />}
            {view === "ledger" && <Dashboard setView={setView} />}
            {view === "production" && <ProductionOnboarding setView={setView} />}
            {view === "inventory" && <InventoryDashboard setView={setView} />}
            {view === "receiving" && <ReceivingModule setView={setView} />}
            {view === "po" && <POModule setView={setView} />}
            {view === "mfg" && <ManufacturedProductRecord setView={setView} />}
          </Suspense>
        </div>
      </main>

      <aside style={{
        width: "260px",
        background: "white",
        borderLeft: `1px solid ${colors.bg}`,
        padding: "20px",
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 1000
      }}>
        <div style={{ marginBottom: "25px", paddingBottom: "15px", borderBottom: `1px solid ${colors.bg}` }}>
          <h3 style={{ fontSize: "12px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>SnapMatrix Navigation</h3>
        </div>

        <DockButton label="Home" icon="🏠" target="home" color={colors.textMain} />
        <DockButton label="Service Scheduling" icon="📅" target="gantt" color={colors.accentViolet} />
        <DockButton label="Product Master" icon="🏗️" target="mfg" color={colors.accentTeal} />
        <DockButton label="Client Ledger" icon="👥" target="ledger" color={colors.accentPurple} />
        <DockButton label="Services" icon="🛠️" target="service" color={colors.accentBlue} />
        <DockButton label="Production" icon="🎬" target="production" color={colors.accentAmber} />
        <DockButton label="Purchase Orders" icon="📜" target="po" color={colors.accentRose} />
        <DockButton label="Inventory" icon="📦" target="inventory" color={colors.accentIndigo} />
        <DockButton label="Receiving" icon="🚚" target="receiving" color={colors.accentGreen} />

        <div style={{ marginTop: "auto", fontSize: "10px", color: colors.textMuted, textAlign: "center" }}>
          System v2.6 | DEMO MODE ACTIVE
        </div>
      </aside>
    </div>
  );
}
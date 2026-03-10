import React, { useState, Suspense, lazy } from "react";
// Standard imports
import ServiceClientOnboarding from "./ServiceClientOnboarding"; 
import ProductionOnboarding from "./ProductionOnboarding";
import InventoryDashboard from "./InventoryDashboard";
import ReceivingModule from "./ReceivingModule"; 
import Dashboard from "./Dashboard"; 
// NEW MODULE IMPORT
import ManufacturedProductRecord from "./ManufacturedProductRecord"; 

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
    accentTeal: "#0d9488" 
  };

  const MenuCard = ({ title, icon, description, target, color }) => (
    <div 
      onClick={() => setView(target)}
      style={{
        background: colors.cardBg,
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderTop: `6px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1)";
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
            
            {/* Branding Link Addition */}
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
              <h1 style={{ color: colors.textMain, fontSize: "42px", fontWeight: "900", letterSpacing: "-1px" }}>
                SnapMatrix OS
              </h1>
              {/* Removed name from welcome text */}
              <p style={{ color: colors.textMuted, fontSize: "18px" }}>AI analytics, advanced reporting, and integrated shipping will be introduced in v3.0.</p>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" }}>
              <MenuCard title="Service Onboarding" icon="🛠️" target="service" color={colors.accentBlue} description="Deploy AI copy-gen and onboarding flows for standard clients." />
              <MenuCard title="Client Ledger" icon="👥" target="ledger" color={colors.accentPurple} description="Manage client onboarding database and synced job records." />
              <MenuCard title="Production Portal" icon="🎬" target="production" color={colors.accentAmber} description="Manage film titles, production houses, and job numbers." />
              <MenuCard title="Product Master" icon="🏗️" target="mfg" color={colors.accentTeal} description="Define manufactured goods and manage Bills of Materials (BOM)." />
              <MenuCard title="Purchase Orders" icon="📜" target="po" color={colors.accentRose} description="Create and manage vendor POs for incoming gear." />
              <MenuCard title="Inventory Vault" icon="📦" target="inventory" color={colors.accentIndigo} description="Real-time gear tracking and stock level management." />
              <MenuCard title="Receiving Hub" icon="🚚" target="receiving" color={colors.accentGreen} description="Process incoming shipments and update stock levels." />
            </div>
          </div>
        )}

        <div style={{ position: "relative" }}>
          <Suspense fallback={<div style={{padding: "20px", color: colors.textMuted}}>Loading Module...</div>}>
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
        <DockButton label="Product Master" icon="🏗️" target="mfg" color={colors.accentTeal} />
        <DockButton label="Client Ledger" icon="👥" target="ledger" color={colors.accentPurple} />
        <DockButton label="Services" icon="🛠️" target="service" color={colors.accentBlue} />
        <DockButton label="Production" icon="🎬" target="production" color={colors.accentAmber} />
        <DockButton label="Purchase Orders" icon="📜" target="po" color={colors.accentRose} />
        <DockButton label="Inventory" icon="📦" target="inventory" color={colors.accentIndigo} />
        <DockButton label="Receiving" icon="🚚" target="receiving" color={colors.accentGreen} />

        <div style={{ marginTop: "auto", fontSize: "10px", color: colors.textMuted, textAlign: "center" }}>
          System v2.5 | Client Sync Active
        </div>
      </aside>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Dashboard({ org, onSwitchWorkspace }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setLoading(true);
    setError(null);
    api(`/dashboard?org_id=${org.org_id}`)
      .then(setData)
      .catch((err) => {
        setError(err.message || "Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, [org]);

  if (loading) {
    return <div className="card"><h2>Loading...</h2></div>;
  }

  if (error) {
    return <div className="card" style={{ borderLeft: "3px solid #c85a54" }}><h2>Error</h2><p>{error}</p></div>;
  }

  if (!data) {
    return <div className="card"><h2>No data available</h2></div>;
  }

  const responseRates = data.response_rates || [];
  const overall = data.overall || { completed: 0, invited: 0 };
  const hiddenTeamCount = data.hidden_team_count || 0;

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", padding: 0, margin: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0", paddingBottom: "1rem", borderBottom: "1px solid #e8f1ed", paddingLeft: "2rem", paddingRight: "2rem", paddingTop: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "1.1rem", color: "#3d5247" }}>AI Pulse</span>
          <span style={{ color: "#999" }}>/</span>
          <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "#3d5247" }}>{data.organization}</span>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", fontSize: "0.9rem" }}>
          <span style={{ color: "#999" }}>admin@example.test</span>
          <span style={{ color: "#999" }}>•</span>
          <button
            onClick={onSwitchWorkspace}
            style={{
              background: "none",
              border: "none",
              color: "#6b8e7e",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
              font: "inherit",
              fontSize: "0.9rem"
            }}
          >
            Switch workspace
          </button>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0", flex: 1, paddingLeft: "0", paddingRight: "0" }}>
      {/* Sidebar */}
      <div style={{ width: "200px", flexShrink: 0, paddingLeft: "2rem", paddingRight: "1rem", paddingTop: "1rem" }}>
        <div style={{ backgroundColor: "#f5f9f7", padding: "1rem", borderRadius: "8px" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { id: "overview", label: "Overview" },
              { id: "teams", label: "Teams" },
              { id: "risks", label: "Risks" },
              { id: "invitations", label: "Invitations" },
              { id: "settings", label: "Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? "#6b8e7e" : "transparent",
                  color: activeTab === tab.id ? "#fefdfb" : "#2d3d35",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.9rem",
                  fontWeight: activeTab === tab.id ? "600" : "400",
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: "2rem", paddingLeft: "1rem", paddingTop: "1rem", paddingBottom: "2rem", overflowY: "auto" }}>
        {activeTab === "overview" && (
          <div style={{ width: "100%" }}>
            <h2>{data.organization} - Overview</h2>
            <p style={{ color: "#999", fontSize: "0.9rem", marginBottom: "2rem" }}>
              Updated 28 Oct 2024, 09:14 • responses to date
            </p>

            {/* Overview Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", marginBottom: "2rem", width: "100%" }}>
              <div className="card">
                <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>Completed</div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#3d5247" }}>
                  {overall.completed}/{overall.invited}
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>Average maturity</div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#3d5247" }}>
                  {(responseRates.reduce((sum, r) => sum + (r.average_score || 0), 0) / Math.max(responseRates.length, 1)).toFixed(2)}
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>Teams shown separately</div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#3d5247" }}>
                  {responseRates.length - hiddenTeamCount} of {responseRates.length} teams
                </div>
              </div>
            </div>

            {/* Maturity by Team */}
            <div className="card" style={{ width: "100%" }}>
              <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Maturity by team</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e8f1ed" }}>
                    <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600", color: "#3d5247" }}>Team</th>
                    <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: "600", color: "#3d5247" }}>Completed</th>
                    <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: "600", color: "#3d5247" }}>Tool use</th>
                    <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: "600", color: "#3d5247" }}>Policy</th>
                    <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: "600", color: "#3d5247" }}>Data handling</th>
                    <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: "600", color: "#3d5247" }}>Review</th>
                    <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: "600", color: "#3d5247" }}>Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {responseRates.map((team, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #e8f1ed" }}>
                      <td style={{ padding: "0.75rem", color: "#2d3d35" }}>{team.team_name}</td>
                      <td style={{ textAlign: "center", padding: "0.75rem", backgroundColor: "#d4e4dd", color: "#2d3d35" }}>
                        {team.completed}/{team.invited}
                      </td>
                      <td style={{ textAlign: "center", padding: "0.75rem", backgroundColor: "#b3d4bf", color: "#fefdfb", fontWeight: "600" }}>
                        3.8
                      </td>
                      <td style={{ textAlign: "center", padding: "0.75rem", backgroundColor: "#c5ddd0", color: "#2d3d35" }}>3.1</td>
                      <td style={{ textAlign: "center", padding: "0.75rem", backgroundColor: "#a3c8b0", color: "#fefdfb", fontWeight: "600" }}>2.6</td>
                      <td style={{ textAlign: "center", padding: "0.75rem", backgroundColor: "#6b8e7e", color: "#fefdfb", fontWeight: "600" }}>2.9</td>
                      <td style={{ textAlign: "center", padding: "0.75rem", backgroundColor: "#d4e4dd", color: "#2d3d35", fontWeight: "600" }}>3.4</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hiddenTeamCount > 0 && (
                <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#999" }}>
                  <strong>{hiddenTeamCount} team{hiddenTeamCount !== 1 ? "s" : ""} hidden:</strong> fewer than 5 responses. Their results are not shown to protect anonymity.
                </p>
              )}
            </div>

            {/* Top Risks and People by Level */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2rem", width: "100%" }}>
              <div className="card">
                <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Top risks</h3>
                <div style={{ fontSize: "0.9rem", color: "#2d3d35" }}>
                  <p style={{ marginBottom: "0.5rem" }}>Sample risks will appear here based on team responses.</p>
                </div>
              </div>
              <div className="card">
                <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>People by level</h3>
                <div style={{ fontSize: "0.9rem", color: "#2d3d35" }}>
                  <p style={{ marginBottom: "0.5rem" }}>Usage distribution will appear here.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "teams" && (
          <div className="card">
            <h2>Teams</h2>
            <p>Team details coming soon...</p>
          </div>
        )}

        {activeTab === "risks" && (
          <div className="card">
            <h2>Risks</h2>
            <p>Risk analysis coming soon...</p>
          </div>
        )}

        {activeTab === "invitations" && (
          <div className="card">
            <h2>Invitations</h2>
            <p>Manage invitations coming soon...</p>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="card">
            <h2>Settings</h2>
            <p>Organization settings coming soon...</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

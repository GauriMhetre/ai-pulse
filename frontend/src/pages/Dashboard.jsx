import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Dashboard({ org, onSwitchWorkspace }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", padding: 0, margin: 0, backgroundColor: "#f5f9f7" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid #e8f1ed", paddingLeft: "2rem", paddingRight: "2rem", paddingTop: "1rem", backgroundColor: "#f5f9f7" }}>
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

      {/* Main Content */}
      <div style={{ flex: 1, paddingLeft: "2rem", paddingRight: "2rem", paddingTop: "2rem", paddingBottom: "2rem", overflowY: "auto" }}>
        <h2>{data.organization} - Overview</h2>
        <p style={{ color: "#999", fontSize: "0.9rem", marginBottom: "2rem" }}>
          Overall: <strong>{overall.completed} / {overall.invited}</strong> completed
        </p>

        {/* Response Rates Section */}
        {responseRates.length > 0 ? (
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1rem", color: "#3d5247" }}>
              Response Rates
            </h3>
            {responseRates.map((team, idx) => {
              const percentage = team.invited > 0 ? (team.completed / team.invited) * 100 : 0;
              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    backgroundColor: "#fefdfb",
                    border: "1px solid #e8f1ed",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                      fontSize: "0.95rem",
                    }}
                  >
                    <span style={{ fontWeight: "600", color: "#3d5247" }}>{team.team_name}</span>
                    <span style={{ color: "#999" }}>
                      {team.completed} / {team.invited}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "10px",
                      backgroundColor: "#e8f1ed",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${percentage}%`,
                        backgroundColor: "#6b8e7e",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ marginBottom: "2rem" }}>
            <p style={{ color: "#999", marginBottom: 0 }}>
              No team has enough responses to display yet.
            </p>
          </div>
        )}

        {/* Hidden Teams Message */}
        {hiddenTeamCount > 0 && (
          <div
            className="card"
            style={{
              marginBottom: "2rem",
              borderLeft: "3px solid #6b8e7e",
              backgroundColor: "#f5f9f7",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#3d5247" }}>
              <strong>{hiddenTeamCount} team{hiddenTeamCount !== 1 ? "s" : ""} hidden:</strong> fewer than 5 responses. Their results are not shown to protect anonymity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

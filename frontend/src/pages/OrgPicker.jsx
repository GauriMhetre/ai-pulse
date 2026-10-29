import React, { useState } from "react";
import { api, setToken } from "../api.js";

export default function OrgPicker({ orgs, onPick, onSignOut }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  async function pick(o) {
    setIsLoading(true);
    setSelectedOrgId(o.org_id);
    try {
      const data = await api("/auth/select-org", { method: "POST", body: JSON.stringify({ org_id: o.org_id }) });
      setToken(data.token);
      onPick(o);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Select a workspace</h2>
      <p style={{ color: "#999", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        You have access to {orgs.length} organization{orgs.length !== 1 ? "s" : ""}. You can switch later from the top bar.
      </p>
      {orgs.map((o) => (
        <p key={o.org_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1rem" }}><strong>{o.org_name}</strong></span>
          <div>
            <button 
              onClick={() => pick(o)} 
              disabled={isLoading}
              style={{ padding: "8px 16px", marginRight: "0.5rem" }}
            >
              {isLoading && selectedOrgId === o.org_id ? "Loading..." : o.role}
            </button>
          </div>
        </p>
      ))}
      <hr style={{ margin: "1.5rem 0", borderColor: "#e8f1ed" }} />
      <p style={{ color: "#999", fontSize: "0.9rem" }}>
        Signed in as <strong>{orgs[0]?.email || "user"}</strong>. <button onClick={onSignOut} style={{ background: "none", border: "none", color: "#6b8e7e", cursor: "pointer", textDecoration: "underline", padding: 0, font: "inherit" }}>Sign out</button>
      </p>
    </div>
  );
}

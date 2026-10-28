import React, { useState } from "react";
import { api, setToken } from "../api.js";

export default function OrgPicker({ orgs, onPick }) {
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
      <h2>Choose an organization</h2>
      {orgs.map((o) => (
        <p key={o.org_id}>
          <button onClick={() => pick(o)} disabled={isLoading}>{isLoading && selectedOrgId === o.org_id ? "Loading..." : o.org_name}</button> <small>({o.role})</small>
        </p>
      ))}
    </div>
  );
}

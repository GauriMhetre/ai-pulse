import React, { useState, useEffect } from "react";
import Login from "./pages/Login.jsx";
import OrgPicker from "./pages/OrgPicker.jsx";
import Diagnostic from "./pages/Diagnostic.jsx";
import Report from "./pages/Report.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { API_URL } from "./api.js";

export default function App() {
  const [step, setStep] = useState("login");
  const [session, setSession] = useState(null);
  const [org, setOrg] = useState(null);

  // Restore session on app load (with 3 second timeout)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // 3 second timeout - if backend is slow, just go to login
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 3000)
        );

        const fetchPromise = fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => {
          if (!r.ok) throw new Error("not_ok");
          return r.json();
        });

        const user = await Promise.race([fetchPromise, timeoutPromise]);
        
        setSession({
          token,
          ...user
        });
        setStep("org");
      } catch (error) {
        // If session restore fails for ANY reason, just clear it and show login
        localStorage.removeItem("token");
        console.log("Session restore skipped, showing login");
      }
    };

    restoreSession();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setSession(null);
    setOrg(null);
    setStep("login");
  };

  return (
    <div className="wrap">
      <h1>AI Pulse</h1>
      {step === "login" && (
        <Login onDone={(s) => { setSession(s); setStep("org"); }} />
      )}
      {step === "org" && (
        <OrgPicker
          orgs={session.organizations}
          onPick={(o) => { setOrg(o); setStep(o.role === "admin" ? "dashboard" : "diagnostic"); }}
          onSignOut={handleSignOut}
        />
      )}
      {step === "diagnostic" && <Diagnostic onDone={() => setStep("report")} />}
      {step === "report" && <Report />}
      {step === "dashboard" && <Dashboard org={org} onSwitchWorkspace={handleSignOut} />}
    </div>
  );
}

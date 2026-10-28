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
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const user = await response.json();
            setSession({
              token,
              ...user
            });
            setStep("org");
          } else {
            localStorage.removeItem("token");
            setIsRestoring(false);
          }
        } else {
          setIsRestoring(false);
        }
      } catch (error) {
        console.error("Session restore failed:", error);
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, []);

  if (isRestoring) {
    return (
      <div className="wrap">
        <h1>AI Pulse</h1>
        <p>Restoring session...</p>
      </div>
    );
  }

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
        />
      )}
      {step === "diagnostic" && <Diagnostic onDone={() => setStep("report")} />}
      {step === "report" && <Report />}
      {step === "dashboard" && <Dashboard org={org} />}
    </div>
  );
}

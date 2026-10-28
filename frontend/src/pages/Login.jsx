import React, { useState } from "react";
import { api, setToken } from "../api.js";

export default function Login({ onDone }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      setToken(data.token);
      onDone(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Sign in</h2>
      <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} /></label>
      {error && <p className="error">{error}</p>}
      <button disabled={isLoading}>{isLoading ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}

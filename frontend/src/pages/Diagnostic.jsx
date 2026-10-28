import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Diagnostic({ onDone }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api("/diagnostic/questions").then((data) => {
      setQuestions(data);
      setIsLoading(false);
    });
  }, []);

  async function submit() {
    setIsSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer }));
      await api("/diagnostic/submit", { method: "POST", body: JSON.stringify({ answers: payload }) });
      onDone();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <h2>Your AI diagnostic</h2>
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Your AI diagnostic</h2>
      {questions.map((q) => (
        <div key={q.id}>
          <p><b>{q.text}</b></p>
          {q.type === "mcq" ? (
            <select onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} defaultValue="" disabled={isSubmitting}>
              <option value="" disabled>Choose…</option>
              {q.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <textarea rows={4} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} disabled={isSubmitting} />
          )}
        </div>
      ))}
      <button onClick={submit} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</button>
    </div>
  );
}

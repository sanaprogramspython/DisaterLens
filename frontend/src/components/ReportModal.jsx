import { useState } from "react";
import { apiRequest } from "../api.js";

export default function ReportModal({ onClose }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiRequest("/api/incident/report", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className="report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-heading"
      >
        <h2 id="report-heading">Report an incident</h2>
        <form onSubmit={submit}>
          <label htmlFor="incident-text">What did you notice?</label>
          <textarea
            id="incident-text"
            autoFocus
            maxLength={500}
            required
            rows={4}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button className="button button-secondary" type="button" aria-label="Cancel incident report" onClick={onClose}>
              Cancel
            </button>
            <button className="button button-primary" type="submit" aria-label="Send incident report" disabled={submitting}>
              {submitting ? "Sending..." : "Send report"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

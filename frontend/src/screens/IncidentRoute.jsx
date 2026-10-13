import { useState } from "react";
import { apiRequest } from "../api.js";
import MapView from "../components/MapView.jsx";

export default function IncidentRoute({ routeData, user, onConfirm, onReport }) {
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const guidance = routeData?.guidance;
  const safeZone = routeData?.safe_zone;

  async function confirm() {
    setError("");
    setConfirming(true);
    try {
      await apiRequest("/api/evacuation/confirm", {
        method: "POST",
        body: JSON.stringify({ user_id: user?.user_id }),
      });
      onConfirm();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <section className="route-screen">
      <div className="route-banner">
        <span aria-hidden="true">↗</span>
        <div>
          <p>FOLLOW THIS PLAN</p>
          <h1>EVACUATION ROUTE</h1>
        </div>
      </div>
      <div className="route-map-container">
        <MapView routeData={routeData} showRoute />
        <span className="route-map-chip">{guidance?.estimated_walk?.toUpperCase()} WALK</span>
      </div>
      <div className="route-details">
        <p className="section-kicker">INCIDENT DETAILS</p>
        <h2>{guidance?.incident ?? "Incident details loading..."}</h2>
        <div className="detail-grid">
          <div><span>CAUSE</span><strong>{guidance?.cause ?? "—"}</strong></div>
          <div><span>SEVERITY</span><strong className="severity-text">{guidance?.severity ?? "—"}</strong></div>
          <div><span>SAFE ZONE</span><strong>{safeZone?.name ?? "—"}</strong></div>
          <div><span>ESTIMATED TIME</span><strong>{guidance?.estimated_walk ?? "—"} walk</strong></div>
        </div>
        <div className="take-list">
          <span>WHAT TO TAKE</span>
          <p>{guidance?.what_to_take?.join(", ") ?? "—"}.</p>
          <strong>{guidance?.instruction ?? ""}</strong>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" type="button" aria-label="Confirm evacuation and open AI advisory call" disabled={confirming} onClick={confirm}>
          {confirming ? "CONFIRMING..." : "CONFIRM EVACUATION"}
        </button>
        <button className="button button-blue" type="button" aria-label="Report an incident" onClick={onReport}>
          REPORT INCIDENT
        </button>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import MapView from "../components/MapView.jsx";

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export default function EmergencyAlert({ alert, routeData, onViewRoute, onDismiss }) {
  const eta = alert?.eta_minutes;
  const [remaining, setRemaining] = useState(eta == null ? null : eta * 60);
  const hazard = alert?.hazard ?? "flood";
  const title = alert?.title ?? "EMERGENCY ALERT";
  const message = alert?.message ?? "Follow local safety guidance and move to a safe place.";

  useEffect(() => {
    setRemaining(eta == null ? null : eta * 60);
    if (eta == null) return undefined;
    const timer = window.setInterval(() => {
      setRemaining((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [alert?.id, eta]);

  return (
    <section className="emergency-screen" aria-labelledby="emergency-title">
      <div className="emergency-background">
        <MapView routeData={routeData} dimmed />
      </div>
      <div className="emergency-status">
        <span aria-hidden="true">!</span>
        <strong>EMERGENCY ALERT</strong>
        <span className="alert-severity">{alert?.severity ?? "Severe"}</span>
      </div>
      <article className="alert-card">
        <div className="alert-icon" aria-hidden="true">
          {hazard === "heatwave" ? "☀" : hazard === "earthquake" ? "⌁" : (
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>
          )}
        </div>
        <p className="alert-overline">{hazard.toUpperCase()} WARNING</p>
        <h1 id="emergency-title">{title.toUpperCase()}</h1>
        <p className="alert-message">{message}</p>
        {remaining !== null ? (
          <div className="countdown-box" aria-live="polite">
            <span>ESTIMATED TIME</span>
            <strong>{formatCountdown(remaining)}</strong>
            <small>Follow guidance now</small>
          </div>
        ) : (
          <p className="safety-guidance">
            Move away from immediate danger and follow local safety guidance.
          </p>
        )}
        <button className="button button-primary alert-route-button" type="button" aria-label="View evacuation route" onClick={onViewRoute}>
          VIEW ROUTE
        </button>
        <button className="button button-secondary alert-dismiss-button" type="button" aria-label="Dismiss alert and return to all clear" onClick={onDismiss}>
          DISMISS
        </button>
        <p className="simulated-dispatch">Emergency dispatch is simulated in this prototype.</p>
      </article>
    </section>
  );
}

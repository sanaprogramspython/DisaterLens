export default function Alerts({ alerts, onOpenAlert }) {
  return (
    <section className="utility-screen">
      <div className="screen-title">
        <p className="section-kicker">THIS SESSION</p>
        <h1>Alert history</h1>
        <p>Warnings received by this app session.</p>
      </div>
      {alerts.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">✓</span>
          <h2>No alerts received</h2>
          <p>You’ll see any new local warnings here.</p>
        </div>
      ) : (
        <div className="alert-history">
          {[...alerts].reverse().map((alert) => (
            <button className="history-card" key={alert.id} aria-label={`Open ${alert.title}`} onClick={() => onOpenAlert(alert)}>
              <span className="history-icon" aria-hidden="true">!</span>
              <span className="history-copy">
                <strong>{alert.title}</strong>
                <small>{alert.hazard} · {alert.severity}</small>
                <small>{new Date(alert.triggered_at).toLocaleString()}</small>
              </span>
              <span aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

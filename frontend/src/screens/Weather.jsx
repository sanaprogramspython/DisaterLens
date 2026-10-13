export default function Weather({ sensors }) {
  const units = {
    water_level: "River water level",
    rainfall: "Rainfall",
    seismic: "Seismic activity",
    temperature: "Temperature",
  };

  return (
    <section className="utility-screen">
      <div className="screen-title">
        <p className="section-kicker">LIVE MONITORING</p>
        <h1>Local sensors</h1>
        <p>Latest readings from the demo area.</p>
      </div>
      <span className="simulated-badge">SIMULATED DATA</span>
      <div className="sensor-grid">
        {sensors.map((sensor) => (
          <article className="sensor-card" key={sensor.id}>
            <span className="sensor-type">{units[sensor.type] ?? sensor.type}</span>
            <strong>{sensor.value} <small>{sensor.unit}</small></strong>
            <span className="sensor-updated">
              Updated {sensor.last_updated ? new Date(sensor.last_updated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
            </span>
            <span className="simulated-badge small-badge">SIMULATED DATA</span>
          </article>
        ))}
      </div>
    </section>
  );
}

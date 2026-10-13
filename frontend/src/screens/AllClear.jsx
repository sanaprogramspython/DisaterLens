import MapView from "../components/MapView.jsx";

export default function AllClear({ routeData, onViewRoute, connection, area }) {
  return (
    <section className="home-screen" aria-labelledby="all-clear-title">
      <div className="status-banner status-safe">
        <div className="status-check" aria-hidden="true">✓</div>
        <div>
          <h1 id="all-clear-title">STATUS: ALL CLEAR</h1>
          <p>No major risks detected in your area. Stay informed.</p>
        </div>
      </div>
      <div className="map-heading">
        <div>
          <h2>Your area</h2>
          <p>{area || "Shaikpet, Hyderabad"}</p>
        </div>
        <span className={`connection-pill${connection === "connected" ? "" : " is-offline"}`}>
          {connection === "connected" ? "LIVE" : "RECONNECTING"}
        </span>
      </div>
      <MapView routeData={routeData} />
      <div className="map-legend">
        <span><i className="legend-user" /> Your location</span>
        <span><i className="legend-safe" /> Safe point</span>
      </div>
      <button className="button button-outline" type="button" aria-label="View evacuation route" onClick={onViewRoute}>
        VIEW EVACUATION ROUTE
      </button>
    </section>
  );
}

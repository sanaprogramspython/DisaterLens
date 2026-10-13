import { useState } from "react";

export default function DemoControl({ onScenario, onReset }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function perform(action) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="demo-control">
      <button
        className="gear-button"
        type="button"
        aria-label={open ? "Close demo controls" : "Open demo controls"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        ⚙
      </button>
      {open && (
        <section className="demo-panel" aria-label="Demo control panel">
          <h2>Demo Control</h2>
          <button aria-label="Set scenario to normal" disabled={busy} onClick={() => perform(() => onScenario("normal"))}>
            Normal
          </button>
          <button aria-label="Trigger flood scenario" disabled={busy} onClick={() => perform(() => onScenario("flood"))}>
            Trigger Flood
          </button>
          <button aria-label="Trigger earthquake scenario" disabled={busy} onClick={() => perform(() => onScenario("earthquake"))}>
            Trigger Earthquake
          </button>
          <button aria-label="Trigger heatwave scenario" disabled={busy} onClick={() => perform(() => onScenario("heatwave"))}>
            Trigger Heatwave
          </button>
          <button aria-label="Reset demo to normal" disabled={busy} onClick={() => perform(onReset)}>
            Reset
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
        </section>
      )}
    </aside>
  );
}

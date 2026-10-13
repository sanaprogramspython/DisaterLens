import assert from "node:assert/strict";
import test from "node:test";
import { AlertEngine } from "../alert-engine.js";

function makeReadings(overrides = {}) {
  const values = {
    water_level: 2,
    rainfall: 2,
    seismic: 0.2,
    temperature: 32,
    ...overrides,
  };
  return Object.entries(values).map(([type, value]) => ({
    id: `sensor-${type}`,
    type,
    value,
  }));
}

function raisedAlert(readings) {
  const engine = new AlertEngine();
  engine.update(readings);
  assert.ok(engine.activeAlert);
  return engine.activeAlert;
}

test("flood water threshold creates the required alert", () => {
  const alert = raisedAlert(makeReadings({ water_level: 4.5 }));
  assert.equal(alert.hazard, "flood");
  assert.equal(alert.severity, "Extreme");
  assert.equal(alert.eta_minutes, 12);
  assert.equal(alert.cause, "River overflow");
  assert.equal(
    alert.message,
    "CRITICAL FLOOD ALERT. EVACUATE NOW! Water levels rising rapidly. Move to higher ground immediately. Time remaining estimated: 12 mins.",
  );
  assert.deepEqual(alert.contributing_sensor_ids, ["sensor-water-01"]);
});

test("flood rainfall threshold creates a flood alert", () => {
  const alert = raisedAlert(makeReadings({ rainfall: 50 }));
  assert.equal(alert.hazard, "flood");
  assert.deepEqual(alert.contributing_sensor_ids, ["sensor-rain-01"]);
});

test("earthquake magnitude threshold creates an earthquake alert", () => {
  const alert = raisedAlert(makeReadings({ seismic: 4 }));
  assert.equal(alert.hazard, "earthquake");
  assert.deepEqual(alert.contributing_sensor_ids, ["sensor-seismic-01"]);
});

test("heat threshold creates a heatwave alert", () => {
  const alert = raisedAlert(makeReadings({ temperature: 42 }));
  assert.equal(alert.hazard, "heatwave");
  assert.deepEqual(alert.contributing_sensor_ids, ["sensor-temperature-01"]);
});

test("cyclone rainfall threshold creates a cyclone alert", () => {
  const alert = raisedAlert(makeReadings({ rainfall: 80 }));
  assert.equal(alert.hazard, "cyclone");
});

test("active hazard emits once and then emits one clear transition", () => {
  const engine = new AlertEngine();
  const hazardous = makeReadings({ water_level: 4.8 });
  const raised = engine.update(hazardous);
  const repeated = engine.update(hazardous);
  const cleared = engine.update(makeReadings());

  assert.deepEqual(
    raised.map(({ event }) => event),
    ["raised"],
  );
  assert.deepEqual(repeated, []);
  assert.deepEqual(
    cleared.map(({ event }) => event),
    ["cleared"],
  );
  assert.equal(engine.activeAlert, null);
});

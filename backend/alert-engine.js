import { randomUUID } from "node:crypto";

// Edit these demo thresholds here; values and sensor names match simulator.js.
export const THRESHOLD_CONFIG = {
  flood: { water_level_m: 4.5, rainfall_mm_per_hour: 50 },
  earthquake: { seismic_magnitude: 4 },
  heatwave: { temperature_c: 42 },
  cyclone: { rainfall_mm_per_hour: 80 },
};

const SENSOR_IDS = {
  water_level: "sensor-water-01",
  rainfall: "sensor-rain-01",
  seismic: "sensor-seismic-01",
  temperature: "sensor-temperature-01",
};

function valuesFrom(readings) {
  return Object.fromEntries(
    readings.map((reading) => [reading.type, Number(reading.value)]),
  );
}

function detectHazard(values) {
  if (values.rainfall >= THRESHOLD_CONFIG.cyclone.rainfall_mm_per_hour) {
    return "cyclone";
  }
  if (values.seismic >= THRESHOLD_CONFIG.earthquake.seismic_magnitude) {
    return "earthquake";
  }
  if (values.temperature >= THRESHOLD_CONFIG.heatwave.temperature_c) {
    return "heatwave";
  }
  if (
    values.water_level >= THRESHOLD_CONFIG.flood.water_level_m ||
    values.rainfall >= THRESHOLD_CONFIG.flood.rainfall_mm_per_hour
  ) {
    return "flood";
  }
  return null;
}

function createAlert(hazard, values) {
  const base = {
    id: randomUUID(),
    hazard,
    triggered_at: new Date().toISOString(),
  };

  if (hazard === "flood") {
    const contributors = [];
    if (values.water_level >= THRESHOLD_CONFIG.flood.water_level_m) {
      contributors.push(SENSOR_IDS.water_level);
    }
    if (values.rainfall >= THRESHOLD_CONFIG.flood.rainfall_mm_per_hour) {
      contributors.push(SENSOR_IDS.rainfall);
    }
    return {
      ...base,
      severity: "Extreme",
      title: "Critical Flood Alert",
      message:
        "CRITICAL FLOOD ALERT. EVACUATE NOW! Water levels rising rapidly. Move to higher ground immediately. Time remaining estimated: 12 mins.",
      eta_minutes: 12,
      cause: "River overflow",
      contributing_sensor_ids: contributors,
    };
  }

  if (hazard === "earthquake") {
    return {
      ...base,
      severity: values.seismic < 6 ? "Severe" : "Extreme",
      title: "Earthquake Alert",
      message:
        "Strong seismic activity detected. Move away from windows and follow local safety guidance.",
      eta_minutes: null,
      cause: "Seismic activity",
      contributing_sensor_ids: [SENSOR_IDS.seismic],
    };
  }

  if (hazard === "heatwave") {
    return {
      ...base,
      severity: values.temperature < 45 ? "Severe" : "Extreme",
      title: "Heatwave Alert",
      message: "Extreme heat detected. Move to a cool place and drink water.",
      eta_minutes: null,
      cause: "Extreme temperature",
      contributing_sensor_ids: [SENSOR_IDS.temperature],
    };
  }

  return {
    ...base,
    severity: values.rainfall < 120 ? "Severe" : "Extreme",
    title: "Cyclone Alert",
    message:
      "Very heavy rainfall detected as a cyclone-risk stand-in. Seek shelter and follow local safety guidance.",
    eta_minutes: null,
    cause: "Very heavy rainfall (wind data unavailable in this simulation)",
    contributing_sensor_ids: [SENSOR_IDS.rainfall],
  };
}

export class AlertEngine {
  constructor() {
    this.activeAlert = null;
  }

  update(readings) {
    const values = valuesFrom(readings);
    const hazard = detectHazard(values);
    if (this.activeAlert?.hazard === hazard) {
      return [];
    }

    const events = [];
    if (this.activeAlert) {
      this.activeAlert = null;
      events.push({ event: "cleared", active_alert: null });
    }

    if (hazard) {
      this.activeAlert = createAlert(hazard, values);
      events.push({ event: "raised", active_alert: this.activeAlert });
    }
    return events;
  }
}

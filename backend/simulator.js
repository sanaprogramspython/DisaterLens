// All sensor data is SIMULATED. A real deployment would replace this module with IoT sensor ingestion and verified IMD/NDMA feeds.

const SENSOR_CONFIG = [
  {
    id: "sensor-water-01",
    type: "water_level",
    lat: 17.4103,
    lon: 78.396,
    unit: "m",
    baseline: 2,
    noise: 0.05,
  },
  {
    id: "sensor-rain-01",
    type: "rainfall",
    lat: 17.411,
    lon: 78.397,
    unit: "mm/hour",
    baseline: 2,
    noise: 0.6,
  },
  {
    id: "sensor-seismic-01",
    type: "seismic",
    lat: 17.4099,
    lon: 78.399,
    unit: "magnitude",
    baseline: 0.2,
    noise: 0.03,
  },
  {
    id: "sensor-temperature-01",
    type: "temperature",
    lat: 17.412,
    lon: 78.398,
    unit: "°C",
    baseline: 32,
    noise: 0.4,
  },
];

const SCENARIOS = new Set([
  "normal",
  "flood",
  "earthquake",
  "heatwave",
  "cyclone",
]);

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export class SensorSimulator {
  constructor() {
    this.scenario = "normal";
    this.scenarioStartedAt = Date.now();
    this.readings = [];
    this.generateReadings();
  }

  setScenario(scenario) {
    if (!SCENARIOS.has(scenario)) {
      throw new Error("Unsupported scenario");
    }
    this.scenario = scenario;
    this.scenarioStartedAt = Date.now();
  }

  generateReadings() {
    const progress = Math.min((Date.now() - this.scenarioStartedAt) / 20_000, 1);
    const lastUpdated = new Date().toISOString();

    this.readings = SENSOR_CONFIG.map((sensor) => {
      let value = sensor.baseline + randomBetween(-sensor.noise, sensor.noise);
      if (this.scenario === "flood" && sensor.type === "water_level") {
        value = 2 + 3.5 * progress + randomBetween(-0.04, 0.04);
      } else if (this.scenario === "flood" && sensor.type === "rainfall") {
        value = 2 + 62 * progress + randomBetween(-1, 1);
      } else if (this.scenario === "earthquake" && sensor.type === "seismic") {
        value = 5.2 + randomBetween(-0.1, 0.1);
      } else if (this.scenario === "heatwave" && sensor.type === "temperature") {
        value = 44 + randomBetween(-0.5, 0.5);
      } else if (this.scenario === "cyclone" && sensor.type === "rainfall") {
        value = 95 + randomBetween(-2, 2);
      }

      return {
        id: sensor.id,
        type: sensor.type,
        lat: sensor.lat,
        lon: sensor.lon,
        unit: sensor.unit,
        value: Math.round(Math.max(0, value) * 100) / 100,
        last_updated: lastUpdated,
      };
    });

    return this.getReadings();
  }

  getReadings() {
    return this.readings.map((reading) => ({ ...reading }));
  }
}

import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { WebSocketServer } from "ws";
import { AlertEngine } from "./alert-engine.js";
import { closeDatabase, createUser } from "./db.js";
import { SensorSimulator } from "./simulator.js";

const PORT = Number(process.env.PORT ?? 8000);
const SIMULATION_INTERVAL_MS = 2000;
const VALID_SCENARIOS = new Set([
  "normal",
  "flood",
  "earthquake",
  "heatwave",
  "cyclone",
]);
const directory = dirname(fileURLToPath(import.meta.url));
const zones = JSON.parse(
  readFileSync(join(directory, "data", "zones.json"), "utf8"),
);
const simulator = new SensorSimulator();
const alertEngine = new AlertEngine();
const app = express();
const server = createServer(app);
const webSocketServer = new WebSocketServer({ server, path: "/ws" });
const incidentReports = [];
const evacuatingUserIds = new Set();
let latestUserId = null;

app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }
  next();
});
app.use(express.json({ limit: "16kb" }));

function broadcast(message) {
  const serialized = JSON.stringify(message);
  for (const client of webSocketServer.clients) {
    if (client.readyState === 1) {
      client.send(serialized);
    }
  }
}

function refreshAndBroadcast() {
  const sensors = simulator.generateReadings();
  for (const transition of alertEngine.update(sensors)) {
    broadcast({ type: "alert", ...transition });
  }
  broadcast({ type: "sensors", sensors });
}

function isNonEmptyString(value, maxLength) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post("/api/register", (request, response) => {
  const { name, phone, area, language } = request.body ?? {};
  if (
    !isNonEmptyString(name, 100) ||
    !isNonEmptyString(phone, 30) ||
    phone.trim().length < 5 ||
    !isNonEmptyString(area, 120) ||
    !isNonEmptyString(language, 40)
  ) {
    response.status(422).json({
      detail: "Provide a name, phone, area, and language with valid lengths.",
    });
    return;
  }

  try {
    latestUserId = createUser({
      name: name.trim(),
      phone: phone.trim(),
      area: area.trim(),
      language: language.trim(),
    });
    response.json({ user_id: latestUserId });
  } catch (error) {
    console.error("Could not save registration:", error);
    response.status(500).json({ detail: "Could not save registration." });
  }
});

app.get("/api/sensors", (_request, response) => {
  response.json(simulator.getReadings());
});

app.get("/api/status", (_request, response) => {
  const activeAlert = alertEngine.activeAlert;
  response.json({
    state: activeAlert ? "alert" : "all_clear",
    active_alert: activeAlert,
  });
});

app.get("/api/route", (_request, response) => {
  response.json(zones);
});

app.post("/api/demo/scenario", (request, response) => {
  const scenario =
    typeof request.body?.scenario === "string"
      ? request.body.scenario.trim().toLowerCase()
      : "";
  if (!VALID_SCENARIOS.has(scenario)) {
    response.status(422).json({
      detail: `scenario must be one of: ${[...VALID_SCENARIOS].join(", ")}`,
    });
    return;
  }

  simulator.setScenario(scenario);
  refreshAndBroadcast();
  response.json({ scenario });
});

app.post("/api/demo/reset", (_request, response) => {
  simulator.setScenario("normal");
  refreshAndBroadcast();
  response.json({ scenario: "normal" });
});

app.post("/api/incident/report", (request, response) => {
  const { text } = request.body ?? {};
  if (!isNonEmptyString(text, 500)) {
    response.status(422).json({ detail: "Report text must be 1–500 characters." });
    return;
  }
  incidentReports.push({
    text: text.trim(),
    reported_at: new Date().toISOString(),
  });
  response.json({ ok: true });
});

app.post("/api/evacuation/confirm", (request, response) => {
  const requestedUserId = request.body?.user_id ?? latestUserId;
  if (
    requestedUserId !== null &&
    requestedUserId !== undefined &&
    (!Number.isInteger(requestedUserId) || requestedUserId < 1)
  ) {
    response.status(422).json({ detail: "user_id must be a positive integer." });
    return;
  }

  if (requestedUserId !== null && requestedUserId !== undefined) {
    evacuatingUserIds.add(requestedUserId);
  }
  response.json({
    ok: true,
    user_id: requestedUserId ?? null,
    simulated: true,
  });
});

webSocketServer.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "sensors", sensors: simulator.getReadings() }));
});

const simulationTimer = setInterval(
  refreshAndBroadcast,
  SIMULATION_INTERVAL_MS,
);

server.listen(PORT, () => {
  console.log(`DisasterLens API listening on http://localhost:${PORT}`);
});

function shutdown() {
  clearInterval(simulationTimer);
  webSocketServer.close();
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

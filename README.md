# DisasterLens AI

> We use AI and smart sensors to detect disasters early and protect communities.

DisasterLens AI is a student prototype for a mobile-first disaster management
app. The React frontend uses Vite and Leaflet. The Node.js backend simulates
local sensor data and hazard alerts; all sensor readings and evacuation route
details are illustrative, not operational.

## Prerequisites

- Node.js 22.13 or newer and npm (the backend uses Node's built-in SQLite)
- A terminal (PowerShell on Windows, Terminal on macOS/Linux)

## Install

Open two terminals in the `disasterlens-ai` directory.

### Backend

Install the Node.js backend packages:

```bash
cd backend
npm install
```

### Frontend

In the other terminal, from the `disasterlens-ai` directory:

```bash
cd frontend
npm install
```

## Run

Start the backend from the `backend` directory:

```bash
npm start
```

For automatic restart during backend development, use `npm run dev` instead.
Start the frontend from the `frontend` directory:

```bash
npm run dev
```

Open <http://localhost:5173>. The footer reports **Backend connected** when
`GET /api/health` returns `{"status":"ok"}`. The Vite development server
proxies `/api` and `/ws` requests to the backend on port 8000.

On first use, register a demo resident. The main app includes All Clear,
Emergency Alert, Incident Details & Route, and AI Advisory Call screens, plus
Weather, Alerts, and Profile tabs. Weather readings are simulated, route map
locations are illustrative, and the advisory call is layout-only in this step.

## Flood presentation flow

1. Register, then remain on the Home screen.
2. Open the gear icon outside the phone and choose **Trigger Flood**.
3. Wait about 14–16 seconds for the simulated readings to cross the alert
   threshold. The emergency alert appears automatically.
4. Choose **VIEW ROUTE** to see the incident details and map.
5. Choose **CONFIRM EVACUATION** to open the AI Advisory Call layout.

The call layout's **END CALL** button returns Home. Choose **Reset** in Demo
Control to return readings to normal; resetting while an alert is active also
returns the app to All Clear.

## Backend API demo

- `GET /api/health`: backend connectivity check.
- `POST /api/register`: save a resident's name, phone, area and language.
- `GET /api/sensors` and `GET /api/status`: inspect current simulated readings
  and alert state.
- `GET /api/route`: return illustrative map and evacuation guidance data.
- `POST /api/demo/scenario`: select `normal`, `flood`, `earthquake`, `heatwave`
  or `cyclone`; `POST /api/demo/reset` returns to normal.
- `POST /api/incident/report` and `POST /api/evacuation/confirm`: in-memory
  prototype interactions; these do not contact emergency services.
- `/ws`: broadcasts sensor readings every two seconds and alert transitions.

For a quick backend-only demo, run the backend as shown above. In a third
terminal, use these commands from any directory:

```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/api/sensors
curl http://localhost:8000/api/status
curl -X POST http://localhost:8000/api/demo/scenario \
  -H "Content-Type: application/json" -d '{"scenario":"flood"}'
curl http://localhost:8000/api/status
curl -X POST http://localhost:8000/api/demo/reset
```

The flood scenario ramps up over about 20 seconds. It can take roughly 14–16
seconds for the simulated readings to cross the alert threshold. User records
are stored in `backend/data/disasterlens.db`; incident reports and evacuation
confirmations are held in memory. All locations are illustrative. No government
feeds, real sensors, emergency dispatch, or operational evacuation advice are
provided.

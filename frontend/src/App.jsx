import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest, connectToBackend } from "./api.js";
import BottomNav from "./components/BottomNav.jsx";
import BrandHeader from "./components/BrandHeader.jsx";
import DemoControl from "./components/DemoControl.jsx";
import PhoneFrame from "./components/PhoneFrame.jsx";
import ReportModal from "./components/ReportModal.jsx";
import AdvisoryCall from "./screens/AdvisoryCall.jsx";
import Alerts from "./screens/Alerts.jsx";
import AllClear from "./screens/AllClear.jsx";
import EmergencyAlert from "./screens/EmergencyAlert.jsx";
import IncidentRoute from "./screens/IncidentRoute.jsx";
import Profile from "./screens/Profile.jsx";
import Register from "./screens/Register.jsx";
import Weather from "./screens/Weather.jsx";

function storedUser() {
  try {
    return JSON.parse(window.localStorage.getItem("disasterlens-user") ?? "null");
  } catch (error) {
    console.error("Could not read the saved resident profile:", error);
    return null;
  }
}

async function playAlertTone() {
  if (!window.AudioContext) return;
  const context = new window.AudioContext();
  await context.resume();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.3);
  oscillator.onended = () => context.close();
}

export default function App() {
  const [user, setUser] = useState(storedUser);
  const [screen, setScreen] = useState(() => storedUser() ? "home" : "register");
  const [activeTab, setActiveTab] = useState("home");
  const [activeAlert, setActiveAlert] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [connection, setConnection] = useState("reconnecting");
  const [reportOpen, setReportOpen] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const dismissedAlertIds = useRef(new Set());

  const loadRoute = useCallback(async () => {
    setRouteLoading(true);
    try {
      const data = await apiRequest("/api/route");
      setRouteData(data);
      return data;
    } catch (error) {
      console.error("Could not load evacuation route:", error);
      throw error;
    } finally {
      setRouteLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    apiRequest("/api/sensors")
      .then((data) => {
        if (mounted) setSensors(data);
      })
      .catch((error) => console.error("Could not load sensor readings:", error));
    loadRoute().catch(() => {});
    apiRequest("/api/status")
      .then(({ active_alert: alert }) => {
        if (mounted && alert) {
          setActiveAlert(alert);
          setAlerts((items) => (items.some((item) => item.id === alert.id) ? items : [...items, alert]));
          if (!dismissedAlertIds.current.has(alert.id)) setScreen("emergency");
        }
      })
      .catch((error) => console.error("Could not load current status:", error));
    return () => {
      mounted = false;
    };
  }, [loadRoute]);

  useEffect(() => {
    return connectToBackend((message) => {
      if (message.type === "sensors" && Array.isArray(message.sensors)) {
        setSensors(message.sensors);
      }
      if (message.type !== "alert") return;

      if (message.event === "raised" && message.active_alert) {
        const alert = message.active_alert;
        setActiveAlert(alert);
        setAlerts((items) => (items.some((item) => item.id === alert.id) ? items : [...items, alert]));
        if (!dismissedAlertIds.current.has(alert.id)) setScreen("emergency");
        setActiveTab("home");
        if (navigator.vibrate) navigator.vibrate([180, 100, 180]);
        playAlertTone().catch((error) => {
          console.warn("Browser blocked the alert tone:", error);
        });
      } else if (message.event === "cleared") {
        setActiveAlert(null);
        setScreen("home");
        setActiveTab("home");
      }
    }, setConnection);
  }, []);

  function registerResident(newUser) {
    try {
      window.localStorage.setItem("disasterlens-user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Could not save resident profile in this browser:", error);
    }
    setUser(newUser);
    setScreen("home");
    setActiveTab("home");
  }

  async function openRoute() {
    setActiveTab("home");
    try {
      await loadRoute();
      setScreen("route");
    } catch (error) {
      window.alert(`Could not load evacuation route: ${error.message}`);
    }
  }

  function dismissAlert() {
    if (activeAlert?.id) dismissedAlertIds.current.add(activeAlert.id);
    setScreen("home");
    setActiveTab("home");
  }

  async function triggerScenario(scenario) {
    await apiRequest("/api/demo/scenario", {
      method: "POST",
      body: JSON.stringify({ scenario }),
    });
    if (scenario === "normal") {
      setActiveAlert(null);
      setScreen("home");
      setActiveTab("home");
    }
  }

  async function resetScenario() {
    await apiRequest("/api/demo/reset", { method: "POST" });
    setActiveAlert(null);
    setScreen("home");
    setActiveTab("home");
  }

  function selectTab(tab) {
    setActiveTab(tab);
    setScreen(tab);
  }

  function renderScreen() {
    if (!user) return <Register onRegistered={registerResident} />;
    if (screen === "emergency") {
      return (
        <EmergencyAlert
          alert={activeAlert}
          routeData={routeData}
          onViewRoute={openRoute}
          onDismiss={dismissAlert}
        />
      );
    }
    if (screen === "route") {
      return routeData ? (
        <IncidentRoute
          routeData={routeData}
          user={user}
          onConfirm={() => setScreen("advisory")}
          onReport={() => setReportOpen(true)}
        />
      ) : (
        <div className="loading-state">{routeLoading ? "Loading evacuation route..." : "Route data unavailable."}</div>
      );
    }
    if (screen === "advisory") {
      return <AdvisoryCall alert={activeAlert} onEnd={() => setScreen("home")} />;
    }
    if (screen === "weather") return <Weather sensors={sensors} />;
    if (screen === "alerts") return <Alerts alerts={alerts} onOpenAlert={(alert) => {
      setActiveAlert(alert);
      setScreen("emergency");
      setActiveTab("home");
    }} />;
    if (screen === "profile") return <Profile user={user} onSignOut={() => {
      window.localStorage.removeItem("disasterlens-user");
      setUser(null);
      setScreen("register");
    }} />;
    return (
      <AllClear
        routeData={routeData}
        onViewRoute={openRoute}
        connection={connection}
        area={user.area}
      />
    );
  }

  const isEmergency = screen === "emergency";
  return (
    <div className="app-shell">
      <DemoControl onScenario={triggerScenario} onReset={resetScenario} />
      <PhoneFrame>
        <BrandHeader alert={isEmergency} />
        <div className={`screen-content${isEmergency ? " screen-emergency" : ""}`}>
          {renderScreen()}
        </div>
        {user && <BottomNav active={activeTab} onSelect={selectTab} alertCount={alerts.length} />}
        <footer className="prototype-footer">
          <span aria-hidden="true">●</span> SIMULATED DATA - PROTOTYPE
        </footer>
      </PhoneFrame>
      {reportOpen && <ReportModal onClose={() => setReportOpen(false)} />}
    </div>
  );
}

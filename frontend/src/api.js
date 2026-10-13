export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.detail ?? `Request failed with HTTP ${response.status}`);
  }
  return body;
}

export function connectToBackend(onMessage, onStatus) {
  let socket;
  let reconnectTimer;
  let stopped = false;

  function connect() {
    if (stopped) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
    socket.addEventListener("open", () => onStatus("connected"));
    socket.addEventListener("message", (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch (error) {
        console.error("Received invalid WebSocket JSON:", error);
      }
    });
    socket.addEventListener("error", () => onStatus("disconnected"));
    socket.addEventListener("close", () => {
      onStatus("reconnecting");
      if (!stopped) reconnectTimer = window.setTimeout(connect, 1500);
    });
  }

  connect();
  return () => {
    stopped = true;
    window.clearTimeout(reconnectTimer);
    socket?.close();
  };
}

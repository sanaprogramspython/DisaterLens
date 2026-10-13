const TABS = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "weather", label: "Weather", icon: "☼" },
  { id: "alerts", label: "Alerts", icon: "♢" },
  { id: "profile", label: "Profile", icon: "○" },
];

export default function BottomNav({ active, onSelect, alertCount = 0 }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`nav-button${active === tab.id ? " nav-active" : ""}`}
          type="button"
          aria-label={`Go to ${tab.label}`}
          aria-current={active === tab.id ? "page" : undefined}
          onClick={() => onSelect(tab.id)}
        >
          <span className="nav-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span>{tab.label}</span>
          {tab.id === "alerts" && alertCount > 0 && (
            <span className="nav-count">{alertCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}

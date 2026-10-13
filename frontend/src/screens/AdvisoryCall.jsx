import { useEffect, useState } from "react";

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function AdvisoryCall({ alert, onEnd }) {
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="advisory-screen">
      <header className="advisory-header">
        <span aria-hidden="true">☎</span>
        <div>
          <p>DISASTERLENS AI</p>
          <h1>AI ADVISORY CALL</h1>
          <small>EVACUATION GUIDANCE</small>
        </div>
      </header>
      <div className="call-content">
        <div className="active-call-pill"><i /> ACTIVE CALL</div>
        <div className="call-timer" aria-live="off">{formatTime(elapsed)}</div>
        <div className="robot-avatar" aria-label="AI voice assistant avatar" role="img">
          <span className="robot-antenna" />
          <span className="robot-face"><i /><i /><b /></span>
        </div>
        <div className="waveform" aria-label="Audio waveform animation">
          {Array.from({ length: 25 }, (_, index) => (
            <i
              key={index}
              style={{ "--i": index, height: `${6 + (index % 5) * 4}px` }}
            />
          ))}
        </div>
        <p className="call-guidance">I’m here to guide you to safety.</p>
        <div className="transcript" aria-label="Call transcript">
          <p><time>00:00</time><span>AI Assistant</span></p>
          <blockquote>
            {alert?.message ?? "Stay calm and follow your evacuation route to the safe zone."}
          </blockquote>
          <p><time>{formatTime(elapsed)}</time><span>AI Assistant</span></p>
          <blockquote>Take essential medication, important documents, and water. Do not delay.</blockquote>
        </div>
        <div className="call-controls">
          <button className="control-button end-call" aria-label="End call and return home" onClick={onEnd}>
            <span>✕</span> END CALL
          </button>
          <button className="control-button" aria-label={muted ? "Unmute microphone" : "Mute microphone"} aria-pressed={muted} onClick={() => setMuted(!muted)}>
            <span>{muted ? "⌁" : "♩"}</span> {muted ? "MUTED" : "MUTE"}
          </button>
          <button className="control-button" aria-label={speaker ? "Turn speaker off" : "Turn speaker on"} aria-pressed={speaker} onClick={() => setSpeaker(!speaker)}>
            <span>{speaker ? "◖" : "◗"}</span> SPEAKER
          </button>
        </div>
        <p className="call-notice">Prototype call layout · voice guidance is not active yet</p>
      </div>
    </section>
  );
}

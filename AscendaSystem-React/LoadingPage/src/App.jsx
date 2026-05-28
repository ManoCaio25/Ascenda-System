import React, { useEffect, useMemo, useState } from "react";
import rocketUrl from "../assets/rocket.svg";

const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH || "/AscendaSystem-React/Login/index.html";

function fallbackUrl() {
  const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname) && window.location.port;
  if (/^https?:\/\//i.test(LOGIN_PATH)) return LOGIN_PATH;
  if (!isLocalDev) return LOGIN_PATH;
  return `${window.location.protocol}//${window.location.hostname}:5173${LOGIN_PATH}`;
}

const steps = [
  "Validando credenciais",
  "Sincronizando perfil",
  "Carregando vinculos",
  "Abrindo portal",
];

function readTransitionProfile() {
  try {
    const raw = window.sessionStorage.getItem("transitionProfile");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Unable to read transition profile", error);
    return null;
  }
}

export default function App() {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const profile = useMemo(readTransitionProfile, []);
  const target = useMemo(() => window.sessionStorage.getItem("nextUrl") || fallbackUrl(), []);
  const roleLabel = profile?.role === "mentor" ? "Mentor Portal" : "Intern Portal";

  useEffect(() => {
    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(current + 2.5, 100));
    }, 80);

    const stepTimer = window.setInterval(() => {
      setStepIndex((current) => Math.min(current + 1, steps.length - 1));
    }, 900);

    const redirectTimer = window.setTimeout(() => {
      window.location.href = target;
    }, 3600);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(stepTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [target]);

  return (
    <main className="launch-shell">
      <div className="starfield" aria-hidden="true">
        {Array.from({ length: 76 }, (_, index) => (
          <span
            key={index}
            style={{
              "--x": `${(index * 37) % 100}%`,
              "--y": `${(index * 61) % 100}%`,
              "--delay": `${(index % 9) * 0.18}s`,
            }}
          />
        ))}
      </div>

      <section className="launch-card" aria-live="polite">
        <div className="rocket-track" aria-hidden="true">
          <div className="rocket-glow" />
          <img src={rocketUrl} alt="" className="rocket" />
          <span className="trail trail-one" />
          <span className="trail trail-two" />
          <span className="trail trail-three" />
        </div>

        <div className="launch-copy">
          <p className="eyebrow">Ascenda Launch Bridge</p>
          <h1>{profile?.full_name ? `Abrindo ambiente de ${profile.full_name}` : "Preparando ambiente"}</h1>
          <p className="target-label">{roleLabel}</p>
        </div>

        <div className="progress-wrap">
          <div className="progress-line">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="step-row">
            <span>{steps[stepIndex]}</span>
            <strong>{Math.round(progress)}%</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

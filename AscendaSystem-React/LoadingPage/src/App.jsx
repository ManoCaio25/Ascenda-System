import React, { useEffect, useMemo, useState } from "react";

const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH || "/AscendaSystem-React/Login/index.html";

const copy = {
  pt: {
    eyebrow: "Ascenda Cloud Bridge",
    fallbackTitle: "Preparando ambiente",
    title: (name) => `Preparando ambiente de ${name}`,
    role: {
      mentor: "Mentor Portal",
      intern: "Portal do Estagiario",
    },
    steps: [
      "Validando sessao",
      "Sincronizando perfil",
      "Carregando vinculos",
      "Abrindo portal",
    ],
  },
  en: {
    eyebrow: "Ascenda Cloud Bridge",
    fallbackTitle: "Preparing workspace",
    title: (name) => `Preparing ${name}'s workspace`,
    role: {
      mentor: "Mentor Portal",
      intern: "Intern Portal",
    },
    steps: [
      "Validating session",
      "Syncing profile",
      "Loading ownership links",
      "Opening portal",
    ],
  },
  es: {
    eyebrow: "Ascenda Cloud Bridge",
    fallbackTitle: "Preparando entorno",
    title: (name) => `Preparando entorno de ${name}`,
    role: {
      mentor: "Mentor Portal",
      intern: "Portal del Pasante",
    },
    steps: [
      "Validando sesion",
      "Sincronizando perfil",
      "Cargando vinculos",
      "Abriendo portal",
    ],
  },
};

function fallbackUrl() {
  const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname) && window.location.port;
  if (/^https?:\/\//i.test(LOGIN_PATH)) return LOGIN_PATH;
  if (!isLocalDev) return LOGIN_PATH;
  return `${window.location.protocol}//${window.location.hostname}:5173${LOGIN_PATH}`;
}

function readTransitionProfile() {
  try {
    const raw = window.sessionStorage.getItem("transitionProfile");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Unable to read transition profile", error);
    return null;
  }
}

function readLanguage() {
  try {
    const raw = window.localStorage.getItem("ascenda_login_preferences");
    const preferences = raw ? JSON.parse(raw) : {};
    return preferences.language || "pt";
  } catch {
    return "pt";
  }
}

function CloudGlyph() {
  return (
    <div className="cloud-stage" aria-hidden="true">
      <span className="signal-ring ring-one" />
      <span className="signal-ring ring-two" />
      <span className="signal-ring ring-three" />
      <div className="cloud-mark">
        <span className="cloud-node node-left" />
        <span className="cloud-node node-main" />
        <span className="cloud-node node-right" />
        <span className="cloud-base" />
        <span className="session-dot dot-one" />
        <span className="session-dot dot-two" />
        <span className="session-dot dot-three" />
      </div>
      <span className="stream-line line-one" />
      <span className="stream-line line-two" />
      <span className="stream-line line-three" />
    </div>
  );
}

export default function App() {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const profile = useMemo(readTransitionProfile, []);
  const language = useMemo(readLanguage, []);
  const t = copy[language] || copy.pt;
  const target = useMemo(() => window.sessionStorage.getItem("nextUrl") || fallbackUrl(), []);
  const roleLabel = profile?.role === "mentor" ? t.role.mentor : t.role.intern;
  const title = profile?.full_name ? t.title(profile.full_name) : t.fallbackTitle;

  useEffect(() => {
    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(current + 2.5, 100));
    }, 80);

    const stepTimer = window.setInterval(() => {
      setStepIndex((current) => Math.min(current + 1, t.steps.length - 1));
    }, 900);

    const redirectTimer = window.setTimeout(() => {
      window.location.href = target;
    }, 3600);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(stepTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [target, t.steps.length]);

  return (
    <main className="cloud-shell">
      <div className="grid-field" aria-hidden="true">
        {Array.from({ length: 48 }, (_, index) => (
          <span
            key={index}
            style={{
              "--x": `${(index * 41) % 100}%`,
              "--y": `${(index * 67) % 100}%`,
              "--delay": `${(index % 8) * 0.22}s`,
            }}
          />
        ))}
      </div>

      <section className="cloud-loader" aria-live="polite">
        <CloudGlyph />

        <div className="loading-copy">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{title}</h1>
          <p className="target-label">{roleLabel}</p>
        </div>

        <div className="progress-wrap">
          <div className="progress-line">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="step-row">
            <span>{t.steps[stepIndex]}</span>
            <strong>{Math.round(progress)}%</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

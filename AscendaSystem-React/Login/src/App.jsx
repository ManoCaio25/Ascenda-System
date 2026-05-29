import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  GraduationCap,
  Languages,
  Lock,
  Mail,
  Moon,
  Orbit,
  Palette,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  UsersRound,
} from "lucide-react";
import { redirectThroughLoading } from "./authStore";
import { getMentors, login, registerIntern, registerMentor } from "./services/authService";
import { accentOptions, languageOptions, translations } from "./i18n";

const UI_STORAGE_KEY = "ascenda_login_preferences";

const initialLogin = {
  email: "",
  password: "",
  role: "mentor",
};

const initialRegister = {
  role: "intern",
  fullName: "",
  email: "",
  password: "",
  title: "",
  track: "",
  mentorId: "",
  substituteMentorId: "",
};

const areaOptions = ["SAP HR", "DEV WEB"];

function readPreferences() {
  try {
    const value = window.localStorage.getItem(UI_STORAGE_KEY);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function Field({ icon: Icon, label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="field-control">
        {Icon && <Icon className="field-icon" aria-hidden="true" />}
        {children}
      </div>
    </label>
  );
}

function RoleButton({ active, icon: Icon, label, onClick }) {
  return (
    <button type="button" className={`role-button ${active ? "active" : ""}`} onClick={onClick}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function PreferenceBar({ theme, language, accentId, t, onThemeChange, onLanguageChange, onAccentChange }) {
  return (
    <div className="preference-bar" aria-label={t.controls.preferences}>
      <div className="control-cluster">
        <span>{t.controls.theme}</span>
        <div className="theme-switch" aria-label={t.controls.theme}>
          <button
            type="button"
            className={theme === "dark" ? "active" : ""}
            onClick={() => onThemeChange("dark")}
            aria-label={t.controls.dark}
            title={t.controls.dark}
          >
            <Moon size={16} />
          </button>
          <button
            type="button"
            className={theme === "light" ? "active" : ""}
            onClick={() => onThemeChange("light")}
            aria-label={t.controls.light}
            title={t.controls.light}
          >
            <Sun size={16} />
          </button>
        </div>
      </div>

      <div className="control-cluster">
        <span>{t.controls.language}</span>
        <div className="language-switch" aria-label={t.controls.language}>
          <Languages size={16} aria-hidden="true" />
          {languageOptions.map((item) => (
            <button
              key={item.code}
              type="button"
              className={language === item.code ? "active" : ""}
              onClick={() => onLanguageChange(item.code)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-cluster color-cluster">
        <span>{t.controls.accent}</span>
        <div className="accent-switch" aria-label={t.controls.accent}>
          <Palette size={16} aria-hidden="true" />
          {accentOptions.map((item) => (
            <button
              key={item.id}
              type="button"
              className={accentId === item.id ? "active" : ""}
              onClick={() => onAccentChange(item.id)}
              aria-label={item.label}
              title={item.label}
              style={{ "--swatch": item.value, "--swatch-pair": item.pair }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function translateError(error, t) {
  const message = error?.message || t.feedback.invalidAuth;
  if (message === "Failed to fetch") return t.feedback.network;
  if (message === "Resposta de autenticacao invalida.") return t.feedback.invalidAuth;
  return message;
}

export default function App() {
  const storedPreferences = useMemo(readPreferences, []);
  const [theme, setTheme] = useState(storedPreferences.theme || "dark");
  const [language, setLanguage] = useState(storedPreferences.language || "pt");
  const [accentId, setAccentId] = useState(storedPreferences.accentId || "cyan");
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentors, setMentors] = useState([]);

  const t = translations[language] || translations.pt;
  const accent = accentOptions.find((item) => item.id === accentId) || accentOptions[0];

  useEffect(() => {
    window.localStorage.setItem(
      UI_STORAGE_KEY,
      JSON.stringify({
        theme,
        language,
        accentId,
      }),
    );
  }, [theme, language, accentId]);

  useEffect(() => {
    let active = true;
    getMentors()
      .then((items) => {
        if (active) setMentors(items);
      })
      .catch((error) => {
        console.warn("Unable to load mentors", error);
        if (active) setMentors([]);
      });
    return () => {
      active = false;
    };
  }, [mode, feedback.type]);

  const updateLogin = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
    setFeedback({ type: "", message: "" });
  };

  const updateRegister = (field, value) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
    setFeedback({ type: "", message: "" });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const account = await login(loginForm);
      setFeedback({ type: "success", message: t.feedback.loginSuccess });
      window.setTimeout(() => redirectThroughLoading(account), 380);
    } catch (error) {
      setFeedback({ type: "error", message: translateError(error, t) });
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const account =
        registerForm.role === "mentor"
          ? await registerMentor(registerForm)
          : await registerIntern(registerForm);
      if (account.password) {
        await login({
          email: account.email,
          password: account.password,
          role: account.role,
        });
      }
      setFeedback({ type: "success", message: t.feedback.registerSuccess });
      window.setTimeout(() => redirectThroughLoading(account), 420);
    } catch (error) {
      setFeedback({ type: "error", message: translateError(error, t) });
      setIsSubmitting(false);
    }
  };

  const activeForm = mode === "login" ? loginForm : registerForm;
  const selectedRole = activeForm.role;

  return (
    <main
      className={`auth-shell theme-${theme}`}
      style={{
        "--accent": accent.value,
        "--accent-pair": accent.pair,
      }}
    >
      <section className="hero-panel" aria-label={t.appLabel}>
        <div className="orbital-field" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="orbit orbit-three" />
          <span className="planet" />
        </div>

        <div className="brand-block">
          <div className="brand-mark">
            <Orbit size={28} />
          </div>
          <div>
            <p className="eyebrow">{t.brand}</p>
            <h1>{t.product}</h1>
          </div>
        </div>

        <div className="hero-copy">
          <h2>{t.hero.title}</h2>
          <p>{t.hero.text}</p>
        </div>

        <div className="hero-stats" aria-label={t.controls.metrics}>
          {t.hero.stats.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="signal-grid">
          {t.hero.features.map((item, index) => {
            const icons = [ShieldCheck, UsersRound, BadgeCheck];
            const Icon = icons[index] || ShieldCheck;
            return (
              <div key={item.title}>
                <Icon size={20} />
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="form-panel">
        <div className="auth-card">
          <PreferenceBar
            theme={theme}
            language={language}
            accentId={accentId}
            t={t}
            onThemeChange={setTheme}
            onLanguageChange={setLanguage}
            onAccentChange={setAccentId}
          />

          <div className="mode-tabs" role="tablist" aria-label={t.controls.mode}>
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
              {t.modes.login}
            </button>
            <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
              {t.modes.register}
            </button>
          </div>

          <div className="form-heading">
            <Sparkles size={20} />
            <div>
              <h2>{mode === "login" ? t.heading.login : t.heading.register}</h2>
              <p>{selectedRole === "mentor" ? t.heading.mentorPortal : t.heading.internPortal}</p>
            </div>
          </div>

          <div className="role-grid">
            <RoleButton
              active={selectedRole === "mentor"}
              icon={BriefcaseBusiness}
              label={t.roles.mentor}
              onClick={() =>
                mode === "login"
                  ? updateLogin("role", "mentor")
                  : updateRegister("role", "mentor")
              }
            />
            <RoleButton
              active={selectedRole === "intern"}
              icon={GraduationCap}
              label={t.roles.intern}
              onClick={() =>
                mode === "login"
                  ? updateLogin("role", "intern")
                  : updateRegister("role", "intern")
              }
            />
          </div>

          {mode === "login" ? (
            <form className="access-form" onSubmit={handleLogin}>
              <Field icon={Mail} label={t.fields.email}>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => updateLogin("email", event.target.value)}
                  autoComplete="email"
                  required
                />
              </Field>
              <Field icon={Lock} label={t.fields.password}>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => updateLogin("password", event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </Field>
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                <span>{isSubmitting ? t.actions.validating : t.actions.login}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form className="access-form" onSubmit={handleRegister}>
              <Field icon={UserRound} label={t.fields.fullName}>
                <input
                  value={registerForm.fullName}
                  onChange={(event) => updateRegister("fullName", event.target.value)}
                  autoComplete="name"
                  required
                />
              </Field>
              <Field icon={Mail} label={t.fields.email}>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) => updateRegister("email", event.target.value)}
                  autoComplete="email"
                  required
                />
              </Field>
              <Field icon={Lock} label={t.fields.password}>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => updateRegister("password", event.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </Field>

              {registerForm.role === "mentor" ? (
                <Field icon={BriefcaseBusiness} label={t.fields.title}>
                  <input
                    value={registerForm.title}
                    onChange={(event) => updateRegister("title", event.target.value)}
                    placeholder={t.placeholders.title}
                  />
                </Field>
              ) : (
                <>
                  <Field icon={GraduationCap} label={t.fields.track}>
                    <select
                      value={registerForm.track}
                      onChange={(event) => updateRegister("track", event.target.value)}
                      required
                    >
                      <option value="">{t.placeholders.selectArea}</option>
                      {areaOptions.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field icon={UsersRound} label={t.fields.mentor}>
                    <select
                      value={registerForm.mentorId}
                      onChange={(event) => updateRegister("mentorId", event.target.value)}
                      required
                    >
                      <option value="">{t.placeholders.selectMentor}</option>
                      {mentors.map((mentor) => (
                        <option key={mentor.id} value={mentor.id}>
                          {mentor.full_name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field icon={BadgeCheck} label={t.fields.substituteMentor}>
                    <select
                      value={registerForm.substituteMentorId}
                      onChange={(event) => updateRegister("substituteMentorId", event.target.value)}
                    >
                      <option value="">{t.placeholders.noSubstitute}</option>
                      {mentors
                        .filter((mentor) => mentor.id !== registerForm.mentorId)
                        .map((mentor) => (
                          <option key={mentor.id} value={mentor.id}>
                            {mentor.full_name}
                          </option>
                        ))}
                    </select>
                  </Field>
                </>
              )}

              <button type="submit" className="submit-button" disabled={isSubmitting}>
                <span>{isSubmitting ? t.actions.creating : t.actions.create}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {feedback.message && (
            <p className={`feedback ${feedback.type}`} role="status">
              {feedback.message}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

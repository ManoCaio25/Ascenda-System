import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  GraduationCap,
  Lock,
  Mail,
  Orbit,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { redirectThroughLoading } from "./authStore";
import { getMentors, login, registerIntern, registerMentor } from "./services/authService";

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

export default function App() {
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentors, setMentors] = useState([]);

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
      setFeedback({ type: "success", message: "Acesso validado. Preparando ambiente..." });
      window.setTimeout(() => redirectThroughLoading(account), 380);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
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
      setFeedback({ type: "success", message: "Cadastro criado. Abrindo portal..." });
      window.setTimeout(() => redirectThroughLoading(account), 420);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
      setIsSubmitting(false);
    }
  };

  const activeForm = mode === "login" ? loginForm : registerForm;
  const selectedRole = activeForm.role;

  return (
    <main className="auth-shell">
      <section className="hero-panel" aria-label="Ascenda Access Hub">
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
            <p className="eyebrow">Ascenda System</p>
            <h1>Access Hub</h1>
          </div>
        </div>

        <div className="hero-copy">
          <h2>Portais conectados por mentoria operacional.</h2>
          <p>
            Cadastro, autenticação local e vínculo mentor-intern preparados para migrar direto para Supabase Auth.
          </p>
        </div>

        <div className="signal-grid">
          <div>
            <ShieldCheck size={20} />
            <span>Role-based access</span>
          </div>
          <div>
            <UsersRound size={20} />
            <span>Mentor ownership</span>
          </div>
          <div>
            <BadgeCheck size={20} />
            <span>Substitute mentor</span>
          </div>
        </div>
      </section>

      <section className="form-panel">
        <div className="mode-tabs" role="tablist" aria-label="Modo de acesso">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Entrar
          </button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            Cadastrar
          </button>
        </div>

        <div className="form-heading">
          <Sparkles size={20} />
          <div>
            <h2>{mode === "login" ? "Acessar portal" : "Criar conta operacional"}</h2>
            <p>{selectedRole === "mentor" ? "Mentor Portal" : "Portal do Estagiario"}</p>
          </div>
        </div>

        <div className="role-grid">
          <RoleButton
            active={selectedRole === "mentor"}
            icon={BriefcaseBusiness}
            label="Mentor"
            onClick={() =>
              mode === "login"
                ? updateLogin("role", "mentor")
                : updateRegister("role", "mentor")
            }
          />
          <RoleButton
            active={selectedRole === "intern"}
            icon={GraduationCap}
            label="Estagiario"
            onClick={() =>
              mode === "login"
                ? updateLogin("role", "intern")
                : updateRegister("role", "intern")
            }
          />
        </div>

        {mode === "login" ? (
          <form className="access-form" onSubmit={handleLogin}>
            <Field icon={Mail} label="E-mail">
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => updateLogin("email", event.target.value)}
                autoComplete="email"
                required
              />
            </Field>
            <Field icon={Lock} label="Senha">
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => updateLogin("password", event.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              <span>{isSubmitting ? "Validando..." : "Entrar"}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form className="access-form" onSubmit={handleRegister}>
            <Field icon={UserRound} label="Nome completo">
              <input
                value={registerForm.fullName}
                onChange={(event) => updateRegister("fullName", event.target.value)}
                autoComplete="name"
                required
              />
            </Field>
            <Field icon={Mail} label="E-mail">
              <input
                type="email"
                value={registerForm.email}
                onChange={(event) => updateRegister("email", event.target.value)}
                autoComplete="email"
                required
              />
            </Field>
            <Field icon={Lock} label="Senha">
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
              <Field icon={BriefcaseBusiness} label="Especialidade">
                <input
                  value={registerForm.title}
                  onChange={(event) => updateRegister("title", event.target.value)}
                  placeholder="Ex.: Frontend Mentor"
                />
              </Field>
            ) : (
              <>
                <Field icon={GraduationCap} label="Area / trilha">
                  <select
                    value={registerForm.track}
                    onChange={(event) => updateRegister("track", event.target.value)}
                    required
                  >
                    <option value="">Selecionar area</option>
                    {areaOptions.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field icon={UsersRound} label="Mentor principal">
                  <select
                    value={registerForm.mentorId}
                    onChange={(event) => updateRegister("mentorId", event.target.value)}
                    required
                  >
                    <option value="">Selecionar mentor</option>
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.full_name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field icon={BadgeCheck} label="Mentor substituto">
                  <select
                    value={registerForm.substituteMentorId}
                    onChange={(event) => updateRegister("substituteMentorId", event.target.value)}
                  >
                    <option value="">Sem substituto</option>
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
              <span>{isSubmitting ? "Criando..." : "Criar e entrar"}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {feedback.message && (
          <p className={`feedback ${feedback.type}`} role="status">
            {feedback.message}
          </p>
        )}
      </section>
    </main>
  );
}

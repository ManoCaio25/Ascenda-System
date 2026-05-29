export const languageOptions = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export const accentOptions = [
  { id: "cyan", label: "Cyan", value: "#67e8f9", pair: "#a78bfa" },
  { id: "emerald", label: "Emerald", value: "#34d399", pair: "#60a5fa" },
  { id: "violet", label: "Violet", value: "#a78bfa", pair: "#f0abfc" },
  { id: "amber", label: "Amber", value: "#fbbf24", pair: "#fb7185" },
];

export const translations = {
  pt: {
    appLabel: "Ascenda Access Hub",
    brand: "Ascenda System",
    product: "Access Hub",
    hero: {
      title: "Mentoria conectada.",
      text:
        "Um acesso para orientar trilhas, acompanhar evolucao e manter cada vinculo claro.",
      stats: [
        { value: "2", label: "portais conectados" },
        { value: "24/7", label: "acesso operacional" },
        { value: "IA", label: "atividades guiadas" },
      ],
      features: [
        { title: "Acesso por perfil", text: "Mentor e estagiario entram em fluxos separados." },
        { title: "Vinculo claro", text: "Cada estagiario aparece para seu mentor responsavel." },
        { title: "Substituto visivel", text: "O apoio alternativo aparece no portal do estagiario." },
      ],
    },
    controls: {
      preferences: "Preferencias de tela",
      mode: "Modo de acesso",
      metrics: "Indicadores de acesso",
      theme: "Tema",
      dark: "Escuro",
      light: "Claro",
      language: "Idioma",
      accent: "Cor",
    },
    modes: {
      login: "Entrar",
      register: "Cadastrar",
    },
    heading: {
      login: "Acessar portal",
      register: "Criar conta",
      mentorPortal: "Mentor Portal",
      internPortal: "Portal do Estagiario",
    },
    roles: {
      mentor: "Mentor",
      intern: "Estagiario",
    },
    fields: {
      email: "E-mail",
      password: "Senha",
      fullName: "Nome completo",
      title: "Especialidade",
      track: "Area / trilha",
      mentor: "Mentor principal",
      substituteMentor: "Mentor substituto",
    },
    placeholders: {
      title: "Ex.: Frontend Mentor",
      selectArea: "Selecionar area",
      selectMentor: "Selecionar mentor",
      noSubstitute: "Sem substituto",
    },
    actions: {
      login: "Entrar",
      validating: "Validando...",
      create: "Criar e entrar",
      creating: "Criando...",
    },
    feedback: {
      loginSuccess: "Acesso validado. Preparando ambiente...",
      registerSuccess: "Cadastro criado. Abrindo portal...",
      network: "Nao foi possivel conectar com a API. Confira VITE_API_URL e CORS_ORIGIN.",
      invalidAuth: "Resposta de autenticacao invalida.",
    },
  },
  en: {
    appLabel: "Ascenda Access Hub",
    brand: "Ascenda System",
    product: "Access Hub",
    hero: {
      title: "Connected mentoring.",
      text:
        "One access point to guide tracks, follow progress, and keep every ownership link clear.",
      stats: [
        { value: "2", label: "connected portals" },
        { value: "24/7", label: "operational access" },
        { value: "AI", label: "guided activities" },
      ],
      features: [
        { title: "Role access", text: "Mentors and interns enter separate workflows." },
        { title: "Clear ownership", text: "Each intern appears under the right mentor." },
        { title: "Visible backup", text: "The substitute mentor is shown to the intern." },
      ],
    },
    controls: {
      preferences: "Display preferences",
      mode: "Access mode",
      metrics: "Access metrics",
      theme: "Theme",
      dark: "Dark",
      light: "Light",
      language: "Language",
      accent: "Color",
    },
    modes: {
      login: "Sign in",
      register: "Create account",
    },
    heading: {
      login: "Access portal",
      register: "Create account",
      mentorPortal: "Mentor Portal",
      internPortal: "Intern Portal",
    },
    roles: {
      mentor: "Mentor",
      intern: "Intern",
    },
    fields: {
      email: "Email",
      password: "Password",
      fullName: "Full name",
      title: "Specialty",
      track: "Area / track",
      mentor: "Primary mentor",
      substituteMentor: "Substitute mentor",
    },
    placeholders: {
      title: "Ex.: Frontend Mentor",
      selectArea: "Select area",
      selectMentor: "Select mentor",
      noSubstitute: "No substitute",
    },
    actions: {
      login: "Sign in",
      validating: "Validating...",
      create: "Create and enter",
      creating: "Creating...",
    },
    feedback: {
      loginSuccess: "Access validated. Preparing workspace...",
      registerSuccess: "Account created. Opening portal...",
      network: "Could not connect to the API. Check VITE_API_URL and CORS_ORIGIN.",
      invalidAuth: "Invalid authentication response.",
    },
  },
  es: {
    appLabel: "Ascenda Access Hub",
    brand: "Ascenda System",
    product: "Access Hub",
    hero: {
      title: "Mentoria conectada.",
      text:
        "Un acceso para guiar rutas, seguir evolucion y mantener cada vinculo claro.",
      stats: [
        { value: "2", label: "portales conectados" },
        { value: "24/7", label: "acceso operativo" },
        { value: "IA", label: "actividades guiadas" },
      ],
      features: [
        { title: "Acceso por perfil", text: "Mentor y pasante entran en flujos separados." },
        { title: "Vinculo claro", text: "Cada pasante aparece para su mentor responsable." },
        { title: "Sustituto visible", text: "El apoyo alternativo aparece en el portal del pasante." },
      ],
    },
    controls: {
      preferences: "Preferencias de pantalla",
      mode: "Modo de acceso",
      metrics: "Indicadores de acceso",
      theme: "Tema",
      dark: "Oscuro",
      light: "Claro",
      language: "Idioma",
      accent: "Color",
    },
    modes: {
      login: "Entrar",
      register: "Registrar",
    },
    heading: {
      login: "Acceder al portal",
      register: "Crear cuenta",
      mentorPortal: "Mentor Portal",
      internPortal: "Portal del Pasante",
    },
    roles: {
      mentor: "Mentor",
      intern: "Pasante",
    },
    fields: {
      email: "Email",
      password: "Contrasena",
      fullName: "Nombre completo",
      title: "Especialidad",
      track: "Area / ruta",
      mentor: "Mentor principal",
      substituteMentor: "Mentor sustituto",
    },
    placeholders: {
      title: "Ej.: Frontend Mentor",
      selectArea: "Seleccionar area",
      selectMentor: "Seleccionar mentor",
      noSubstitute: "Sin sustituto",
    },
    actions: {
      login: "Entrar",
      validating: "Validando...",
      create: "Crear y entrar",
      creating: "Creando...",
    },
    feedback: {
      loginSuccess: "Acceso validado. Preparando entorno...",
      registerSuccess: "Cuenta creada. Abriendo portal...",
      network: "No fue posible conectar con la API. Revisa VITE_API_URL y CORS_ORIGIN.",
      invalidAuth: "Respuesta de autenticacion invalida.",
    },
  },
};

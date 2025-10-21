const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

// Alterna para o painel do Padrinho
registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

// Alterna para o painel do Estagiário
loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

const formPadrinho = document.querySelector(".form-container.sign-up form");
const formEstagiario = document.querySelector(".form-container.sign-in form");

const PADRINHO = {
  email: "paulo.henrique@ascenda.com",
  senha: "123456",
};

const ESTAGIARIO = {
  emails: new Set([
    "caio.alvarenga@ascenda.com",
    "caio.alvarenga@aperam.com",
  ]),
  senha: "123456",
};

function construirUrlLoading(alvo) {
  const url = new URL("./loading-page/index.html", window.location.href);
  url.searchParams.set("target", alvo);
  return url.toString();
}

function mostrarSucesso(tipo) {
  alert(`Login do ${tipo} bem-sucedido! Redirecionando...`);
}

function redirecionarParaLoading(alvo) {
  window.location.href = construirUrlLoading(alvo);
}

function obterValores(form) {
  const email = form.querySelector("input[name='email']")?.value?.trim() ?? "";
  const senha = form.querySelector("input[name='password']")?.value ?? "";
  return { email, senha };
}

formEstagiario.addEventListener("submit", (event) => {
  event.preventDefault();
  const { email, senha } = obterValores(formEstagiario);

  const emailValido = ESTAGIARIO.emails.has(email);
  const senhaValida = senha === ESTAGIARIO.senha;

  if (emailValido && senhaValida) {
    mostrarSucesso("Estagiário");
    redirecionarParaLoading("estagiario");
  } else {
    alert("Credenciais incorretas.");
  }
});

formPadrinho.addEventListener("submit", (event) => {
  event.preventDefault();
  const { email, senha } = obterValores(formPadrinho);

  const emailValido = email === PADRINHO.email;
  const senhaValida = senha === PADRINHO.senha;

  if (emailValido && senhaValida) {
    mostrarSucesso("Padrinho");
    redirecionarParaLoading("padrinho");
  } else {
    alert("Credenciais incorretas.");
  }
});

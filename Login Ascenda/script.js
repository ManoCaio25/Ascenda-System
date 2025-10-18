const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

const formPadrinho = document.querySelector(".form-container.sign-up form");
const formEstagiario = document.querySelector(".form-container.sign-in form");

function atualizarMensagem(form, mensagem, status = "") {
  const feedback = form.querySelector(".feedback-message");
  if (!feedback) {
    return;
  }

  feedback.textContent = mensagem;
  if (status) {
    feedback.dataset.status = status;
  } else {
    delete feedback.dataset.status;
  }
}

function limparMensagens() {
  atualizarMensagem(formPadrinho, "");
  atualizarMensagem(formEstagiario, "");
}

// Alterna para o painel do Padrinho
registerBtn.addEventListener("click", () => {
  container.classList.add("active");
  limparMensagens();
});

// Alterna para o painel do Estagiário
loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
  limparMensagens();
});

const PADRINHO = {
  nome: "Paulo Henrique Vieira",
  email: "paulo.henrique@ascenda.com",
  senha: "123456",
};

const ESTAGIARIO = {
  nome: "Caio Menezes",
  emails: new Set([
    "caio.alvarenga@ascenda.com",
    "caio.alvarenga@aperam.com",
  ]),
  senha: "123456",
};

function mostrarSucesso(form, tipo) {
  atualizarMensagem(
    form,
    `Login do ${tipo} bem-sucedido! Redirecionando...`,
    "success"
  );
}

function mostrarErro(form) {
  atualizarMensagem(form, "Credenciais incorretas.", "error");
}

function redirecionarParaLoading(alvo) {
  const destino = encodeURIComponent(alvo);
  setTimeout(() => {
    window.location.href = `../loading-page/index.html?target=${destino}`;
  }, 800);
}

function obterValores(form) {
  const nome = form.querySelector("input[name='name']")?.value?.trim() ?? "";
  const email = form.querySelector("input[name='email']")?.value?.trim() ?? "";
  const senha = form.querySelector("input[name='password']")?.value ?? "";
  return { nome, email, senha };
}

formEstagiario.addEventListener("submit", (event) => {
  event.preventDefault();
  const { nome, email, senha } = obterValores(formEstagiario);

  const nomeValido = nome === ESTAGIARIO.nome;
  const emailValido = ESTAGIARIO.emails.has(email);
  const senhaValida = senha === ESTAGIARIO.senha;

  if (nomeValido && emailValido && senhaValida) {
    mostrarSucesso(formEstagiario, "Estagiário");
    redirecionarParaLoading("estagiario");
  } else {
    mostrarErro(formEstagiario);
  }
});

formPadrinho.addEventListener("submit", (event) => {
  event.preventDefault();
  const { nome, email, senha } = obterValores(formPadrinho);

  const nomeValido = nome === PADRINHO.nome;
  const emailValido = email === PADRINHO.email;
  const senhaValida = senha === PADRINHO.senha;

  if (nomeValido && emailValido && senhaValida) {
    mostrarSucesso(formPadrinho, "Padrinho");
    redirecionarParaLoading("padrinho");
  } else {
    mostrarErro(formPadrinho);
  }
});

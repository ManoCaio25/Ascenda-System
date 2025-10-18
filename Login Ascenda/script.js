const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});
// Pega o container e os botões "Entrar" que só alternam os painéis
const container = document.getElementById("container");
const registerBtn = document.getElementById("register"); // Entrar (Padrinho) -> mostra painel Padrinho
const loginBtn = document.getElementById("login");       // Entrar (Estagiário) -> mostra painel Estagiário

// Alterna para o painel do Padrinho
registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

// Alterna para o painel do Estagiário
loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

// ---------- VALIDAÇÃO DE LOGIN NOS SUBMITS ----------

// Seleciona os formulários internos
const formPadrinho   = document.querySelector(".form-container.sign-up form");   // tem o botão "Sign Up"
const formEstagiario = document.querySelector(".form-container.sign-in form");   // tem o botão "Sign In"

// Lista de e-mails válidos para estagiários (todos com senha 123456)
const ESTAGIARIOS_VALIDOS = new Set([
  "lucas.oliveira@ascenda.com",
  "gabriela.gomes@ascenda.com",
  "leticia.alves@ascenda.com",
  "ana.carolina@ascenda.com",
  "iasmin.marozzi@ascenda.com",
]);

// Credenciais do Padrinho
const PADRINHO_EMAIL = "paulo.henrique@ascenda.com";
const PADRINHO_SENHA = "123456";
// Obs.: teu HTML não tem campo "Nome". Se quiser validar também o nome "Paulo Henrique Vieira",
// basta adicionar um <input type="text" placeholder="Name" /> e ler abaixo.

// Utilitário simples para mostrar erro (pode trocar por UI própria)
function erro(msg) {
  alert(msg);
}

// --- Submit do Estagiário (botão "Sign In" dentro do form .sign-in) ---
formEstagiario.addEventListener("submit", (e) => {
  e.preventDefault(); // evita recarregar a página

  // Lê os valores do form do Estagiário
  const email = formEstagiario.querySelector("input[type='email']")?.value?.trim() ?? "";
  const senha = formEstagiario.querySelector("input[type='password']")?.value ?? "";

  // Validação: e-mail deve estar na lista e senha deve ser 123456
  if (ESTAGIARIOS_VALIDOS.has(email) && senha === "123456") {
    // Sucesso: redirecione para a página do Estagiário (ajuste a rota conforme seu projeto)
    // window.location.href = "estagiario.html";
    alert("Login do Estagiário bem-sucedido!");
  } else {
    erro("Credenciais incorretas para Estagiário.");
  }
});

// --- Submit do Padrinho (botão "Sign Up" dentro do form .sign-up) ---
formPadrinho.addEventListener("submit", (e) => {
  e.preventDefault(); // evita recarregar a página

  // Lê os valores do form do Padrinho
  // Se adicionar o campo de Nome, descomente a linha abaixo e valide também:
  // const nome  = formPadrinho.querySelector("input[placeholder='Name']")?.value?.trim() ?? "";
  const email = formPadrinho.querySelector("input[type='email']")?.value?.trim() ?? "";
  const senha = formPadrinho.querySelector("input[type='password']")?.value ?? "";

  // Validação atual (email + senha). Para validar também o nome:
  // && nome === "Paulo Henrique Vieira"
  if (email === PADRINHO_EMAIL && senha === PADRINHO_SENHA) {
    // Sucesso: redirecione para a página do Padrinho (ajuste a rota conforme seu projeto)
    // window.location.href = "padrinho.html";
    alert("Login do Padrinho bem-sucedido!");
  } else {
    erro("Credenciais incorretas para Padrinho.");
  }
});

/*
======================== RESUMO ========================
- Os botões "Entrar" (ids login/register) continuam servindo só para alternar painéis.
- A verificação de credenciais acontece nos SUBMITS:
  * .sign-in (Sign In) -> valida Estagiários na lista + senha 123456.
  * .sign-up (Sign Up) -> valida Padrinho (email + 123456).
- Se quiser exigir também o NOME do Padrinho, adicione um input de texto no form
  do Padrinho e compare com "Paulo Henrique Vieira".
- Para produção, troque os alerts por UI de erro/feedback e faça o redirect real.
========================================================
*/

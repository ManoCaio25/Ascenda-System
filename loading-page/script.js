const HTML_LANG_MAP = { pt: "pt-BR", en: "en", es: "es" };

const LDX = {
  pt: {
    enter: "Entrando em órbita... apertem os cintos!",
    exit: "Preparar para retirada... missão concluída!"
  },
  en: {
    enter: "Entering orbit... fasten your seatbelts!",
    exit: "Preparing for exit... mission accomplished!"
  },
  es: {
    enter: "Entrando en órbita... ¡abrochen sus cinturones!",
    exit: "Preparando la retirada... ¡misión cumplida!"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const lang = sessionStorage.getItem("lang") || "pt";
  const mode = sessionStorage.getItem("mode") || "enter";
  const nextUrl = sessionStorage.getItem("nextUrl") || "/Login Ascenda/index.html";

  const tagline = document.getElementById("tagline");
  if (tagline) {
    tagline.textContent = (LDX[lang] && LDX[lang][mode]) ? LDX[lang][mode] : LDX.pt.enter;
  }

  const rocket = document.getElementById("rocket");
  if (rocket) {
    rocket.style.animationName = (mode === "exit") ? "fly-left" : "fly-right";
  }

  document.documentElement.lang = HTML_LANG_MAP[lang] || "en";

  setTimeout(() => {
    window.location.href = nextUrl;
  }, 7000);

  decorateStars();
});

function decorateStars() {
  const container = document.querySelector(".loading-container");
  if (!container) {
    return;
  }

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 80; i += 1) {
    const star = document.createElement("span");
    star.className = "star";
    star.style.setProperty("--x", `${Math.random() * 100}%`);
    star.style.setProperty("--y", `${Math.random() * 100}%`);
    star.style.setProperty("--d", `${2 + Math.random() * 3}s`);
    fragment.appendChild(star);
  }

  const starsLayer = document.createElement("div");
  starsLayer.className = "stars-layer";
  starsLayer.appendChild(fragment);
  container.appendChild(starsLayer);
}

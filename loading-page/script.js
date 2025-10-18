// Script para adicionar interatividade e efeitos extras
document.addEventListener('DOMContentLoaded', () => {
    const rocketWrapper = document.querySelector('.rocket-wrapper');
    const rocketGraphic = document.querySelector('.rocket');
    const tagline = document.querySelector('.tagline');
    const body = document.body;

    const LANGUAGE_KEY = 'lang';
    const MODE_KEY = 'mode';
    const NEXT_URL_KEY = 'nextUrl';
    const DEFAULT_LANG = 'pt';
    const DEFAULT_MODE = 'enter';
    const REDIRECT_DELAY = 7000;
    const HTML_LANG_MAP = { pt: 'pt-BR', en: 'en', es: 'es' };

    const taglineTranslations = {
        pt: {
            enter: 'Entrando em órbita… preparando cockpit.',
            exit: 'Saindo da órbita… até breve, comandante.'
        },
        en: {
            enter: 'Entering orbit… preparing cockpit.',
            exit: 'Leaving orbit… see you soon, commander.'
        },
        es: {
            enter: 'Entrando en órbita… preparando la cabina.',
            exit: 'Saliendo de la órbita… hasta pronto, comandante.'
        }
    };

    const currentLang = resolveLanguage();
    const currentMode = resolveMode();

    document.documentElement.lang = HTML_LANG_MAP[currentLang] || 'en';
    applyTagline(currentLang, currentMode);
    animateRocket(currentMode);
    scheduleRedirect();

    // Criar partículas de fundo (estrelas)
    createStars();

    // Adicionar efeito de clique no foguete
    if (rocketWrapper) {
        rocketWrapper.addEventListener('click', () => {
            if (!rocketGraphic) {
                return;
            }
            rocketGraphic.style.animation = 'none';
            setTimeout(() => {
                rocketGraphic.style.animation = 'rocketFloat 3s ease-in-out infinite';
            }, 10);
        });
    }
    
    // Função para criar estrelas no fundo
    function createStars() {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        starsContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        
        // Criar 100 estrelas
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            
            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: #9B4DB8;
                border-radius: 50%;
                left: ${x}%;
                top: ${y}%;
                box-shadow: 0 0 ${size * 2}px #7B2D8E;
                animation: twinkle ${duration}s ease-in-out ${delay}s infinite;
            `;
            
            starsContainer.appendChild(star);
        }
        
        body.appendChild(starsContainer);
        
        // Adicionar animação de piscar para as estrelas
        const style = document.createElement('style');
        style.textContent = `
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Adicionar efeito de partículas ao redor do foguete
    function createRocketParticles() {
        if (!rocketWrapper) {
            return;
        }

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'rocket-particles';
        particlesContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            height: 200px;
            pointer-events: none;
        `;
        
        rocketWrapper.appendChild(particlesContainer);
        
        setInterval(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: #FFD93D;
                border-radius: 50%;
                left: 20%;
                top: 50%;
                box-shadow: 0 0 10px #FF6B35;
                animation: particleMove 1s ease-out forwards;
            `;
            
            particlesContainer.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }, 100);
        
        // Adicionar animação de partículas
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleMove {
                0% {
                    transform: translate(0, 0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(${-50 - Math.random() * 50}px, ${(Math.random() - 0.5) * 40}px) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    createRocketParticles();

    // Log de inicialização
    console.log('🚀 Rocket Loading Animation initialized!');
    console.log('✨ Features: Purple rocket, fire effects, animated loading lines');

    function resolveLanguage() {
        try {
            const stored = sessionStorage.getItem(LANGUAGE_KEY);
            if (stored && taglineTranslations[stored]) {
                return stored;
            }
        } catch (error) {
            console.warn('sessionStorage unavailable', error);
        }
        return DEFAULT_LANG;
    }

    function resolveMode() {
        try {
            const stored = sessionStorage.getItem(MODE_KEY);
            if (stored === 'enter' || stored === 'exit') {
                return stored;
            }
        } catch (error) {
            console.warn('sessionStorage unavailable', error);
        }
        return DEFAULT_MODE;
    }

    function applyTagline(lang, mode) {
        if (!tagline) {
            return;
        }
        const dictionary = taglineTranslations[lang] || taglineTranslations[DEFAULT_LANG];
        const phrase = mode === 'exit' ? dictionary.exit : dictionary.enter;
        tagline.textContent = phrase;
    }

    function animateRocket(mode) {
        if (!rocketWrapper) {
            return;
        }
        const animationClass = mode === 'exit' ? 'fly-left' : 'fly-right';
        rocketWrapper.classList.remove('fly-left', 'fly-right');
        rocketWrapper.classList.add(animationClass);
    }

    function scheduleRedirect() {
        let nextUrl = '/Login Ascenda/index.html';
        try {
            nextUrl = sessionStorage.getItem(NEXT_URL_KEY) || nextUrl;
        } catch (error) {
            console.warn('sessionStorage unavailable', error);
        }
        setTimeout(() => {
            window.location.href = nextUrl;
        }, REDIRECT_DELAY);
    }
});


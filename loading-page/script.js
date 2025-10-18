// Script para adicionar interatividade e efeitos extras
document.addEventListener('DOMContentLoaded', () => {
    const rocket = document.querySelector('.rocket-wrapper');
    const body = document.body;
    
    // Criar partículas de fundo (estrelas)
    createStars();
    
    // Adicionar efeito de clique no foguete
    rocket.addEventListener('click', () => {
        rocket.style.animation = 'none';
        setTimeout(() => {
            rocket.style.animation = 'rocketFloat 3s ease-in-out infinite';
        }, 10);
    });
    
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
        
        rocket.appendChild(particlesContainer);
        
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
});


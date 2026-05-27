# 🚀 Rocket Loading Animation

Animação de carregamento inspirada no Xbox Cloud Gaming, personalizada com foguete roxo escuro e efeitos de fogo.

## 📋 Características

- **Foguete espacial** com design roxo escuro (#4A1A5C, #7B2D8E)
- **Chamas animadas** saindo da traseira do foguete (laranja, amarelo e branco)
- **Linhas de carregamento** que se movem horizontalmente acima e abaixo
- **Badge BETA** com efeito de pulsação
- **Estrelas piscando** no fundo escuro
- **Partículas de fogo** saindo do propulsor
- **Efeito de flutuação** suave do foguete
- **Totalmente responsivo** para desktop, tablet e mobile

## 🎨 Paleta de Cores

| Elemento | Cor | Código |
|----------|-----|--------|
| Fundo principal | Azul escuro | `#0f0f1e` / `#1a1a2e` |
| Corpo do foguete | Roxo escuro | `#4A1A5C` |
| Contornos e linhas | Roxo médio | `#7B2D8E` |
| Detalhes | Roxo claro | `#9B4DB8` |
| Chama principal | Laranja | `#FF6B35` |
| Chama secundária | Amarelo | `#FFD93D` |
| Chama interna | Branco | `#FFF` |

## 🚀 Como Usar

### Método 1: Abrir diretamente no navegador

1. Abra o arquivo `index.html` em qualquer navegador moderno
2. A animação começará automaticamente

### Método 2: Servidor local

```bash
# Usando Python
python3 -m http.server 8000

# Usando Node.js
npx serve

# Usando PHP
php -S localhost:8000
```

Depois acesse: `http://localhost:8000`

## 📁 Estrutura de Arquivos

```
rocket-loading/
├── index.html      # Estrutura HTML principal
├── style.css       # Estilos e animações CSS
├── script.js       # JavaScript para efeitos extras
└── README.md       # Este arquivo
```

## 🎯 Elementos da Animação

### 1. Foguete
- Corpo principal em roxo escuro
- Nariz pontiagudo
- Asas superior e inferior
- Janela circular
- Detalhes decorativos
- Propulsor traseiro

### 2. Chamas
- **Chama principal**: Laranja, maior amplitude
- **Chama secundária**: Amarelo, média amplitude
- **Chama interna**: Branco, menor amplitude
- Todas com animação SVG em loop

### 3. Linhas de Carregamento
- 5 linhas superiores (movem da esquerda para direita)
- 5 linhas inferiores (movem da direita para esquerda)
- Diferentes velocidades e delays
- Efeito de fade in/out

### 4. Efeitos Extras
- 100 estrelas piscando aleatoriamente
- Partículas de fogo saindo do propulsor
- Efeito de flutuação vertical do foguete
- Brilho pulsante no corpo do foguete

## ⚙️ Personalização

### Alterar Cores

Edite o arquivo `style.css` e modifique as variáveis de cor:

```css
/* Exemplo: mudar para tema azul */
background: linear-gradient(135deg, #0a1929 0%, #1e3a5f 50%, #0a1929 100%);
fill: "#1976d2"; /* Corpo do foguete */
stroke: "#42a5f5"; /* Contornos */
```

### Alterar Velocidade

Modifique os valores de `duration` nas animações:

```css
/* Mais rápido */
animation: rocketFloat 1.5s ease-in-out infinite;

/* Mais lento */
animation: rocketFloat 5s ease-in-out infinite;
```

### Remover Elementos

Comente ou remova seções no HTML:

```html
<!-- Para remover estrelas, comente esta linha no script.js -->
<!-- createStars(); -->

<!-- Para remover o badge BETA -->
<!-- <div class="beta-badge">BETA</div> -->
```

## 🌐 Compatibilidade

- ✅ Chrome/Edge (versão 90+)
- ✅ Firefox (versão 88+)
- ✅ Safari (versão 14+)
- ✅ Opera (versão 76+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsividade

A animação se adapta automaticamente a diferentes tamanhos de tela:

- **Desktop**: Foguete 300px, linhas completas
- **Tablet** (≤768px): Foguete 200px, linhas ajustadas
- **Mobile** (≤480px): Foguete 150px, elementos compactos

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Animações, gradientes, transformações
- **SVG**: Gráficos vetoriais do foguete e chamas
- **JavaScript (Vanilla)**: Efeitos interativos e partículas

## 💡 Dicas de Uso

1. **Como tela de carregamento**: Integre em seu app/site durante carregamento de dados
2. **Como splash screen**: Use como tela inicial de aplicações
3. **Como página de manutenção**: Exiba durante updates do sistema
4. **Como elemento decorativo**: Adicione em seções específicas

## 🎬 Animações Implementadas

| Animação | Duração | Tipo | Elemento |
|----------|---------|------|----------|
| `rocketFloat` | 3s | ease-in-out | Foguete (movimento vertical) |
| `rocketGlow` | 2s | ease-in-out | Foguete (brilho) |
| `flameIntensity` | 0.5s | ease-in-out | Chamas (escala) |
| `slideLineTop` | 2s | ease-in-out | Linhas superiores |
| `slideLineBottom` | 2s | ease-in-out | Linhas inferiores |
| `badgePulse` | 2s | ease-in-out | Badge BETA |
| `twinkle` | 2-5s | ease-in-out | Estrelas |
| `particleMove` | 1s | ease-out | Partículas |

## 📝 Licença

Este projeto é de uso livre. Sinta-se à vontade para modificar e usar em seus projetos pessoais ou comerciais.

## 🤝 Contribuições

Sugestões de melhorias:
- Adicionar sons de foguete
- Implementar diferentes temas de cor
- Criar variações de velocidade
- Adicionar mais tipos de naves espaciais

## 📧 Suporte

Para dúvidas ou sugestões, sinta-se à vontade para entrar em contato!

---

**Desenvolvido com 💜 e muito café ☕**

*Inspirado na tela de carregamento do Xbox Cloud Gaming*


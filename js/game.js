/* =========================================
   ESTADO DEL JUEGO (State Management)
   ========================================= */
const state = {
    score: 0,
    streak: 0, // Racha actual de aciertos consecutivos
    currentLevel: 1,
    currentQuestionIndex: 0,
    levelQuestions: [], // Aquí cargaremos las preguntas del nivel actual
    playerName: "",
    timeLeft: 15.0,     // Temporizador activo
    timerId: null
};

// Configuración de Puntuación
const POINTS_CORRECT = 100;
const POINTS_WRONG = -50;
const QUESTIONS_PER_LEVEL = 5; // Usaremos 5 preguntas por nivel

/* =========================================
   REFERENCIAS AL DOM (Interfaz)
   ========================================= */
// Capturamos todos los elementos HTML que necesitamos manipular
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    level: document.getElementById('level-screen'),
    end: document.getElementById('end-screen')
};

const ui = {
    rankDisplay: document.getElementById('rank-display'),
    levelDisplay: document.getElementById('level-display'),
    streakDisplay: document.getElementById('streak-display'),
    scoreDisplay: document.getElementById('score-display'),
    progressBar: document.getElementById('progress-bar'),
    timeBar: document.getElementById('time-bar'),
    timeText: document.getElementById('time-text'),
    questionType: document.getElementById('question-type'),
    questionContent: document.getElementById('question-content'),
    feedbackArea: document.getElementById('feedback-area'),
    btnSafe: document.getElementById('btn-safe'),
    btnSus: document.getElementById('btn-sus'),
    btnNext: document.getElementById('btn-next'),
    levelScore: document.getElementById('level-score'),
    levelTip: document.getElementById('level-tip'),
    finalScore: document.getElementById('final-score'),
    playerAlias: document.getElementById('player-alias'),
    leaderboardList: document.getElementById('leaderboard-list')
};

/* =========================================
   SISTEMA DE SONIDO (Arcade Synth)
   ========================================= */
// Creamos sonidos sintéticos simples sin cargar archivos externos.
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'success') {
        // Sonido high-tech blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    }
    else if (type === 'error') {
        // Sonido grave distorsionado (Glitch/Error)
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    }
    else if (type === 'click') {
        // Tech UI click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    }
}

/* =========================================
   LÓGICA DEL JUEGO (Game Loop)
   ========================================= */

// Event Listeners (Escuchadores de eventos)
document.getElementById('start-btn').addEventListener('click', () => { playSound('click'); startGame(); });
document.getElementById('next-level-btn').addEventListener('click', () => { playSound('click'); startNextLevel(); });
document.getElementById('restart-btn').addEventListener('click', () => location.reload());
document.getElementById('restart-btn').addEventListener('click', () => location.reload());
document.getElementById('save-score-btn').addEventListener('click', () => { playSound('click'); saveScore(); });
document.getElementById('quit-btn').addEventListener('click', () => {
    if (confirm("¿Seguro que quieres abortar la misión? Perderás tu progreso.")) {
        location.reload();
    }
});

// Botones de decisión (Seguro vs Sospechoso)
ui.btnSafe.addEventListener('click', () => handleAnswer(false));
ui.btnSus.addEventListener('click', () => handleAnswer(true));
ui.btnNext.addEventListener('click', () => { playSound('click'); nextQuestion(); });

// Función para iniciar el juego desde cero
function startGame() {
    state.score = 0;
    state.streak = 0;
    state.currentLevel = 0; // Se incrementará en startNextLevel
    switchScreen('game');   // Cambiar a pantalla de juego
    startNextLevel();       // Cargar Nivel 1
}

// Carga el siguiente nivel y sus preguntas
function startNextLevel() {
    state.currentLevel++;

    // Condición de victoria final (ahora hay 7 niveles)
    if (state.currentLevel > 7) {
        endGame();
        return;
    }

    state.currentQuestionIndex = 0;

    // Cambiar Rango y Tema de Color basado en el Nivel
    updateRankAndTheme(state.currentLevel);

    // Filtramos las preguntas correspondientes al nivel actual
    state.levelQuestions = questionsDB.filter(q => q.level === state.currentLevel);

    // Barajamos (Shuffle) las preguntas para que no salgan siempre en el mismo orden
    // Algoritmo Fisher-Yates simple
    for (let i = state.levelQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.levelQuestions[i], state.levelQuestions[j]] = [state.levelQuestions[j], state.levelQuestions[i]];
    }

    updateHUD(); // Actualizar textos de nivel y puntos
    switchScreen('game');
    loadQuestion();
}

// Función auxiliar para cambiar visibilidad de pantallas
function switchScreen(screenName) {
    // Primero ocultamos todas
    Object.values(screens).forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('active');
    });

    // Mostramos la elegida
    screens[screenName].classList.remove('hidden');
    void screens[screenName].offsetWidth; // Forzar repintado (reflow) para animaciones
    screens[screenName].classList.add('active');
}

// Actualiza HUD (Heads Up Display)
function updateHUD() {
    ui.levelDisplay.textContent = state.currentLevel;
    ui.scoreDisplay.textContent = state.score;
    ui.streakDisplay.textContent = state.streak;

    // Efecto visual si racha >= 3 (modificado previemante de 5)
    if (state.streak >= 3) {
        ui.streakDisplay.classList.add('on-fire');
    } else {
        ui.streakDisplay.classList.remove('on-fire');
    }

    updateProgress();
}

// Actualiza el Rango visual y el Color Tema general de CSS en base al Nivel
function updateRankAndTheme(level) {
    let rankName = "NOVATO";
    let hueValue = 180; // Default Cyan

    if (level === 1) { rankName = "RECLUTA"; hueValue = 180; } // Cyan
    else if (level === 2) { rankName = "BECARIO"; hueValue = 210; } // Azulado
    else if (level === 3) { rankName = "TÉCNICO"; hueValue = 120; } // Verde MATRIX
    else if (level === 4) { rankName = "AGENTE"; hueValue = 280; } // Púrpura Netrunner
    else if (level === 5) { rankName = "ESPECIALISTA"; hueValue = 30; } // Naranja Alerta
    else if (level === 6) { rankName = "ELITE"; hueValue = 330; } // Rosa Neón
    else if (level >= 7) { rankName = "MAESTRO HACKER"; hueValue = 0; } // Rojo Diablo

    ui.rankDisplay.textContent = rankName;
    document.documentElement.style.setProperty('--theme-hue', hueValue);
}

// Barra de progreso visual
function updateProgress() {
    const total = state.levelQuestions.length;
    const current = state.currentQuestionIndex;
    const percentage = (current / total) * 100;
    ui.progressBar.style.width = `${percentage}%`;
}

// Cargar la pregunta actual en la tarjeta
function loadQuestion() {
    // Limpiamos el estado visual anterior
    ui.feedbackArea.classList.add('hidden');
    ui.feedbackArea.className = 'feedback hidden';
    ui.btnSafe.disabled = false;
    ui.btnSus.disabled = false;
    ui.btnNext.classList.add('hidden');
    ui.btnSafe.classList.remove('hidden');
    ui.btnSus.classList.remove('hidden');

    // Obtenemos datos de la pregunta
    const q = state.levelQuestions[state.currentQuestionIndex];

    // Renderizamos contenido HTML seguro
    ui.questionType.textContent = q.type === 'email' ? 'Email Entrante' : 'Sitio Web / URL';
    ui.questionContent.innerHTML = q.content;

    updateProgress();
    startTimer();
}

// Iniciar temporizador
function startTimer() {
    clearInterval(state.timerId);
    state.timeLeft = 15.0; // 15 segundos máximo por pregunta
    ui.timeBar.style.width = '100%';
    ui.timeBar.className = 'time-bar';
    ui.timeText.textContent = state.timeLeft.toFixed(1);

    state.timerId = setInterval(() => {
        state.timeLeft -= 0.1;

        if (state.timeLeft <= 0) {
            // Tiempo Agotado = Fallo forzado
            state.timeLeft = 0;
            clearInterval(state.timerId);
            handleAnswer(null, true);
        } else {
            ui.timeText.textContent = state.timeLeft.toFixed(1);
            const percentage = (state.timeLeft / 15.0) * 100;
            ui.timeBar.style.width = `${percentage}%`;

            if (state.timeLeft < 5 && state.timeLeft >= 2) {
                ui.timeBar.className = 'time-bar warning';
            } else if (state.timeLeft < 2) {
                ui.timeBar.className = 'time-bar danger';
            }
        }
    }, 100);
}

// Verificar respuesta del usuario ("isTimeoutMode" true indica que falló por expiración de tiempo)
function handleAnswer(userSaysPhishing, isTimeoutMode = false) {
    clearInterval(state.timerId); // Detenemos el tiempo apenas responda

    const q = state.levelQuestions[state.currentQuestionIndex];

    // Si la función se llama por timeout, cuenta automáticamente como incorrecta.
    const isCorrect = isTimeoutMode ? false : (userSaysPhishing === q.isPhishing);

    // Ocultar botones de decisión para dejar solo el de Siguiente
    ui.btnSafe.classList.add('hidden');
    ui.btnSus.classList.add('hidden');

    if (isCorrect) {
        // Acierto
        state.streak++;

        // Bonus Dinámico por Tiempo: base(100) + segundos restantes * 10
        const timeBonus = Math.floor(state.timeLeft * 10);
        let points = POINTS_CORRECT + timeBonus;
        let bonusMsg = ` :: SPEED BONUS +${timeBonus}`;

        // Lógica de Racha Extra
        if (state.streak >= 3) {
            const streakBonus = state.streak * 5;
            points += streakBonus;
            bonusMsg += ` :: COMBO +${streakBonus}`;
        }

        state.score += points;
        showFeedback(true, `[ DOMINIO VERIFICADO ]${bonusMsg} :: ${q.explanation}`);
        playSound('success');
    } else {
        // Fallo
        state.streak = 0;
        state.score += POINTS_WRONG;
        if (state.score < 0) state.score = 0;

        let errorReason = isTimeoutMode ? "[ TIEMPO AGOTADO ]" : "[ RIESGO DETECTADO ]";
        showFeedback(false, `${errorReason} ${q.explanation}`);
        playSound('error');

        // Efecto Screen Shake de daño global
        document.body.classList.remove('glitch-container-active');
        void document.body.offsetWidth;
        document.body.classList.add('glitch-container-active');
    }

    // Actualizar HUD completo (Puntos y Racha) en tiempo real
    updateHUD();

    ui.btnNext.classList.remove('hidden'); // Mostrar botón de continuar
}

// Mostrar mensaje de resultado
function showFeedback(isSuccess, message) {
    ui.feedbackArea.textContent = message;
    ui.feedbackArea.classList.remove('hidden', 'success', 'error');
    ui.feedbackArea.classList.add(isSuccess ? 'success' : 'error');

    // Trigger Glitch Animation on Feedback
    ui.feedbackArea.classList.remove('glitch-container-active');
    void ui.feedbackArea.offsetWidth; // Force reflow
    ui.feedbackArea.classList.add('glitch-container-active');
}

// Inicializar efectos Glitch en botones al cargar
function initGlitchEffect() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        // Encontrar nodo de texto directo
        const textNode = Array.from(btn.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);

        if (textNode) {
            const span = document.createElement('span');
            span.className = 'glitch-text';
            span.setAttribute('data-text', textNode.textContent.trim());
            span.textContent = textNode.textContent.trim();

            btn.replaceChild(span, textNode);
        }
    });
}

// Start Game + Init
initGlitchEffect();

// Avanzar a siguiente pregunta o nivel
function nextQuestion() {
    state.currentQuestionIndex++;

    if (state.currentQuestionIndex >= state.levelQuestions.length) {
        showLevelComplete();
    } else {
        loadQuestion();
    }
}

// Pantalla intermedia de nivel
function showLevelComplete() {
    ui.levelScore.textContent = state.score;

    // Consejos específicos según el nivel superado
    const tips = [
        "NIVEL 1 SUPERADO: Recuerda, los bancos nunca piden contraseñas por email.",
        "NIVEL 2 SUPERADO: Verifica siempre las extensiones de archivos adjuntos (.exe, .js).",
        "NIVEL 3 SUPERADO: Los ataques homográficos usan letras parecidas para engañarte.",
        "NIVEL 4 SUPERADO: En móviles, desconfía de SMS (Smishing) y códigos QR en la calle.",
        "NIVEL 5 SUPERADO: Cuidado con las ventanas falsas en navegadores (BitB) y la ingeniería social avanzada."
    ];
    ui.levelTip.textContent = tips[state.currentLevel - 1] || "¡Buen trabajo!";

    switchScreen('level');
}

// Pantalla final del juego
function endGame() {
    ui.finalScore.textContent = state.score;
    renderLeaderboard(); // Mostrar ranking actual antes de guardar
    switchScreen('end');
}

/* =========================================
   PERSISTENCIA (LocalStorage)
   ========================================= */

// Guardar puntuación
function saveScore() {
    const name = ui.playerAlias.value.trim() || "Agente Anónimo";
    const newEntry = { name, score: state.score, date: new Date().toLocaleDateString() };

    // Recuperar datos existentes
    let leaderboard = JSON.parse(localStorage.getItem('phishquest_leaderboard') || '[]');
    leaderboard.push(newEntry);

    // Ordenar por puntuación descendente
    leaderboard.sort((a, b) => b.score - a.score);
    // Mantener solo los TOP 5
    leaderboard = leaderboard.slice(0, 5);

    // Guardar
    localStorage.setItem('phishquest_leaderboard', JSON.stringify(leaderboard));

    // Actualizar UI
    renderLeaderboard();

    // Feedback visual
    const btn = document.getElementById('save-score-btn');
    btn.disabled = true;
    btn.textContent = "¡Guardado!";
    btn.style.borderColor = "var(--accent-green)";
}

// Renderizar tabla de posiciones
function renderLeaderboard() {
    const list = ui.leaderboardList;
    list.innerHTML = ""; // Limpiar lista

    let leaderboard = JSON.parse(localStorage.getItem('phishquest_leaderboard') || '[]');

    if (leaderboard.length === 0) {
        list.innerHTML = "<li style='text-align:center;'>Sin registros. ¡Sé el primero!</li>";
        return;
    }

    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        // Iconos para top 3
        let rankIcon = `#${index + 1}`;
        if (index === 0) rankIcon = '🥇';
        if (index === 1) rankIcon = '🥈';
        if (index === 2) rankIcon = '🥉';

        li.innerHTML = `
            <span>${rankIcon} ${entry.name}</span>
            <span>${entry.score} pts</span>
        `;
        list.appendChild(li);
    });
}

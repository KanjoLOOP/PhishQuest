/* =========================================
   ESTADO DEL JUEGO (State Management)
   ========================================= */
const state = {
    mode: 'exam',           // 'exam' (tiempo + puntos) | 'training' (sin presión)
    score: 0,
    streak: 0,              // Racha actual de aciertos consecutivos
    currentLevel: 1,
    currentQuestionIndex: 0,
    levelQuestions: [],     // Preguntas del nivel actual
    levelCorrect: 0,        // Aciertos del nivel (para precisión del informe)
    totalCorrect: 0,        // Aciertos globales (precisión final)
    totalAnswered: 0,
    playerName: "",
    timeLeft: 15.0,
    timerId: null,
    answered: false         // Bloqueo de doble respuesta / teclado
};

// Configuración de Puntuación
const POINTS_CORRECT = 100;
const POINTS_WRONG = -50;
const MAX_LEVEL = 7;
const TIME_PER_QUESTION = 15.0;

// Tabla de rangos por nivel (nombre + hue del acento)
const RANKS = {
    1: { name: "RECLUTA", hue: 38 },       // Ámbar base
    2: { name: "BECARIO", hue: 200 },      // Azul acero
    3: { name: "TÉCNICO", hue: 150 },      // Verde señal
    4: { name: "AGENTE", hue: 270 },       // Violeta
    5: { name: "ESPECIALISTA", hue: 20 },  // Naranja
    6: { name: "ELITE", hue: 330 },        // Magenta
    7: { name: "MAESTRO HACKER", hue: 0 }  // Rojo
};

/* =========================================
   REFERENCIAS AL DOM
   ========================================= */
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    level: document.getElementById('level-screen'),
    end: document.getElementById('end-screen')
};

const ui = {
    rankDisplay: document.getElementById('rank-display'),
    threatMeter: document.getElementById('threat-meter'),
    streakChip: document.getElementById('streak-chip'),
    streakDisplay: document.getElementById('streak-display'),
    scoreDisplay: document.getElementById('score-display'),
    timeBar: document.getElementById('time-bar'),
    timeText: document.getElementById('time-text'),
    modeTag: document.getElementById('mode-tag'),
    caseNumber: document.getElementById('case-number'),
    caseProgress: document.getElementById('case-progress'),
    caseType: document.getElementById('case-type'),
    specimen: document.getElementById('specimen'),
    specimenChromeLabel: document.getElementById('specimen-chrome-label'),
    questionContent: document.getElementById('question-content'),
    scanbeam: document.getElementById('scanbeam'),
    stamp: document.getElementById('stamp'),
    stampText: document.getElementById('stamp-text'),
    feedbackArea: document.getElementById('feedback-area'),
    analysisVerdict: document.getElementById('analysis-verdict'),
    analysisPoints: document.getElementById('analysis-points'),
    analysisText: document.getElementById('analysis-text'),
    btnSafe: document.getElementById('btn-safe'),
    btnSus: document.getElementById('btn-sus'),
    btnNext: document.getElementById('btn-next'),
    levelScore: document.getElementById('level-score'),
    levelAccuracy: document.getElementById('level-accuracy'),
    levelNextRank: document.getElementById('level-next-rank'),
    levelTip: document.getElementById('level-tip'),
    finalScore: document.getElementById('final-score'),
    finalAccuracy: document.getElementById('final-accuracy'),
    finalRank: document.getElementById('final-rank'),
    playerAlias: document.getElementById('player-alias'),
    leaderboardList: document.getElementById('leaderboard-list'),
    bestAgent: document.getElementById('best-agent'),
    bestAgentText: document.getElementById('best-agent-text')
};

/* =========================================
   SISTEMA DE SONIDO (Synth minimalista)
   ========================================= */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const t = audioCtx.currentTime;

    if (type === 'success') {
        // Doble blip ascendente limpio
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, t);
        osc.frequency.setValueAtTime(990, t + 0.09);
        gainNode.gain.setValueAtTime(0.001, t);
        gainNode.gain.linearRampToValueAtTime(0.18, t + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.25);
    }
    else if (type === 'error') {
        // Zumbido grave descendente
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.linearRampToValueAtTime(55, t + 0.35);
        gainNode.gain.setValueAtTime(0.12, t);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
    }
    else if (type === 'stamp') {
        // Golpe seco de sello (thud)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
        gainNode.gain.setValueAtTime(0.35, t);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
    }
    else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        gainNode.gain.setValueAtTime(0.08, t);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
    }
}

/* =========================================
   EVENT LISTENERS
   ========================================= */
document.getElementById('mode-training-btn').addEventListener('click', () => { playSound('click'); startGame('training'); });
document.getElementById('mode-exam-btn').addEventListener('click', () => { playSound('click'); startGame('exam'); });
document.getElementById('next-level-btn').addEventListener('click', () => { playSound('click'); startNextLevel(); });
document.getElementById('restart-btn').addEventListener('click', () => location.reload());
document.getElementById('save-score-btn').addEventListener('click', () => { playSound('click'); saveScore(); });
document.getElementById('quit-btn').addEventListener('click', () => {
    if (confirm("¿Abandonar el turno? Perderás tu progreso.")) {
        location.reload();
    }
});

ui.btnSafe.addEventListener('click', () => handleAnswer(false));
ui.btnSus.addEventListener('click', () => handleAnswer(true));
ui.btnNext.addEventListener('click', () => { playSound('click'); nextQuestion(); });

// Atajos de teclado: L = legítimo, F = fraude, Enter/Espacio = siguiente
document.addEventListener('keydown', (e) => {
    if (!screens.game.classList.contains('active')) return;
    if (e.target.tagName === 'INPUT') return;

    const key = e.key.toLowerCase();

    if (!state.answered) {
        if (key === 'l') handleAnswer(false);
        else if (key === 'f') handleAnswer(true);
    } else if (key === 'enter' || key === ' ') {
        e.preventDefault();
        playSound('click');
        nextQuestion();
    }
});

/* =========================================
   FLUJO DEL JUEGO
   ========================================= */
function startGame(mode) {
    state.mode = mode;
    state.score = 0;
    state.streak = 0;
    state.totalCorrect = 0;
    state.totalAnswered = 0;
    state.currentLevel = 0; // Se incrementa en startNextLevel

    // El modo entrenamiento oculta tiempo/puntos/racha vía CSS
    document.body.classList.toggle('mode-training', mode === 'training');
    ui.modeTag.textContent = mode === 'training' ? 'ENTRENAMIENTO' : 'EXAMEN';

    startNextLevel();
}

function startNextLevel() {
    state.currentLevel++;

    if (state.currentLevel > MAX_LEVEL) {
        endGame();
        return;
    }

    state.currentQuestionIndex = 0;
    state.levelCorrect = 0;

    updateRankAndTheme(state.currentLevel);

    // Preguntas del nivel, barajadas (Fisher-Yates)
    state.levelQuestions = questionsDB.filter(q => q.level === state.currentLevel);
    for (let i = state.levelQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.levelQuestions[i], state.levelQuestions[j]] = [state.levelQuestions[j], state.levelQuestions[i]];
    }

    updateHUD();
    switchScreen('game');
    loadQuestion();
}

function switchScreen(screenName) {
    Object.values(screens).forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('active');
    });
    screens[screenName].classList.remove('hidden');
    void screens[screenName].offsetWidth; // Reflow para reiniciar animación de entrada
    screens[screenName].classList.add('active');
}

function updateHUD() {
    ui.scoreDisplay.textContent = state.score;
    ui.streakDisplay.textContent = `×${state.streak}`;
    ui.streakChip.classList.toggle('on-fire', state.streak >= 3);
}

// Rango + acento de color del nivel
function updateRankAndTheme(level) {
    const rank = RANKS[level] || RANKS[MAX_LEVEL];
    ui.rankDisplay.textContent = rank.name;
    document.documentElement.style.setProperty('--level-accent', `hsl(${rank.hue}, 90%, 62%)`);

    // Medidor de amenaza: enciende tantos segmentos como nivel
    const segments = ui.threatMeter.querySelectorAll('i');
    segments.forEach((seg, i) => seg.classList.toggle('lit', i < level));
}

/* =========================================
   PREGUNTAS
   ========================================= */
function loadQuestion() {
    const q = state.levelQuestions[state.currentQuestionIndex];
    state.answered = false;

    // Reset visual
    ui.feedbackArea.classList.add('hidden');
    ui.feedbackArea.classList.remove('success', 'error');
    ui.btnSafe.disabled = false;
    ui.btnSus.disabled = false;
    ui.btnSafe.classList.remove('hidden');
    ui.btnSus.classList.remove('hidden');
    ui.btnNext.classList.add('hidden');
    ui.stamp.classList.add('hidden');
    ui.stamp.classList.remove('slam', 'legit', 'fraud');

    // Cabecera del expediente
    ui.caseNumber.textContent = `#${q.id}`;
    ui.caseProgress.textContent = `MUESTRA ${state.currentQuestionIndex + 1} / ${state.levelQuestions.length}`;
    ui.caseType.textContent = q.type === 'email' ? 'EMAIL' : 'URL';
    ui.specimenChromeLabel.textContent = q.type === 'email'
        ? 'muestra interceptada — cliente de correo'
        : 'muestra interceptada — trazado de enlace';

    // Contenido + animación de entrada + barrido de escaneo
    ui.questionContent.innerHTML = q.content;
    ui.specimen.style.animation = 'none';
    void ui.specimen.offsetWidth;
    ui.specimen.style.animation = '';

    ui.scanbeam.classList.remove('scanning');
    void ui.scanbeam.offsetWidth;
    ui.scanbeam.classList.add('scanning');

    // Sin contrarreloj en entrenamiento
    if (state.mode === 'exam') {
        startTimer();
    }
}

/* =========================================
   TEMPORIZADOR
   ========================================= */
function startTimer() {
    clearInterval(state.timerId);
    state.timeLeft = TIME_PER_QUESTION;
    ui.timeBar.style.width = '100%';
    ui.timeBar.className = 'trace-bar';
    ui.timeText.textContent = state.timeLeft.toFixed(1);

    state.timerId = setInterval(() => {
        state.timeLeft -= 0.1;

        if (state.timeLeft <= 0) {
            state.timeLeft = 0;
            clearInterval(state.timerId);
            handleAnswer(null, true); // Timeout = fallo
        } else {
            ui.timeText.textContent = state.timeLeft.toFixed(1);
            ui.timeBar.style.width = `${(state.timeLeft / TIME_PER_QUESTION) * 100}%`;

            if (state.timeLeft < 2) {
                ui.timeBar.className = 'trace-bar danger';
            } else if (state.timeLeft < 5) {
                ui.timeBar.className = 'trace-bar warning';
            }
        }
    }, 100);
}

/* =========================================
   VEREDICTO
   ========================================= */
function handleAnswer(userSaysPhishing, isTimeoutMode = false) {
    if (state.answered) return;
    state.answered = true;
    clearInterval(state.timerId);

    const q = state.levelQuestions[state.currentQuestionIndex];
    const isCorrect = isTimeoutMode ? false : (userSaysPhishing === q.isPhishing);

    ui.btnSafe.classList.add('hidden');
    ui.btnSus.classList.add('hidden');

    // Sello con el veredicto REAL de la muestra
    ui.stampText.textContent = q.isPhishing ? 'FRAUDE' : 'LEGÍTIMO';
    ui.stamp.classList.remove('hidden');
    ui.stamp.classList.add(q.isPhishing ? 'fraud' : 'legit');
    void ui.stamp.offsetWidth;
    ui.stamp.classList.add('slam');
    playSound('stamp');

    const isExam = state.mode === 'exam';
    let pointsMsg = '';
    state.totalAnswered++;

    if (isCorrect) {
        state.streak++;
        state.levelCorrect++;
        state.totalCorrect++;

        if (isExam) {
            // Bonus por velocidad + racha (solo examen)
            const timeBonus = Math.floor(state.timeLeft * 10);
            let points = POINTS_CORRECT + timeBonus;
            pointsMsg = `+${POINTS_CORRECT} · velocidad +${timeBonus}`;

            if (state.streak >= 3) {
                const streakBonus = state.streak * 5;
                points += streakBonus;
                pointsMsg += ` · racha +${streakBonus}`;
            }

            state.score += points;
        }

        showFeedback(true, isCorrect, q.explanation, pointsMsg);
        setTimeout(() => playSound('success'), 180);
    } else {
        state.streak = 0;

        if (isExam) {
            state.score += POINTS_WRONG;
            if (state.score < 0) state.score = 0;
            pointsMsg = `${POINTS_WRONG} pts`;
        }

        const verdictLabel = isTimeoutMode ? 'TIEMPO AGOTADO' : 'VEREDICTO ERRÓNEO';
        showFeedback(false, isCorrect, q.explanation, pointsMsg, verdictLabel);
        setTimeout(() => playSound('error'), 180);

        // Sacudida de la muestra
        ui.specimen.classList.remove('shake');
        void ui.specimen.offsetWidth;
        ui.specimen.classList.add('shake');
    }

    updateHUD();
    ui.btnNext.classList.remove('hidden');
    ui.btnNext.focus();
}

function showFeedback(isSuccess, _isCorrect, explanation, pointsMsg, customLabel) {
    ui.analysisVerdict.textContent = customLabel || (isSuccess ? '✓ ANÁLISIS CORRECTO' : '✕ VEREDICTO ERRÓNEO');
    ui.analysisPoints.textContent = pointsMsg;
    ui.analysisText.textContent = explanation;
    ui.feedbackArea.classList.remove('hidden', 'success', 'error');
    ui.feedbackArea.classList.add(isSuccess ? 'success' : 'error');
}

function nextQuestion() {
    state.currentQuestionIndex++;

    if (state.currentQuestionIndex >= state.levelQuestions.length) {
        showLevelComplete();
    } else {
        loadQuestion();
    }
}

/* =========================================
   INFORME DE NIVEL
   ========================================= */
function showLevelComplete() {
    ui.levelScore.textContent = state.score;

    const total = state.levelQuestions.length;
    const accuracy = total > 0 ? Math.round((state.levelCorrect / total) * 100) : 0;
    ui.levelAccuracy.textContent = `${accuracy}%`;

    // Siguiente rango (si queda nivel por delante)
    const nextRank = RANKS[state.currentLevel + 1];
    ui.levelNextRank.textContent = nextRank ? nextRank.name : 'MÁXIMO';

    const tips = [
        "Los bancos nunca piden contraseñas por email. Nunca.",
        "Verifica siempre las extensiones de archivos adjuntos (.exe, .js).",
        "Los ataques homográficos usan letras parecidas para engañarte.",
        "En móviles, desconfía de SMS (Smishing) y códigos QR en la calle.",
        "Cuidado con ventanas falsas en navegadores (BitB) e ingeniería social avanzada.",
        "Los ataques de cadena de suministro imitan avisos automáticos legítimos.",
        "El fraude BEC secuestra hilos de correo reales. Verifica cambios de cuenta por otro canal."
    ];
    ui.levelTip.textContent = tips[state.currentLevel - 1] || "Buen trabajo, agente.";

    switchScreen('level');
}

/* =========================================
   FINAL DE PARTIDA
   ========================================= */
function endGame() {
    ui.finalScore.textContent = state.score;
    ui.finalRank.textContent = RANKS[Math.min(state.currentLevel - 1, MAX_LEVEL)].name;

    const globalAccuracy = state.totalAnswered > 0
        ? Math.round((state.totalCorrect / state.totalAnswered) * 100)
        : 0;
    ui.finalAccuracy.textContent = `${globalAccuracy}%`;

    if (state.mode === 'exam') {
        renderLeaderboard();
    }
    switchScreen('end');
    ui.playerAlias.focus();
}

/* =========================================
   PERSISTENCIA (LocalStorage)
   ========================================= */
function getLeaderboard() {
    return JSON.parse(localStorage.getItem('phishquest_leaderboard') || '[]');
}

function saveScore() {
    if (state.mode !== 'exam') return; // Entrenamiento no compite en el ranking

    const name = ui.playerAlias.value.trim() || "ANÓNIMO";
    const newEntry = { name, score: state.score, date: new Date().toLocaleDateString() };

    let leaderboard = getLeaderboard();
    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5);

    localStorage.setItem('phishquest_leaderboard', JSON.stringify(leaderboard));
    renderLeaderboard();

    const btn = document.getElementById('save-score-btn');
    btn.disabled = true;
    btn.textContent = "✓ CREDENCIAL REGISTRADA";
}

function renderLeaderboard() {
    const list = ui.leaderboardList;
    list.innerHTML = "";

    const leaderboard = getLeaderboard();

    if (leaderboard.length === 0) {
        const li = document.createElement('li');
        li.className = 'lb-empty';
        li.textContent = "Sin registros en el archivo. Sé el primero.";
        list.appendChild(li);
        return;
    }

    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');

        const rank = document.createElement('span');
        rank.className = 'lb-rank';
        rank.textContent = `${String(index + 1).padStart(2, '0')}.`;

        const name = document.createElement('span');
        name.className = 'lb-name';
        name.textContent = entry.name;

        const score = document.createElement('span');
        score.className = 'lb-score';
        score.textContent = `${entry.score} pts`;

        li.append(rank, name, score);
        list.appendChild(li);
    });
}

/* =========================================
   INIT — pantalla de inicio
   ========================================= */
(function init() {
    const leaderboard = getLeaderboard();
    if (leaderboard.length > 0) {
        const best = leaderboard[0];
        ui.bestAgentText.textContent = `${best.name} — ${best.score} pts`;
        ui.bestAgent.classList.remove('hidden');
    }
})();

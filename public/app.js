(() => {
  const DECK_KEY = 'mrmime:deck';
  const DURATION_KEY = 'mrmime:duration:v2';
  const $ = (id) => document.getElementById(id);
  const fmt = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const screens = { home: $('home'), play: $('play'), end: $('end') };

  function show(name) {
    for (const [k, el] of Object.entries(screens)) el.hidden = k !== name;
  }

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Le paquet est mélangé une fois, puis consommé : aucun mot ne revient
  // tant que tous les mots n'ont pas été vus. Il survit au rechargement de la page.
  function loadDeck() {
    try {
      const d = JSON.parse(localStorage.getItem(DECK_KEY));
      if (d && d.n === WORDS.length && Array.isArray(d.cards) && d.cards.length) return d.cards;
    } catch (e) {}
    return shuffle(WORDS);
  }
  function saveDeck(cards) {
    try { localStorage.setItem(DECK_KEY, JSON.stringify({ n: WORDS.length, cards })); } catch (e) {}
  }

  let deck = loadDeck();
  let score = 0, endAt = 0, tick = null, current = '';

  function nextWord() {
    if (!deck.length) deck = shuffle(WORDS); // paquet épuisé : on remélange
    current = deck.shift();
    saveDeck(deck);
    $('word').textContent = current;
  }

  function renderHome() {
    $('duration').value = localStorage.getItem(DURATION_KEY) || 180;
    $('remaining').textContent = `Mots restants : ${deck.length} / ${WORDS.length}`;
    show('home');
  }

  function renderTimer() {
    const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    $('timer').textContent = fmt(left);
    $('timer').classList.toggle('low', left <= 5);
    if (left <= 0) finish();
  }

  // Son de fin : 4 bips générés par le navigateur.
  // L'audio doit être débloqué par un clic (le bouton « Lancer une session »).
  let audioCtx = null;
  function unlockAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) {}
  }
  function beep(start, dur, freq) {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.6, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start(start);
    o.stop(start + dur + 0.05);
  }
  function alarm() {
    if (!audioCtx) return;
    try {
      const t = audioCtx.currentTime + 0.05;
      for (let i = 0; i < 4; i++) beep(t + i * 0.35, 0.25, i === 3 ? 1175 : 880);
    } catch (e) {}
  }

  let wake = null;
  async function requestWake() {
    try { if ('wakeLock' in navigator) wake = await navigator.wakeLock.request('screen'); } catch (e) {}
  }
  function releaseWake() {
    try { if (wake) wake.release(); } catch (e) {}
    wake = null;
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && tick) requestWake();
  });

  function start() {
    let d = parseInt($('duration').value, 10);
    if (!(d >= 5)) d = 180;
    d = Math.min(d, 600);
    try { localStorage.setItem(DURATION_KEY, d); } catch (e) {}
    score = 0;
    endAt = Date.now() + d * 1000;
    nextWord();
    unlockAudio();
    show('play');
    requestWake();
    renderTimer();
    tick = setInterval(renderTimer, 200);
  }

  function finish() {
    clearInterval(tick);
    tick = null;
    releaseWake();
    alarm();
    if (navigator.vibrate) navigator.vibrate(300);
    $('score').textContent = score;
    show('end');
  }

  $('start').onclick = start;
  $('ok').onclick = () => { score += 1; nextWord(); };
  $('pass').onclick = () => nextWord();
  $('back').onclick = renderHome;
  $('reset').onclick = () => {
    if (confirm('Remettre tous les mots dans le paquet ?')) {
      deck = shuffle(WORDS); saveDeck(deck); renderHome();
    }
  };

  renderHome();
})();

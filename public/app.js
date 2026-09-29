(() => {
  const DECK_KEY = 'mrmime:deck';
  const DURATION_KEY = 'mrmime:duration';
  const $ = (id) => document.getElementById(id);
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
    $('duration').value = localStorage.getItem(DURATION_KEY) || 45;
    $('remaining').textContent = `Mots restants : ${deck.length} / ${WORDS.length}`;
    show('home');
  }

  function renderTimer() {
    const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    $('timer').textContent = left;
    $('timer').classList.toggle('low', left <= 5);
    if (left <= 0) finish();
  }

  function start() {
    let d = parseInt($('duration').value, 10);
    if (!(d >= 5)) d = 45;
    d = Math.min(d, 600);
    try { localStorage.setItem(DURATION_KEY, d); } catch (e) {}
    score = 0;
    endAt = Date.now() + d * 1000;
    nextWord();
    show('play');
    renderTimer();
    tick = setInterval(renderTimer, 200);
  }

  function finish() {
    clearInterval(tick);
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

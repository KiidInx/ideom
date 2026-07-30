/* IDEom-Tabnavigation.
   PC: Hover-Dropdown (Flyout).  Handy: Kreuz-Navigator.
     - Haupttabs waagerecht (Zeile 3), aktiver in der Mitte hervorgehoben
     - Subtabs des aktiven Haupttabs senkrecht durch dessen Spalte
     - Punkt-Indikator (grau/gold) zeigt den aktiven Haupttab
   Auf jeder Seite einbinden:
     <div class="tab-nav" id="tabNav"></div>   (im <header>)
     <script src="nav.js"></script>            (vor </body>)
*/
(function () {
  // Sprache steckt im Pfad: /en/ ist die englische Fassung. Die Dateinamen
  // bleiben in beiden Sprachen gleich (auch die deutschen) — dadurch
  // stimmen alle relativen Links von allein, und der Umschalter muss nur
  // das /en/ an- oder abhängen. Ein zweiter Satz Dateinamen wäre ein
  // zweiter Satz Fehlerquellen.
  var EN = /\/en\//.test(location.pathname);
  function t(de, en) { return EN ? en : de; }

  var TABS = [
    { icon: '⚡', name: t('Start', 'Home'), href: 'index.html', kinder: [
      { name: 'Download', href: 'index.html#download' },
      { name: 'News', href: 'index.html#news' }
    ] },
    { icon: '🧭', name: t('Entdecken', 'Explore'), kinder: [
      { name: t("So funktioniert's", 'How it works'), href: 'funktionsweise.html' },
      { name: t('Sicherheit', 'Security'), href: 'sicherheit.html' },
      { name: t('Stufen', 'Plans'), href: 'stufen.html' },
      { name: 'FAQ', href: 'faq.html' }
    ] },
    { icon: '✊', name: t('Manifest', 'Manifesto'), href: 'manifest.html' },
    { icon: '🗺️', name: t('Fahrplan', 'Roadmap'), href: 'fahrplan.html' }
  ];

  // Nur diese Seiten gibt es zweisprachig. Impressum und Datenschutz
  // bleiben bewusst deutsch: das sind Rechtstexte nach deutschem Recht,
  // und eine Übersetzung daneben wäre eine zweite Fassung, die im
  // Zweifel nicht gilt.
  var UEBERSETZT = [
    'index.html', 'funktionsweise.html', 'sicherheit.html', 'stufen.html',
    'faq.html', 'manifest.html', 'fahrplan.html', 'mitmachen.html'
  ];

  var pfad = location.pathname.split('/').pop() || 'index.html';
  if (pfad === '') pfad = 'index.html';

  // --- Sprache beim ersten Besuch nach dem Browser richten -------------
  // Zwei Bremsen, damit das nicht bevormundet:
  //   1. Es passiert nur EINMAL. Wer den Umschalter benutzt, legt damit
  //      fest, was er will — danach wird nie wieder umgeleitet, auch nicht
  //      wenn Browsersprache und Wahl auseinandergehen. Eine getroffene
  //      Entscheidung zu überstimmen ist schlimmer als gar keine Erkennung.
  //   2. Umgeleitet wird nur von Deutsch NACH Englisch. Deutsch ist die
  //      Originalfassung und immer vollständig; wer hier landet, versteht
  //      im Zweifel beides. Umgekehrt jemanden aus /en/ herauszuwerfen,
  //      weil sein Browser auf Deutsch steht, wäre der ärgerlichere Fehler.
  var GEWAEHLT = 'ideom-sprache';
  function merkeSprache(s) {
    try { localStorage.setItem(GEWAEHLT, s); } catch (e) {}
  }
  function gemerkteSprache() {
    try { return localStorage.getItem(GEWAEHLT); } catch (e) { return null; }
  }

  function istAktiv(href) { return href && href.split('#')[0] === pfad; }

  // aktiven Haupttab bestimmen (Seite selbst ODER Elternteil eines Subtabs)
  var aktivM = 0;
  TABS.forEach(function (t, i) {
    if (istAktiv(t.href)) aktivM = i;
    else if (t.kinder && t.kinder.some(function (k) { return istAktiv(k.href); })) aktivM = i;
  });

  var halter = document.getElementById('tabNav');
  if (!halter) return;

  // ---------- PC: statisches Kreuz-Panel (per Klick) ----------
  // Dieselbe Kreuz-Idee wie der Handy-Drum — waagerecht die Haupttabs,
  // senkrecht die Subtabs des fokussierten Haupttabs — nur statisch,
  // ohne Dreh-Rad: alles sichtbar und direkt klickbar.
  var trigger = document.createElement('button');
  trigger.className = 'tab-trigger';
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.innerHTML = '<span class="tt-icon">☰</span><span class="tt-name"></span><span class="tt-pfeil">▾</span>';
  trigger.querySelector('.tt-name').textContent = TABS[aktivM] ? TABS[aktivM].name : t('Menü', 'Menu');

  var flyout = document.createElement('div');
  flyout.className = 'tab-flyout';
  flyout.innerHTML =
    '<div class="fly-titel">' + t('Wohin?', 'Where to?') + '</div>' +
    '<div class="fly-haupt"></div>' +
    '<div class="fly-subband leer"></div>';
  var flyHaupt = flyout.querySelector('.fly-haupt');
  var flySub = flyout.querySelector('.fly-subband');

  // Subtab-Achse (senkrecht) für den fokussierten Haupttab füllen
  function fuelleSub(tab) {
    flySub.innerHTML = '';
    var kinder = (tab && tab.kinder) ? tab.kinder : [];
    if (!kinder.length) { flySub.classList.add('leer'); return; }
    flySub.classList.remove('leer');
    kinder.forEach(function (k) {
      var ka = document.createElement('a');
      ka.href = k.href; ka.textContent = k.name;
      ka.className = 'fly-subband-item' + (istAktiv(k.href) ? ' aktiv' : '');
      flySub.appendChild(ka);
    });
  }

  // Haupttab-Achse (waagerecht) — aktiver gold hervorgehoben
  TABS.forEach(function (t, i) {
    var el = document.createElement(t.bald ? 'span' : 'a');
    el.className = 'fly-haupt-item' + (i === aktivM ? ' aktiv' : '') + (t.bald ? ' bald' : '');
    if (!t.bald) el.href = t.href || (t.kinder && t.kinder[0].href);
    el.innerHTML = '<span class="fh-icon"></span><span class="fh-lbl"></span>';
    el.querySelector('.fh-icon').textContent = t.icon;
    el.querySelector('.fh-lbl').textContent = t.name;
    el.addEventListener('mouseenter', function () {
      var items = flyHaupt.querySelectorAll('.fly-haupt-item');
      for (var k = 0; k < items.length; k++) items[k].classList.toggle('fokus', items[k] === el);
      fuelleSub(t);
    });
    flyHaupt.appendChild(el);
  });
  fuelleSub(TABS[aktivM]);   // Start: Subtabs des aktiven Haupttabs zeigen

  halter.appendChild(trigger);
  halter.appendChild(flyout);

  // Sprachumschalter: führt auf DIESELBE Seite in der anderen Sprache,
  // nicht auf die Startseite. Wer mitten in der FAQ steht und umschaltet,
  // will die FAQ auf Englisch — nicht von vorn anfangen.
  if (UEBERSETZT.indexOf(pfad) !== -1) {
    var sprache = document.createElement('a');
    sprache.className = 'sprach-knopf';
    sprache.href = (EN ? '../' : 'en/') + pfad;
    sprache.setAttribute('hreflang', EN ? 'de' : 'en');
    sprache.textContent = EN ? 'DE' : 'EN';
    sprache.title = t('Switch to English', 'Auf Deutsch umschalten');
    // Klick = bewusste Wahl. Ab jetzt entscheidet der Besucher, nicht
    // mehr seine Browsereinstellung.
    sprache.addEventListener('click', function () {
      merkeSprache(EN ? 'de' : 'en');
    });
    if (halter.parentNode) halter.parentNode.insertBefore(sprache, halter);
  }

  // Automatische Weiche. `location.replace` statt `href`: die deutsche
  // Seite soll nicht im Verlauf landen, sonst wirft der Zurück-Knopf den
  // Besucher in eine Schleife.
  if (!EN && UEBERSETZT.indexOf(pfad) !== -1 && !gemerkteSprache()) {
    var browser = (navigator.language || '').toLowerCase();
    if (browser && browser.indexOf('de') !== 0) {
      merkeSprache('en');           // damit es genau einmal passiert
      location.replace('en/' + pfad + location.hash);
      return;
    }
  }

  // Login-Knopf: separat in der Kopfleiste, vorerst „bald" (Supabase folgt)
  var login = document.createElement('span');
  login.className = 'login-knopf bald';
  login.innerHTML = '<span class="lk-icon">👤</span><span class="lk-txt">Login</span>';
  login.title = t(
    'Bald — melde dich in IDEom an: Konto, Backups & Nachrichten',
    'Coming soon — sign in to IDEom: account, backups & messages'
  );
  if (halter.parentNode) halter.parentNode.insertBefore(login, halter);

  // ---------- Handy: Kreuz-Navigator ----------
  var overlay = document.createElement('div');
  overlay.className = 'drum-overlay';
  overlay.innerHTML =
    '<div class="drum-blatt" role="dialog" aria-label="Navigation">' +
      '<div class="drum-titel">' + t('Wohin?', 'Where to?') + '</div>' +
      '<div class="hdrum-wrap"><div class="hdrum" id="hdrum"></div></div>' +
      '<div class="kreuz-punkte" id="punkte"></div>' +
      '<div class="vdrum-wrap leer" id="vwrap"><div class="vdrum-band"></div><div class="vdrum" id="vdrum"></div></div>' +
      '<div class="drum-hint">' + t('Tippen zum Öffnen', 'Tap to open') + '</div>' +
      '<div class="drum-griff"></div>' +
    '</div>';
  var hdrum = overlay.querySelector('#hdrum');
  var punkte = overlay.querySelector('#punkte');
  var vwrap = overlay.querySelector('#vwrap');
  var vdrum = overlay.querySelector('#vdrum');
  var blatt = overlay.querySelector('.drum-blatt');
  document.body.appendChild(overlay);

  var fokusM = -1;
  var VH = 52; // Höhe eines Subtab-Eintrags (muss zur CSS passen)

  // --- Haupttab-Drum (waagerecht) einmal bauen ---
  hdrum.appendChild(machSpacer());
  TABS.forEach(function (t, i) {
    var it = document.createElement(t.bald ? 'span' : 'a');
    it.className = 'hdrum-item' + (t.bald ? ' bald' : '');
    if (!t.bald && t.href) it.href = t.href;
    var ic = document.createElement('span'); ic.className = 'icon'; ic.textContent = t.icon;
    var lb = document.createElement('span'); lb.className = 'lbl'; lb.textContent = t.name;
    it.appendChild(ic); it.appendChild(lb);
    it.addEventListener('click', function (e) {
      e.preventDefault();
      if (i !== zentrumH()) scrollZuH(i);        // erst zentrieren
      else oeffneMain(i);                        // schon zentriert -> öffnen
    });
    hdrum.appendChild(it);
  });
  hdrum.appendChild(machSpacer());
  function machSpacer() { var s = document.createElement('div'); s.className = 'hdrum-spacer'; return s; }

  // Punkt-Indikator (eine je Haupttab-Seite) — antippbar
  TABS.forEach(function (t, i) {
    var p = document.createElement('span'); p.className = 'kp';
    p.addEventListener('click', function () {
      if (t.href) los(t.href);
      else if (t.kinder && t.kinder[0]) los(t.kinder[0].href);
      else scrollZuH(i);
    });
    punkte.appendChild(p);
  });

  function itemBreite() { var el = hdrum.querySelector('.hdrum-item'); return el ? el.getBoundingClientRect().width : 1; }
  function grenze(v, max) { return Math.max(0, Math.min(max, v)); }
  function zentrumH() { return grenze(Math.round(hdrum.scrollLeft / itemBreite()), TABS.length - 1); }
  function scrollZuH(i) { hdrum.scrollTo({ left: i * itemBreite(), behavior: 'smooth' }); }
  function los(href) { if (!href) return; drumZu(); location.href = href; }
  function oeffneMain(i) { los(TABS[i].href); }

  var hT;
  function aktualisiereH() {
    var ci = zentrumH();
    var items = hdrum.querySelectorAll('.hdrum-item');
    for (var k = 0; k < items.length; k++) items[k].classList.toggle('mittig', k === ci);
    for (var p = 0; p < punkte.children.length; p++) punkte.children[p].classList.toggle('an', p === ci);
    if (ci !== fokusM) { fokusM = ci; baueVDrum(); }
  }
  hdrum.addEventListener('scroll', function () { clearTimeout(hT); aktualisiereH(); hT = setTimeout(aktualisiereH, 70); });

  // --- Subtab-Drum (senkrecht) je aktivem Haupttab neu füllen ---
  function baueVDrum() {
    var subs = (TABS[fokusM] && TABS[fokusM].kinder) ? TABS[fokusM].kinder : [];
    vdrum.innerHTML = '';
    if (!subs.length) { vwrap.classList.add('leer'); return; }
    vwrap.classList.remove('leer');
    subs.forEach(function (s) {
      var a = document.createElement('a');
      a.className = 'vdrum-item';
      a.href = s.href;
      a.textContent = s.name;
      a.addEventListener('click', function (e) { e.preventDefault(); los(s.href); });
      vdrum.appendChild(a);
    });
    vdrum.scrollTop = 0;
    aktualisiereV();
  }
  function zentrumV() { return grenze(Math.round(vdrum.scrollTop / VH), vdrum.children.length - 1); }
  var vT;
  function aktualisiereV() {
    var ci = zentrumV();
    for (var k = 0; k < vdrum.children.length; k++) vdrum.children[k].classList.toggle('mittig', k === ci);
  }
  vdrum.addEventListener('scroll', function () { clearTimeout(vT); aktualisiereV(); vT = setTimeout(aktualisiereV, 70); });

  // Öffnen passiert durchs Antippen: großer Haupttab = Seite,
  // zentrierter Subtab (in der goldenen Bande) = Subtab.

  // --- Öffnen/Schließen ---
  function drumAuf() {
    var r = trigger.getBoundingClientRect();
    blatt.style.marginTop = Math.round(r.bottom + 8) + 'px';
    overlay.classList.add('auf');
    requestAnimationFrame(function () {
      hdrum.scrollLeft = aktivM * itemBreite();
      fokusM = -1;
      aktualisiereH();
    });
  }
  function drumZu() { overlay.classList.remove('auf'); }
  overlay.addEventListener('click', function (e) { if (e.target === overlay) drumZu(); });

  var mobil = window.matchMedia('(max-width: 860px)');
  trigger.addEventListener('click', function (e) {
    e.preventDefault();
    if (mobil.matches) drumAuf();
    else halter.classList.toggle('auf');
  });
  // Desktop: Klick außerhalb schließt das Panel; Klick auf ein Ziel auch
  document.addEventListener('click', function (e) {
    if (!mobil.matches && !halter.contains(e.target)) halter.classList.remove('auf');
  });
  flyout.addEventListener('click', function (e) {
    if (e.target.closest('a')) halter.classList.remove('auf');
  });
})();

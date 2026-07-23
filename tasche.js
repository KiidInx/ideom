// Themen-Tasche: verdrahtet jede .tasche auf der Seite.
// Rausziehen (Handy) oder Klicken (PC) öffnet die Detail-Ansicht
// mit großem Bild und dem Erklärtext aus .tasche-detail.
(function () {
  var kasten = null;

  function baueKasten() {
    var k = document.createElement('div');
    k.className = 'detail-kasten';
    k.hidden = true;
    k.innerHTML =
      '<div class="detail-karte" role="dialog" aria-modal="true">' +
      '<img src="" alt="">' +
      '<div class="dk-text"></div>' +
      '<button class="dk-zu" aria-label="Schließen">✕</button>' +
      '</div>';
    k.querySelector('.dk-zu').addEventListener('click', schliesse);
    k.addEventListener('click', function (e) { if (e.target === k) schliesse(); });
    document.body.appendChild(k);
    return k;
  }

  function oeffne(tasche) {
    if (!kasten) kasten = baueKasten();
    var bild = tasche.querySelector('.tasche-bild img');
    var gross = kasten.querySelector('img');
    gross.src = bild ? bild.src : '';
    gross.alt = bild ? bild.alt : '';
    var detail = tasche.querySelector('.tasche-detail');
    kasten.querySelector('.dk-text').innerHTML = detail ? detail.innerHTML : '';
    kasten.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function schliesse() {
    kasten.hidden = true;
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', function (e) {
    if (kasten && !kasten.hidden && e.key === 'Escape') schliesse();
  });

  Array.prototype.forEach.call(document.querySelectorAll('.tasche'), function (t) {
    var griff = t.querySelector('.tasche-bild');
    var front = t.querySelector('.tasche-front');
    var startY = null, zug = 0;

    if (griff) {
      griff.addEventListener('pointerdown', function (e) {
        startY = e.clientY; zug = 0;
        t.classList.add('zieht');
        griff.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      griff.addEventListener('pointermove', function (e) {
        if (startY === null) return;
        zug = Math.max(0, startY - e.clientY);
        t.style.setProperty('--zug', Math.min(zug, 110) + 'px');
      });
      function zugEnde() {
        if (startY === null) return;
        var auf = zug > 70 || zug < 6; // weit gezogen ODER nur getippt
        t.classList.remove('zieht');
        t.style.setProperty('--zug', '0px');
        startY = null;
        if (auf) oeffne(t);
      }
      griff.addEventListener('pointerup', zugEnde);
      griff.addEventListener('pointercancel', zugEnde);
    }
    if (front) front.addEventListener('click', function () { oeffne(t); });
  });
})();

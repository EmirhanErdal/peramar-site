/* PERAMAR tanıtım sitesi — v2 bölümlerinin animasyonları */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var icon = function (n, cls) { return '<svg class="i' + (cls ? ' ' + cls : '') + '"><use href="#i-' + n + '"/></svg>'; };

  function onSeen(el, fn, th) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } }); }, { threshold: th || 0.3 });
    io.observe(el);
  }
  function whileSeen(el) {
    var vis = false;
    if (!el) return function () { return false; };
    if (!('IntersectionObserver' in window)) return function () { return !document.hidden; };
    new IntersectionObserver(function (es) { es.forEach(function (e) { vis = e.isIntersecting; }); }, { threshold: 0.15 }).observe(el);
    return function () { return vis && !document.hidden; };
  }
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------- Sohbet canlandırması ---------- */
  var body = $('#cmBody'), status = $('#cmStatus');
  if (body) {
    var people = {
      murat: { n: 'Murat Demir', c: '#7C4DBA' }, zeynep: { n: 'Zeynep Arslan', c: '#B4372F' }, emre: { n: 'Emre Kaya', c: '#2F8F46' }, burak: { n: 'Burak Çelik', c: '#8A6D1F' },
    };
    var clock = 9 * 60 + 12;
    var hhmm = function () { clock += 1 + Math.floor(Math.random() * 3); return String(Math.floor(clock / 60)).padStart(2, '0') + ':' + String(clock % 60).padStart(2, '0'); };
    var meta = function (me) { return '<span class="meta">' + hhmm() + (me ? icon('check-check') : '') + '</span>'; };
    var add = function (html, cls) {
      var d = document.createElement('div'); d.className = cls; d.innerHTML = html; body.appendChild(d);
      while (body.children.length > 7) body.removeChild(body.firstChild);
      return d;
    };
    var them = function (p, inner) { return add('<span class="who" style="color:' + people[p].c + '">' + people[p].n + '</span>' + inner + meta(false), 'cm-msg them'); };
    var mine = function (inner) { var d = add(inner + meta(true), 'cm-msg me'); setTimeout(function () { var t = $('.meta .i', d); if (t) t.classList.add('read'); }, 1400); return d; };
    var typing = async function (p, ms) {
      status.textContent = people[p].n.split(' ')[0] + ' yazıyor…'; status.classList.add('typing');
      var t = add('<i></i><i></i><i></i>', 'cm-typing');
      await sleep(ms);
      t.remove(); status.textContent = 'Murat, Emre, Ayşe, Zeynep, Burak'; status.classList.remove('typing');
    };
    var shelf = function () {
      var cols = ['#2563EB', '#F4A32A', '#2F8F46', '#FFFFFF', '#C0577A', '#0E5E57'], s = '';
      [44, 92].forEach(function (y, r) { s += '<i style="top:' + y + 'px"></i>'; for (var k = 0; k < 11; k++) { var hgt = 24 + ((k * 5 + r) % 4) * 5; s += '<b style="left:' + (14 + k * 19) + 'px;top:' + (y - hgt) + 'px;height:' + hgt + 'px;background:' + cols[(k + r * 2) % cols.length] + '"></b>'; } });
      return '<div class="cm-photo">' + s + '<em>Kampanya rafı · giriş koridoru</em></div>';
    };
    var wave = function () { var s = ''; for (var k = 0; k < 26; k++) s += '<i style="height:' + (6 + Math.round(Math.abs(Math.sin(k * 1.7)) * 20)) + 'px"></i>'; return s; };

    var script = async function () {
      body.innerHTML = ''; clock = 9 * 60 + 12;
      them('murat', 'Süzme yoğurtların SKT\'si bugün bitiyor, 6 kova kaldı. Fire vermeden indirime alalım.');
      await sleep(1600);
      mine('Tamam, %25 etiket basıyorum. Ayranları da öne aldım.');
      await sleep(1800);
      var ph = mine(shelf() + 'Kahvaltı Festivali rafı hazır.');
      await sleep(1300);
      ph.classList.add('react'); ph.insertAdjacentHTML('beforeend', '<span class="cm-react">' + icon('thumbs-up') + '3</span>');
      await typing('zeynep', 1700);
      var v = them('zeynep', '<div class="cm-voice"><span class="play">' + icon('play') + '</span><span class="cm-wave">' + wave() + '</span><small>0:12</small></div>');
      var bars = $$('.cm-wave i', v);
      for (var k = 0; k < bars.length; k++) { bars[k].classList.add('p'); await sleep(70); }
      await sleep(600);
      await typing('emre', 1200);
      them('emre', '<div class="cm-rec"><b>' + icon('shopping-cart') + 'Sipariş SP-260418</b><small>Manav · 9 kalem · Onaylandı</small></div>Siparişimiz onaylandı, depo topluyor.');
      await sleep(2000);
      var ann = add('<span class="top">' + icon('megaphone') + 'Duyuru · Ahmet Yıldırım</span><p>Ekim kampanya dönemi başladı. Kampanya rafları cuma akşamına kadar hazır olsun.</p><span class="ackb">' + icon('check') + 'Okudum, anladım</span>', 'cm-ann');
      await sleep(1600);
      var b = $('.ackb', ann); b.classList.add('done'); b.innerHTML = icon('check-check') + 'Onayladınız · 09:' + String(clock % 60).padStart(2, '0');
      await sleep(4200);
    };
    var chatVisible = whileSeen($('#chatMock'));
    if (reduce) { script(); }
    else {
      (async function loop() {
        for (;;) {
          while (!chatVisible()) await sleep(500);
          await script();
        }
      })();
    }
  }

  /* ---------- Duyuru okundu sayacı ---------- */
  var ackCard = $('#ackCard');
  if (ackCard) {
    onSeen(ackCard, async function () {
      var total = 24, num = $('#ackNum'), bar = $('#ackBar'), avs = $('#ackAvs');
      var cols = ['#7C4DBA', '#2F8F46', '#2459C9', '#B4372F', '#8A6D1F', '#0E7490', '#C2372C', '#5B6B2E', '#B26F0C', '#3F4C4A'];
      var names = ['MD', 'EK', 'SA', 'ZA', 'BÇ', 'AD', 'PY', 'OK', 'HA', 'TE', 'GU', 'BÖ', 'NT', 'KA', 'EB', 'HK', 'GY', 'ME', 'KA', 'SP', 'CÖ', 'EŞ'];
      var n = 0;
      var step = function (to, delay) {
        return (async function () {
          while (n < to) {
            n++;
            num.textContent = n + '/' + total; bar.style.width = (n / total * 100) + '%';
            if (avs.children.length < 18) { var s = document.createElement('span'); s.style.background = cols[n % cols.length]; s.textContent = names[n % names.length]; avs.appendChild(s); }
            await sleep(delay);
          }
        })();
      };
      await step(15, reduce ? 0 : 70);
      if (!reduce) { await sleep(1200); await step(22, 650); }
    }, 0.5);
  }

  /* ---------- Sayım ilerlemesi ---------- */
  var cntBar = $('#cntBar');
  if (cntBar) {
    onSeen(cntBar, function () {
      var t0 = performance.now(), D = reduce ? 1 : 1800, txt = $('#cntTxt'), diff = $('#cntDiff');
      (function f(t) {
        var k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3);
        txt.textContent = Math.round(17 * e) + '/20';
        cntBar.style.width = (85 * e) + '%';
        diff.textContent = '−₺' + Math.round(412 * e).toLocaleString('tr-TR');
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    });
  }

  /* ---------- İade adımları ---------- */
  var ret = $('#retSteps');
  if (ret && !reduce) {
    var steps = $$('span', ret), ri = 0, retVisible = whileSeen(ret);
    setInterval(function () {
      if (!retVisible()) return;
      ri = (ri + 1) % (steps.length + 1);
      steps.forEach(function (s, i) { s.classList.toggle('on', i === ri); s.classList.toggle('done', i < ri); });
    }, 1300);
  }

  /* ---------- Barkod ---------- */
  var bc2 = $('#barcode2');
  if (bc2) { var b = ''; for (var i = 0; i < 46; i++) b += '<i style="width:' + [1, 2, 3, 1, 4][(i * 7) % 5] + 'px"></i>'; bc2.innerHTML = b; }

  /* ---------- Kampanya performans çubukları ---------- */
  var cb = $('#campBars');
  if (cb) {
    var hs = [38, 41, 40, 44, 52, 50, 42, 43, 41, 45, 48, 82, 88, 76];
    cb.innerHTML = hs.map(function (h, i) { return '<i' + (i >= 11 ? ' class="hot"' : '') + ' data-h="' + h + '"></i>'; }).join('');
    onSeen(cb, function () { $$('i', cb).forEach(function (el, i) { setTimeout(function () { el.style.height = el.getAttribute('data-h') + '%'; }, i * 45); }); });
  }
})();

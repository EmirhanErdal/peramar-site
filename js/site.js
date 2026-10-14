/* PERAMAR tanıtım sitesi — etkileşim ve animasyonlar */
(function () {
  'use strict';

  // İletişim bilgileri belli olunca buraya yazılır; boş kalan kart gösterilmez.
  var CONFIG = { email: '', phone: '', whatsapp: '' };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var icon = function (n, cls) { return '<svg class="i' + (cls ? ' ' + cls : '') + '"><use href="#i-' + n + '"/></svg>'; };
  var tl = function (v, d) { return '₺' + v.toLocaleString('tr-TR', { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }); };

  // Görünür olunca bir kez çalıştır
  function onSeen(el, fn, th) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { threshold: th || 0.3 });
    io.observe(el);
  }
  // Görünürken çalışan / görünmezken duran döngü
  function whileSeen(el, cb) {
    var vis = false;
    if (!('IntersectionObserver' in window)) { vis = true; cb(true); return function () { return true; }; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { vis = e.isIntersecting; cb(vis); }); }, { threshold: 0.15 }).observe(el);
    return function () { return vis && !document.hidden; };
  }

  /* ---------- Başlık kelimelerini böl ---------- */
  $$('.split').forEach(function (h) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
            var o = document.createElement('span'); o.className = 'split-w';
            var s = document.createElement('span'); s.textContent = w; s.style.setProperty('--i', i++);
            o.appendChild(s); frag.appendChild(o);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(h);
  });

  /* ---------- Belirme ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.rv').forEach(function (el) { rio.observe(el); });
  } else $$('.rv').forEach(function (el) { el.classList.add('in'); });

  /* ---------- Menü, ilerleme, başa dön ---------- */
  var nav = $('#nav'), prog = $('#progress'), totop = $('#totop');
  var darkSecs = $$('.hero, .dark');
  var links = $$('.nav-links a');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    nav.classList.toggle('scrolled', y > 20);
    totop.classList.toggle('show', y > innerHeight * 1.2);
    var probe = 40, overDark = false;
    darkSecs.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= probe && r.bottom > probe) overDark = true; });
    nav.classList.toggle('light', !overDark);
    var cur = '';
    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = a.getAttribute('href');
    });
    links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === cur); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  var mm = $('#mmenu');
  function menu(open) { mm.classList.toggle('open', open); mm.setAttribute('aria-hidden', String(!open)); document.body.style.overflow = open ? 'hidden' : ''; }
  $('#burger').addEventListener('click', function () { menu(true); });
  $('#mclose').addEventListener('click', function () { menu(false); });
  $$('#mmenu a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });

  var toastEl = $('#toast'), toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 3200); }

  $('#yr').textContent = new Date().getFullYear();

  /* ---------- Hero: kelime döndürücü ---------- */
  var rot = $$('#rotator span'), ri = 0;
  if (!reduce) setInterval(function () {
    if (document.hidden) return;
    var cur = rot[ri]; ri = (ri + 1) % rot.length; var nx = rot[ri];
    cur.classList.remove('on'); cur.classList.add('out');
    nx.classList.remove('out'); nx.classList.add('on');
    setTimeout(function () { cur.classList.remove('out'); }, 700);
  }, 2400);

  /* ---------- Hero: telefon ekranları ---------- */
  var hImgs = $$('#heroScreen img'), hDots = $('#heroDots'), hCap = $('#heroCap'), hi = 0, hTimer;
  hImgs.forEach(function (_, i) {
    var b = document.createElement('button'); b.setAttribute('aria-label', (i + 1) + '. ekran');
    if (!i) b.className = 'on';
    b.addEventListener('click', function () { heroGo(i); heroAuto(); });
    hDots.appendChild(b);
  });
  function heroGo(i) {
    hImgs[hi].classList.remove('on'); hDots.children[hi].classList.remove('on');
    hi = i;
    hImgs[hi].classList.add('on'); hDots.children[hi].classList.add('on');
    hCap.innerHTML = hImgs[hi].getAttribute('data-cap');
  }
  function heroAuto() { clearInterval(hTimer); if (!reduce) hTimer = setInterval(function () { if (!document.hidden) heroGo((hi + 1) % hImgs.length); }, 3600); }
  heroAuto();

  var fcs = $$('.float-card');
  fcs.forEach(function (c, i) { setTimeout(function () { c.classList.add('on'); }, 900 + i * 650); });

  var stage = $('#heroStage');
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    var hero = $('.hero');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      stage.style.transform = 'rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 8) + 'deg)';
    });
    hero.addEventListener('mouseleave', function () { stage.style.transform = ''; });
  }

  /* ---------- Kayan şerit ---------- */
  var mq = $('#marquee'); mq.innerHTML += mq.innerHTML;

  /* ---------- Önce / sonra ---------- */
  var bat = $('#baToggle'), ba = $('#ba'), knob = $('.knob', bat), baBtns = $$('button', bat), baTouched = false;
  function baSet(after) {
    var b = baBtns[after ? 1 : 0];
    knob.style.width = b.offsetWidth + 'px';
    knob.style.transform = 'translateX(' + (b.offsetLeft - 5) + 'px)';
    baBtns.forEach(function (x, i) { x.classList.toggle('on', i === (after ? 1 : 0)); x.setAttribute('aria-selected', String(i === (after ? 1 : 0))); });
    ba.classList.toggle('after', after); bat.classList.toggle('after', after);
  }
  baBtns.forEach(function (b, i) { b.addEventListener('click', function () { baTouched = true; baSet(i === 1); }); });
  baSet(false);
  window.addEventListener('resize', function () { baSet(ba.classList.contains('after')); });
  onSeen(ba, function () { setTimeout(function () { if (!baTouched) baSet(true); }, 2200); }, 0.5);

  /* ---------- Roller ---------- */
  var ROLES = [
    { g: 'Mağaza', k: 'reyon', n: 'Reyon sorumlusu', ic: 'apple', p: 'Emre Kaya · Kadıköy · Manav', shot: 'm-reyon-stok',
      t: 'Kendi reyonu, kendi siparişi.', d: 'Manav sorumlusu yalnızca meyve, sebze ve yeşilliği görür. Kritik stok önüne gelir, sipariş önerisi hazırdır.',
      f: ['Satış hızı ve kampanyaya göre önerilen sipariş', 'Telefon kamerasıyla barkod okutma', 'SKT takibi: indirime al, fireye düş, iade et', 'Fotoğraflı mal kabul ve bölüm sayımı'],
      see: 'Kendi bölümü', hide: 'Diğer bölümler, ciro, fiyat yönetimi' },
    { g: 'Mağaza', k: 'magaza', n: 'Mağaza müdürü', ic: 'store', p: 'Murat Demir · Kadıköy', shot: 'm-magaza-onay',
      t: 'Mağazanın nabzı tek ekranda.', d: 'Bölümlerin sağlık durumu, onay bekleyen siparişler, açık görevler ve bugün gelecek tır bir arada.',
      f: ['Sipariş, iade ve transfer onayları tek ekranda', 'Sayım planlama ve TL fark raporuyla onay', 'Diğer mağazalardan transfer isteme', 'Etiket ve kampanya görevlerini fotoğrafla kapatma'],
      see: 'Kendi mağazası', hide: 'Diğer mağazalar, satın alma fiyatları' },
    { g: 'Yönetim', k: 'bolge', n: 'Bölge müdürü', ic: 'network', p: 'Selin Aydın · Anadolu Yakası', shot: 'm-bolge',
      t: 'Bölgesindeki her mağazayı kıyaslar.', d: 'Mağazalar ciro, denetim puanı, fire ve görev performansına göre yan yana. Limiti aşan siparişler bölge onayına gelir.',
      f: ['Ciro, SKT riski ve sayım farkıyla mağaza karşılaştırması', 'Denetim ısı haritası', 'Bölge içi transfer akışı', 'Bölgeye okundu onaylı duyuru'],
      see: 'Bölgesindeki mağazalar', hide: 'Diğer bölgeler' },
    { g: 'Yönetim', k: 'patron', n: 'Patron', ic: 'crown', p: 'Ahmet Yıldırım · Genel müdür', shot: 'm-patron',
      t: 'Bütün şirket, cebinizde.', d: 'Şirket kokpitinden bölgeye, bölgeden mağazaya, mağazadan reyona iner. Kim neyi görecek, buradan belirlenir.',
      f: ['Gerçek satış verisinden ciro kokpiti', 'Kayıp & fire: fire, SKT, sayım farkı, hasar', 'Kullanıcı ve yetki yönetimi', 'Tüm şirkete duyuru, raporlar ve CSV'],
      see: 'Her şey', hide: 'Kısıt yok' },
    { g: 'Merkez', k: 'denetci', n: 'Denetçi', ic: 'clipboard-check', p: 'Elif Şahin · Kalite denetim', shot: 'm-denetci-denetim',
      t: 'Denetim turu, cebinde.', d: 'Mağazaya varınca turu başlatır; soruları puanlar, fotoğraf çeker, müdüre imzalatır. Rapor ve düzeltme görevleri otomatik oluşur.',
      f: ['Gerçek GPS ile mağazada olduğunu doğrulama', 'Soru soru puanlama, zorunlu fotoğraf', 'SKT sorularında riskli ürün listesi', 'Müdür imzası, PDF rapor ve otomatik görev'],
      see: 'Denetlediği mağazalar', hide: 'Sipariş ve fiyat yönetimi' },
    { g: 'Merkez', k: 'satinalma', n: 'Satın alma', ic: 'chart-candlestick', p: 'Can Öztürk · Satın alma', shot: 'm-satinalma',
      t: 'Piyasayı canlı izler.', d: 'Rakip market fiyatları anlık akar. Pahalı kaldığınız ürünler ve fırsatlar uyarı olarak gelir; tedarikçi teklifleri yan yana.',
      f: ['Canlı rakip fiyat terminali', 'Fiyatı tek dokunuşla tüm zincire uygulama', 'Kampanya sihirbazı ve performans takibi', 'Tedarikçi karnesi ve iade alacakları'],
      see: 'Fiyat ve tedarik verisi', hide: 'Mağaza içi görevler, personel' },
    { g: 'Lojistik', k: 'depo', n: 'Depo', ic: 'warehouse', p: 'Hakan Koç · Merkez depo', shot: 'm-depo-toplama',
      t: 'Hangi ürün nereye, net.', d: 'Onaylanan siparişler toplama listesine düşer. Raf adresine göre sıralı yürür, barkod okutarak toplar, hatalı ürün okutulamaz.',
      f: ['"Hangi ürün nereye" panosu', 'Kamerayla barkod okutarak toplama', 'Fotoğraflı mal kabul ve depo sayımı', 'Barkod etiketi yazdırma, iade kabulü'],
      see: 'Depo ve toplama işleri', hide: 'Fiyatlar, ciro, mağaza görevleri' },
    { g: 'Lojistik', k: 'sevkiyat', n: 'Sevkiyat', ic: 'route', p: 'Gizem Yılmaz · Sevkiyat planlama', shot: 'm-sevkiyat',
      t: 'Tırları canlı yönetir.', d: 'Hazır siparişleri tırlara atar, kapasite ve soğuk zincir kuralını sistem denetler. Rota optimize edilir, tırlar haritada izlenir.',
      f: ['Canlı harita ve şoförün gerçek GPS konumu', 'Sipariş, transfer ve iadeyi tıra atama', 'Kapasite ve frigo uyarısı', 'Rota optimizasyonu ve yükleme onayı'],
      see: 'Tırlar ve seferler', hide: 'Fiyatlar, denetimler' },
    { g: 'Lojistik', k: 'sofor', n: 'Tır şoförü', ic: 'truck', p: 'Mustafa Er · 34 PRM 017', shot: 'm-sofor',
      t: 'Sadece bugünkü yolu.', d: 'Direksiyon başında okunacak kadar büyük düğmeler. Sıradaki durak, yol tarifi, mağazayı arama ve imzalı teslim.',
      f: ['Sefer öncesi araç kontrol listesi', 'Canlı konum paylaşımı ve yol tarifi', 'İmza ve fotoğrafla teslim', 'Transfer yükleme ve iade geri alımı'],
      see: 'Kendi tırı, bugünkü duraklar', hide: 'Her şeyin geri kalanı' }
  ];
  var rList = $('#roleList'), rInfo = $('#roleInfo'), rScreen = $('#roleScreen'), rBox = $('#rolesBox'), rIdx = 0, rTimer, RDUR = 7000;
  var lastG = '';
  ROLES.forEach(function (r, i) {
    if (r.g !== lastG) { var g = document.createElement('div'); g.className = 'role-group'; g.textContent = r.g; rList.appendChild(g); lastG = r.g; }
    var b = document.createElement('button');
    b.className = 'role-tab'; b.setAttribute('role', 'tab'); b.style.setProperty('--dur', RDUR + 'ms');
    b.innerHTML = '<span class="ic">' + icon(r.ic) + '</span>' + r.n + '<span class="bar"></span>';
    b.addEventListener('click', function () { roleGo(i, true); });
    rList.appendChild(b);
    var img = new Image(); img.src = 'img/shots/' + r.shot + '.jpg'; img.alt = r.n + ' ekranı'; img.width = 390; img.height = 844; img.loading = 'lazy';
    rScreen.appendChild(img);
  });
  var rTabs = $$('.role-tab', rList), rImgs = $$('img', rScreen);
  function roleGo(i, user) {
    rIdx = i;
    var r = ROLES[i];
    rTabs.forEach(function (t, j) {
      t.classList.remove('on'); t.setAttribute('aria-selected', 'false');
      if (j === i) { void t.offsetWidth; t.classList.add('on'); t.setAttribute('aria-selected', 'true'); }
    });
    rImgs.forEach(function (im, j) { im.classList.toggle('on', j === i); });
    rInfo.innerHTML =
      '<div class="who anim-swap"><span class="ic">' + icon(r.ic) + '</span><span><small>' + r.g + '</small><b style="font-size:20px">' + r.n + '</b><br><span style="font-size:14px;color:var(--muted);font-weight:600">' + r.p + '</span></span></div>' +
      '<h3 class="anim-swap">' + r.t + '</h3><p class="desc anim-swap">' + r.d + '</p>' +
      '<ul class="role-feats">' + r.f.map(function (f, k) { return '<li style="--i:' + k + '">' + icon('check') + f + '</li>'; }).join('') + '</ul>' +
      '<div class="role-scope anim-swap"><span class="see">' + icon('circle-check') + 'Görür: ' + r.see + '</span><span class="hide">' + icon('lock') + 'Göremez: ' + r.hide + '</span></div>';
    if (user && innerWidth <= 1100) { var t = rTabs[i]; rList.scrollTo({ left: t.offsetLeft - 16, behavior: 'smooth' }); }
    roleAuto();
  }
  var rolesVisible = whileSeen(rBox, function () {});
  function roleAuto() {
    clearTimeout(rTimer);
    if (reduce) return;
    rTimer = setTimeout(function tick() {
      if (rBox.classList.contains('paused') || !rolesVisible()) { rTimer = setTimeout(tick, 600); return; }
      roleGo((rIdx + 1) % ROLES.length);
    }, RDUR);
  }
  rBox.addEventListener('mouseenter', function () { rBox.classList.add('paused'); });
  rBox.addEventListener('mouseleave', function () { rBox.classList.remove('paused'); });
  roleGo(0);

  /* ---------- Akış ---------- */
  var FLOW = [
    { ic: 'apple', r: 'Reyon', t: 'Sipariş oluşturulur', s: 'Önerilen sipariş kontrol edilip gönderilir', tm: '08:42',
      d: 'Emre, manav reyonundaki 12 kritik ürün için önerilen siparişi kontrol eder ve tek dokunuşla müdüre gönderir. Kalemler merkez depo ve tedarikçi olarak otomatik ayrılır.', m: ['12 kalem', '₺31.858', 'Kesimden önce'],
      log: 'Reyon · <em>SP-260418</em> oluşturuldu (12 kalem)' },
    { ic: 'store', r: 'Mağaza müdürü', t: 'Onaylanır', s: 'Miktar düzenlenir, onay tek dokunuş', tm: '08:51',
      d: 'Murat Bey bildirimi açar, bir kalemin miktarını düzeltir ve onaylar. Tedarikçi kalemleri o anda tedarikçiye iletilir; limit üstü olsaydı bölge onayına giderdi.', m: ['Bildirim', 'Miktar düzenleme', 'Tedarikçiye iletildi'],
      log: 'Müdür · <em>SP-260418</em> onaylandı, 10 kalem tedarikçiye iletildi' },
    { ic: 'warehouse', r: 'Depo', t: 'Toplanır', s: 'Raf sırasına göre, barkod okutarak', tm: '09:20',
      d: 'Hakan, toplama listesini raf adresine göre sıralı görür. Her ürünü okutarak toplar; yanlış ürün okutulursa sistem uyarır.', m: ['A-03 → C-02', 'Barkod doğrulama', 'Hazır'],
      log: 'Depo · <em>SP-260418</em> toplandı, sevkiyata hazır' },
    { ic: 'route', r: 'Sevkiyat', t: 'Tıra atanır', s: 'Kapasite, frigo ve rota otomatik', tm: '09:34',
      d: 'Gizem, hazır siparişi 34 PRM 017 plakalı frigo tıra atar. Sistem doluluk ve soğuk zinciri kontrol eder, rotayı optimize eder, yükleme onaylanır.', m: ['34 PRM 017', '%78 dolu', 'Rota −14 km'],
      log: 'Sevkiyat · <em>SV-1044</em> yüklendi · 34 PRM 017' },
    { ic: 'truck', r: 'Şoför', t: 'Teslim edilir', s: 'İmza ve fotoğrafla kanıtlı teslim', tm: '10:58',
      d: 'Mustafa, yol tarifini tek dokunuşla açar. Mağazada teslimatı müdüre imzalatır, fotoğraf çeker. Sipariş "teslim edildi" olur, herkes anında görür.', m: ['Yol tarifi', 'Dijital imza', 'Fotoğraf'],
      log: 'Şoför · <em>SP-260418</em> teslim edildi · imza alındı' },
    { ic: 'inbox', r: 'Reyon', t: 'Mal kabul', s: 'Tedarikçi kalemleri kontrol edilir', tm: '13:15',
      d: 'Tedarikçiden gelen kalemler reyonun mal kabul listesine düşer. Eksik ya da hasarlı ürün bildirilir, zincir kapanır, kayıt izi tamamlanır.', m: ['10 kalem', 'Eksik bildirimi', 'Zincir tamam'],
      log: 'Reyon · tedarikçi mal kabulü tamamlandı' }
  ];
  var fSteps = $('#flowSteps'), fCard = $('#flowCard'), fFill = $('#flowFill'), fTruck = $('#flowTruck'), fLog = $('#flowLog'), fi = -1, fTimer;
  FLOW.forEach(function (s, i) {
    var b = document.createElement('button'); b.className = 'flow-step';
    b.innerHTML = '<span class="dot">' + icon(s.ic) + '</span><b>' + s.t + '</b><small>' + s.r + ' · ' + s.s + '</small>';
    b.addEventListener('click', function () { flowGo(i); flowAuto(); });
    fSteps.appendChild(b);
  });
  var fBtns = $$('.flow-step', fSteps);
  function flowLog(s) {
    var d = document.createElement('div');
    d.innerHTML = '<time>' + s.tm + '</time><span>' + s.log + '</span>';
    fLog.appendChild(d);
    while (fLog.children.length > 9) fLog.removeChild(fLog.firstChild);
  }
  function flowGo(i) {
    fi = i;
    var s = FLOW[i];
    fBtns.forEach(function (b, j) { b.classList.toggle('on', j === i); b.classList.toggle('done', j < i); });
    var pct = i / (FLOW.length - 1);
    fFill.style.transform = 'scaleX(' + pct + ')';
    fTruck.style.left = (8.33 + pct * 83.34) + '%';
    fCard.innerHTML = '<span class="eyebrow">' + (i + 1) + '. adım · ' + s.r + '</span><h3 class="anim-swap">' + s.t + '</h3><p class="anim-swap">' + s.d + '</p><div class="meta anim-swap"><span>' + icon('clock') + s.tm + '</span>' + s.m.map(function (x) { return '<span>' + icon('check') + x + '</span>'; }).join('') + '</div>';
    flowLog(s);
  }
  flowGo(0);
  var flowStarted = false;
  var flowVisible = whileSeen($('#flowTrack'), function (v) { if (v && !flowStarted) { flowStarted = true; flowAuto(); } });
  function flowAuto() {
    clearInterval(fTimer);
    if (reduce) return;
    fTimer = setInterval(function () { if (flowVisible()) flowGo((fi + 1) % FLOW.length); }, 3400);
  }

  /* ---------- Sipariş görseli ---------- */
  onSeen($('#cartVis'), function () {
    var qs = $$('#cartVis [data-q]'), prices = [34.9, 74.9, 24.9, 17.5], total = $('#cartTotal');
    var t0 = performance.now(), D = 1600;
    (function f(t) {
      var k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3), sum = 0;
      qs.forEach(function (q, i) { var v = Math.round(+q.getAttribute('data-q') * e); q.textContent = v; sum += v * prices[i]; });
      total.textContent = tl(Math.round(sum), 0);
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  });

  /* ---------- Denetim görseli ---------- */
  onSeen($('#auditVis'), function () {
    var score = 87, C = 2 * Math.PI * 86;
    var fg = $('#ringFg'); fg.style.strokeDasharray = C; fg.style.strokeDashoffset = C;
    requestAnimationFrame(function () { fg.style.strokeDashoffset = C * (1 - score / 100); });
    var v = $('#ringVal'), t0 = performance.now();
    (function f(t) { var k = Math.min(1, (t - t0) / 2000), e = 1 - Math.pow(1 - k, 3); v.textContent = Math.round(score * e); if (k < 1) requestAnimationFrame(f); })(t0);
    $$('#auditVis .bar i').forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; });
  });

  /* ---------- Canlı piyasa ---------- */
  var MK = [
    { n: 'Ayçiçek yağı 5 L', o: 289.9, c: [299.9, 294.5, 309.0] },
    { n: 'Toz şeker 5 kg', o: 189.5, c: [194.9, 187.0, 199.9] },
    { n: 'Baldo pirinç 2 kg', o: 139.9, c: [144.5, 149.9, 136.9] },
    { n: 'Beyaz peynir 1 kg', o: 249.0, c: [259.9, 244.9, 264.5] },
    { n: 'Yumurta 30\'lu', o: 154.9, c: [159.9, 157.5, 149.9] },
    { n: 'Süzme bal 850 g', o: 329.0, c: [339.9, 324.5, 349.0] },
    { n: 'Çay 1 kg', o: 219.9, c: [229.9, 224.5, 214.9] }
  ];
  var tb = $('#tick tbody');
  function diff(r) { var avg = r.c.reduce(function (a, b) { return a + b; }, 0) / r.c.length; return (r.o - avg) / avg * 100; }
  function fmtP(v) { return v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function diffCell(r) { var d = diff(r); return '<span class="' + (d <= 0 ? 'pos' : 'neg') + '">' + (d > 0 ? '+' : '') + d.toLocaleString('tr-TR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + '%</span>'; }
  tb.innerHTML = MK.map(function (r) {
    return '<tr><td>' + r.n + '</td><td class="ours">' + fmtP(r.o) + '</td>' + r.c.map(function (c, j) { return '<td' + (j > 1 ? ' class="hide-m"' : '') + '>' + fmtP(c) + '</td>'; }).join('') + '<td>' + diffCell(r) + '</td></tr>';
  }).join('');
  var ALERTS = [
    { c: 'bad', ic: 'trending-down', t: 'Rakip B toz şekeri %3,2 düşürdü', s: 'Fiyatınız piyasanın %1,4 üstünde kaldı' },
    { c: 'ok', ic: 'sparkles', t: 'Fırsat: Baldo pirinç', s: 'Tedarikçi teklifi %6 düştü, marj artırılabilir' },
    { c: 'warn', ic: 'bell-ring', t: 'Beyaz peynirde fiyat savaşı', s: 'Son 24 saatte 3 rakip fiyat değiştirdi' },
    { c: 'bad', ic: 'trending-up', t: 'Çayda pahalı kaldınız', s: 'Rakip C sizden ₺5,00 ucuz' },
    { c: 'ok', ic: 'badge-check', t: 'Ayçiçek yağı en uygun 2. fiyat', s: 'Piyasa ortalamasının %1,2 altındasınız' }
  ];
  var alEl = $('#alerts'), ai = 0;
  function pushAlert() {
    var a = ALERTS[ai++ % ALERTS.length];
    var d = document.createElement('div'); d.className = 'alert';
    d.innerHTML = '<span class="ic ' + a.c + '">' + icon(a.ic) + '</span><span><b>' + a.t + '</b><small>' + a.s + '</small></span>';
    alEl.insertBefore(d, alEl.firstChild);
    while (alEl.children.length > 3) alEl.removeChild(alEl.lastChild);
  }
  pushAlert(); pushAlert(); pushAlert();

  var spark = $('#spark'), sctx = spark.getContext('2d');
  var series = [];
  for (var i = 0; i < 30; i++) series.push(300 - i * .35 + Math.sin(i / 2.6) * 2.4 + (Math.random() - .5) * 1.6);
  series[29] = 289.9;
  var avgS = series.map(function (v, i) { return v + 6 + Math.sin(i / 4) * 2; });
  var sProg = 0;
  function drawSpark() {
    var W = spark.width, H = spark.height, all = series.concat(avgS);
    var mn = Math.min.apply(null, all) - 3, mx = Math.max.apply(null, all) + 3;
    var X = function (i) { return 8 + i / (series.length - 1) * (W - 16); }, Y = function (v) { return H - 10 - (v - mn) / (mx - mn) * (H - 20); };
    sctx.clearRect(0, 0, W, H);
    var n = Math.max(2, Math.round(series.length * sProg));
    sctx.setLineDash([6, 6]); sctx.lineWidth = 3; sctx.strokeStyle = 'rgba(157,180,175,.55)'; sctx.beginPath();
    for (var i = 0; i < n; i++) { i ? sctx.lineTo(X(i), Y(avgS[i])) : sctx.moveTo(X(i), Y(avgS[i])); } sctx.stroke(); sctx.setLineDash([]);
    var g = sctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(244,163,42,.35)'); g.addColorStop(1, 'rgba(244,163,42,0)');
    sctx.beginPath(); for (i = 0; i < n; i++) { i ? sctx.lineTo(X(i), Y(series[i])) : sctx.moveTo(X(i), Y(series[i])); }
    sctx.lineTo(X(n - 1), H); sctx.lineTo(X(0), H); sctx.closePath(); sctx.fillStyle = g; sctx.fill();
    sctx.beginPath(); for (i = 0; i < n; i++) { i ? sctx.lineTo(X(i), Y(series[i])) : sctx.moveTo(X(i), Y(series[i])); }
    sctx.strokeStyle = '#F4A32A'; sctx.lineWidth = 4; sctx.lineJoin = 'round'; sctx.stroke();
    sctx.beginPath(); sctx.arc(X(n - 1), Y(series[n - 1]), 7, 0, 7); sctx.fillStyle = '#fff'; sctx.fill();
    sctx.beginPath(); sctx.arc(X(n - 1), Y(series[n - 1]), 4, 0, 7); sctx.fillStyle = '#F4A32A'; sctx.fill();
  }
  drawSpark();
  onSeen(spark, function () {
    var t0 = performance.now();
    (function f(t) { sProg = Math.min(1, (t - t0) / 1800); drawSpark(); if (sProg < 1) requestAnimationFrame(f); })(t0);
  });

  var mVisible = whileSeen($('#piyasa'), function () {});
  var tickN = 0;
  if (!reduce) setInterval(function () {
    if (!mVisible()) return;
    var rows = $$('tr', tb);
    for (var k = 0; k < 2; k++) {
      var ri = Math.floor(Math.random() * MK.length), ci = Math.floor(Math.random() * 3), r = MK[ri];
      var old = r.c[ci], nv = Math.round((old * (1 + (Math.random() - .5) * .05)) * 10) / 10 - 0.1 * (Math.random() < .5 ? 1 : 0);
      nv = Math.max(r.o * .88, Math.min(r.o * 1.14, nv));
      r.c[ci] = nv;
      var td = rows[ri].children[ci + 2];
      td.innerHTML = fmtP(nv) + '<span class="arrow ' + (nv > old ? 'u' : 'd') + '"></span>';
      td.classList.remove('up', 'down'); void td.offsetWidth; td.classList.add(nv > old ? 'up' : 'down');
      rows[ri].lastChild.innerHTML = diffCell(r);
    }
    if (++tickN % 3 === 0) pushAlert();
    if (tickN % 2 === 0) {
      series.push(series[series.length - 1] + (Math.random() - .5) * 3); series.shift();
      avgS.push(avgS[avgS.length - 1] + (Math.random() - .5) * 2); avgS.shift();
      sProg = 1; drawSpark();
      var sug = Math.round((MK[0].c.reduce(function (a, b) { return a + b; }, 0) / 3 * .988) * 10) / 10 - .1;
      $('#sugPrice').textContent = tl(sug);
    }
  }, 1700);

  /* ---------- Lojistik ---------- */
  var lTabs = $$('#logiTabs button'), panes = $$('.logi-pane');
  lTabs.forEach(function (b) {
    b.addEventListener('click', function () {
      lTabs.forEach(function (x) { x.classList.toggle('on', x === b); });
      panes.forEach(function (p) { var on = p.getAttribute('data-pane') === b.getAttribute('data-p'); p.classList.toggle('on', on); if (on) p.classList.add('anim-swap'); });
      if (b.getAttribute('data-p') === 'depo') pickRun();
    });
  });
  onSeen($('#logiStage'), function () { $$('.cap i').forEach(function (c) { c.style.width = c.getAttribute('data-w') + '%'; }); });
  var bc = $('#barcode'), bars = '';
  for (i = 0; i < 46; i++) bars += '<i style="width:' + [1, 2, 3, 1, 4][Math.floor(Math.random() * 5)] + 'px"></i>';
  bc.innerHTML = bars;
  var pickT;
  function pickRun() {
    clearInterval(pickT);
    var items = $$('#pick div'), k = 0;
    items.forEach(function (d) { d.classList.remove('done'); });
    pickT = setInterval(function () {
      if (k < items.length) { items[k++].classList.add('done'); }
      else { k = 0; items.forEach(function (d) { d.classList.remove('done'); }); }
    }, 1300);
  }

  // Telefonda haritanın tamamı görünsün
  var mapSvg = $('#map svg');
  function mapFit() { mapSvg.setAttribute('preserveAspectRatio', innerWidth <= 640 ? 'xMidYMid meet' : 'xMidYMid slice'); }
  mapFit(); window.addEventListener('resize', mapFit);

  /* ---------- Masaüstü ekranları ---------- */
  var dBtns = $$('#devTabs button'), lImgs = $$('#lapScr img'), di = 0, dTimer;
  function devGo(i) { di = i; dBtns.forEach(function (b, j) { b.classList.toggle('on', j === i); }); lImgs.forEach(function (im, j) { im.classList.toggle('on', j === i); }); }
  var devVisible = whileSeen($('#lapScr'), function () {});
  function devAuto() { clearInterval(dTimer); if (!reduce) dTimer = setInterval(function () { if (devVisible()) devGo((di + 1) % lImgs.length); }, 4200); }
  dBtns.forEach(function (b, i) { b.addEventListener('click', function () { devGo(i); devAuto(); }); });
  devAuto();

  /* ---------- Sayaçlar ---------- */
  $$('[data-count]').forEach(function (el) {
    onSeen(el, function () {
      var to = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '', t0 = performance.now();
      if (!to) { el.textContent = '0' + suf; return; }
      (function f(t) { var k = Math.min(1, (t - t0) / 1500), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e) + suf; if (k < 1) requestAnimationFrame(f); })(t0);
    }, 0.6);
  });

  /* ---------- Kart ışığı ---------- */
  $$('.s-card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  /* ---------- SSS ---------- */
  $$('#faq .qa').forEach(function (q) {
    $('button', q).addEventListener('click', function () {
      var open = !q.classList.contains('open');
      $$('#faq .qa').forEach(function (x) { x.classList.remove('open'); $('button', x).setAttribute('aria-expanded', 'false'); });
      if (open) { q.classList.add('open'); this.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- İletişim ---------- */
  var cc = $('#contactCards'), cards = '';
  if (CONFIG.phone) cards += '<a href="tel:' + CONFIG.phone.replace(/\s/g, '') + '"><span class="ic">' + icon('phone') + '</span><span><small>Telefon</small><b>' + CONFIG.phone + '</b></span></a>';
  if (CONFIG.email) cards += '<a href="mailto:' + CONFIG.email + '"><span class="ic">' + icon('mail') + '</span><span><small>E-posta</small><b>' + CONFIG.email + '</b></span></a>';
  if (CONFIG.whatsapp) cards += '<a href="https://wa.me/' + CONFIG.whatsapp.replace(/\D/g, '') + '" target="_blank" rel="noopener"><span class="ic">' + icon('message-circle') + '</span><span><small>WhatsApp</small><b>' + CONFIG.whatsapp + '</b></span></a>';
  cc.innerHTML = cards;
  if (!cards) cc.style.display = 'none';

  var form = $('#form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = [];
    $$('input[required], select[required]', form).forEach(function (el) {
      var ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== '' && (el.type !== 'email' || /.+@.+\..+/.test(el.value));
      var f = el.closest('.field'); if (f) f.classList.toggle('err', !ok);
      if (!ok) bad.push(el);
    });
    if (bad.length) { bad[0].focus(); toast(bad[0].type === 'checkbox' ? 'Lütfen onay kutusunu işaretleyin.' : 'Lütfen işaretli alanları doldurun.'); return; }
    var v = function (n) { return (form.elements[n].value || '').trim(); };
    if (CONFIG.email) {
      var body = 'Ad soyad: ' + v('ad') + '\nFirma: ' + v('firma') + '\nTelefon: ' + v('tel') + '\nE-posta: ' + v('mail') + '\nMağaza sayısı: ' + v('say') + '\n\n' + v('not');
      location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent('PERAMAR demo talebi — ' + v('firma')) + '&body=' + encodeURIComponent(body);
      $('#okMsg').textContent = 'E-posta uygulamanız açıldı. Gönder düğmesine bastığınızda talebiniz bize ulaşır.';
    } else {
      $('#okMsg').textContent = 'Bu sayfa bir tanıtım önizlemesidir; talep formu yakında aktif olacak. Bu arada canlı demoyu inceleyebilirsiniz.';
    }
    $('#formBox').classList.add('sent');
  });
  $$('input, select', form).forEach(function (el) { el.addEventListener('input', function () { var f = el.closest('.field'); if (f) f.classList.remove('err'); }); });
})();

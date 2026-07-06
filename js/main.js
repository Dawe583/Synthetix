/* ============================================================
   Synthetix — animační engine (1:1 podle šablony)
   Lenis smooth scroll · letter-reveal · sticky pain-point ·
   parallax · scroll-linked karty · widgety
   Každý modul běží izolovaně — jedna chyba nezastaví ostatní.
   ============================================================ */
(function () {
  'use strict';

  var docEl = document.documentElement;
  docEl.classList.add('js');

  /* Bezpečnostní síť: chyba nesmí nechat obsah skrytý ani zabít efekty. */
  function safe(name, fn) {
    try { fn(); } catch (e) {
      if (window.console && console.warn) console.warn('[synthetix]', name, e);
    }
  }

  /* Animace běží VŽDY — žádné systémové nastavení (omezený pohyb,
     úsporný režim) je nevypíná. */
  var reduceMotion = false;

  if (window.console && console.info) console.info('[synthetix] v4 — animační engine aktivní');

  /* ============================================
     1) LENIS SMOOTH SCROLL — desktop i dotyk
     ============================================ */
  var lenis = null;
  safe('lenis', function () {
    if (reduceMotion || typeof Lenis === 'undefined') return;
    docEl.style.scrollBehavior = 'auto'; // nativní smooth koliduje s Lenis
    lenis = new Lenis({
      autoRaf: true,
      anchors: { offset: -80 },
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: true,          // plynulý scroll i na dotykových zařízeních
      syncTouchLerp: 0.075,
      touchInertiaExponent: 1.7
    });
  });

  /* ============================================
     2) NAV — pozadí po scrollu
     ============================================ */
  safe('nav', function () {
    var nav = document.getElementById('nav');
    if (!nav) return;
    function navState() {
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    window.addEventListener('scroll', navState, { passive: true });
    navState();
  });

  /* ============================================
     3) LETTER-SPLIT — rozdělení nadpisů na písmena
     ============================================ */
  var splitTargets = [];
  safe('split', function () {
    function splitLetters(el, stagger) {
      if (el.dataset.splitDone) return;
      el.dataset.splitDone = '1';
      el.setAttribute('data-split', '');
      var charIndex = 0;
      var nodes = Array.prototype.slice.call(el.childNodes);
      nodes.forEach(function (node) {
        if (node.nodeType === 3) {
          var frag = document.createDocumentFragment();
          var words = node.textContent.split(/(\s+)/);
          words.forEach(function (word) {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'w';
            for (var i = 0; i < word.length; i++) {
              var ch = document.createElement('span');
              ch.className = 'ch';
              ch.textContent = word[i];
              ch.style.setProperty('--d', (charIndex * stagger) + 'ms');
              charIndex++;
              w.appendChild(ch);
            }
            frag.appendChild(w);
          });
          el.replaceChild(frag, node);
        }
        // elementy (<br>) zůstávají beze změny
      });
    }
    document.querySelectorAll('h1, .head h2, .pain__title h2, .tst__head h2, .cta__inner h2, .blog__top h2').forEach(function (h) {
      splitLetters(h, 14);
      splitTargets.push(h);
    });
    var heroSub = document.querySelector('.hero__subtitle p');
    if (heroSub) { splitLetters(heroSub, 6); splitTargets.push(heroSub); }
  });

  /* ============================================
     4) REVEAL — IntersectionObserver
     ============================================ */
  safe('reveal', function () {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
      splitTargets.forEach(function (el) {
        if (el.closest('.hero')) return; // hero řídí intro sekvence
        io.observe(el);
      });
    } else {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      splitTargets.forEach(function (el) { el.classList.add('in'); });
    }
  });

  /* ============================================
     5) HERO — appear sekvence při načtení
     ============================================ */
  safe('heroIntro', function () {
    function heroIntro() {
      document.body.classList.add('loaded');
      var h1 = document.querySelector('.hero h1');
      var sub = document.querySelector('.hero__subtitle p');
      setTimeout(function () { if (sub) sub.classList.add('in'); }, 350);
      setTimeout(function () { if (h1) h1.classList.add('in'); }, 650);
    }
    if (document.readyState === 'complete') heroIntro();
    else window.addEventListener('load', heroIntro);
    // pojistka: kdyby load nikdy nepřišel (viset na assetu), spustit po 2,5 s
    setTimeout(function () {
      if (!document.body.classList.contains('loaded')) heroIntro();
    }, 2500);
  });

  /* ============================================
     6) VIDEA — MP4 (H.264) + WebM, retry autoplay,
        fallback jen když selžou všechny zdroje
     ============================================ */
  safe('videos', function () {
    var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-video]'));
    if (!videos.length) return;

    function tryPlay(v) {
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* autoplay blokován — retry při interakci */ });
    }

    videos.forEach(function (v) {
      v.muted = true; // jistota pro autoplay policy
      v.addEventListener('playing', function () { v.classList.add('playing'); });
      v.addEventListener('error', function () {
        if (v.networkState === 3 /* NETWORK_NO_SOURCE */) v.style.display = 'none';
      }, true);
      var lastSource = v.querySelector('source:last-of-type');
      if (lastSource) lastSource.addEventListener('error', function () { v.style.display = 'none'; });
      tryPlay(v);
    });

    // iOS Low Power Mode apod.: zkusit přehrát při první interakci
    function retryAll() {
      videos.forEach(function (v) { if (v.paused) tryPlay(v); });
      document.removeEventListener('touchend', retryAll);
      document.removeEventListener('click', retryAll);
    }
    document.addEventListener('touchend', retryAll, { passive: true });
    document.addEventListener('click', retryAll);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) videos.forEach(function (v) { if (v.paused) tryPlay(v); });
    });
  });

  /* ============================================
     7) SCROLL-LINKED ENGINE — jediná rAF smyčka
     ============================================ */
  safe('scrollFx', function () {
    var linked = [];
    function clamp01(x) { return Math.max(0, Math.min(1, x)); }
    function link(el, fn) { if (el) linked.push({ el: el, fn: fn }); }

    // -- Pain point: sticky, rotace kruhů, zoom, pilulky po prazích --
    var pain = document.getElementById('pain');
    var rings = pain ? pain.querySelector('.pain__rings') : null;
    var painTitle = pain ? pain.querySelector('.pain__title') : null;
    var pills = pain ? Array.prototype.slice.call(pain.querySelectorAll('.pill')) : [];
    var pillThresholds = [0.06, 0.2, 0.34, 0.48, 0.62];
    if (pain && !reduceMotion) {
      link(pain, function (r, vh) {
        var travel = r.height - vh;
        var p = clamp01(-r.top / (travel > 0 ? travel : 1));
        if (rings) {
          rings.style.transform = 'translate(-50%, -50%) rotate(' + (-320 * p) + 'deg) scale(' + (0.75 + 0.45 * p) + ')';
        }
        pills.forEach(function (pill, i) {
          if (p >= pillThresholds[i]) pill.classList.add('show');
          else pill.classList.remove('show');
        });
        if (painTitle) {
          var tp = clamp01((p - 0.08) * 3);
          painTitle.style.opacity = tp;
          painTitle.style.transform = 'scale(' + (0.92 + 0.08 * tp) + ')';
        }
      });
    } else if (pain) {
      pills.forEach(function (pill) { pill.classList.add('show'); });
      if (painTitle) { painTitle.style.opacity = 1; painTitle.style.transform = 'none'; }
    }

    // -- Work karty: perspektivní náklon při vjezdu + parallax média (obrázek i video) --
    document.querySelectorAll('.work').forEach(function (card) {
      var media = Array.prototype.slice.call(card.querySelectorAll('.work__media img, .work__media video'));
      if (reduceMotion) return;
      link(card, function (r, vh) {
        var p = clamp01((vh - r.top) / (vh * 0.65));
        var rot = (1 - p) * 9;
        var ty = (1 - p) * 60;
        card.style.transform = 'perspective(1200px) rotateX(' + rot + 'deg) translateY(' + ty + 'px)';
        card.style.opacity = 0.2 + 0.8 * p;
        var cp = clamp01((vh - r.top) / (vh + r.height));
        var mt = 'scale(1.12) translateY(' + ((cp - 0.5) * -36) + 'px)';
        for (var i = 0; i < media.length; i++) media[i].style.transform = mt;
      });
    });

    // -- Kroky (Jak to funguje): scroll-linked dorovnání offsetů --
    var stepsWrap = document.querySelector('.steps');
    if (stepsWrap && !reduceMotion) {
      var steps = Array.prototype.slice.call(stepsWrap.querySelectorAll('.step'));
      link(stepsWrap, function (r, vh) {
        var p = clamp01((vh - r.top) / (vh * 0.8));
        steps.forEach(function (s, i) {
          var pi = clamp01(p * 1.5 - i * 0.18);
          s.style.setProperty('--shift', ((1 - pi) * (70 + i * 30)) + 'px');
          s.style.opacity = 0.15 + 0.85 * pi;
        });
      });
    }

    // -- Služby: slide-in zprava; vzdálenost omezená volným místem
    //    vpravo, aby nikdy nerozšířila layout (mobil) --
    document.querySelectorAll('.service').forEach(function (card) {
      if (reduceMotion) return;
      var maxSlide = 120;
      function measure() {
        var prevT = card.style.transform;
        card.style.transform = 'none';
        var rr = card.getBoundingClientRect();
        var free = docEl.clientWidth - rr.right - 4;
        maxSlide = Math.max(0, Math.min(120, free));
        card.style.transform = prevT;
      }
      measure();
      window.addEventListener('resize', measure);
      link(card, function (r, vh) {
        var p = clamp01((vh - r.top) / (vh * 0.6));
        card.style.transform = 'translateX(' + ((1 - p) * maxSlide) + 'px)';
        card.style.opacity = 0.3 + 0.7 * p;
      });
    });

    // -- Parallax pozadí (Proč my + CTA) --
    function parallax(imgSel, speed) {
      var img = document.querySelector(imgSel);
      if (!img || reduceMotion) return;
      var wrap = img.parentElement;
      img.style.transform = 'scale(1.18)';
      link(wrap, function (r, vh) {
        var center = (r.top + r.height / 2 - vh / 2) / vh;
        center = Math.max(-1, Math.min(1, center)); // clamp — obraz neuteče z masky
        img.style.transform = 'scale(1.18) translateY(' + (center * speed * 60) + 'px)';
      });
    }
    parallax('.why__bg img', 0.8);
    parallax('.cta__bg img', 0.6);

    // -- hlavní smyčka --
    if (linked.length && !reduceMotion) {
      (function loop() {
        if (!document.hidden) {
          var vh = window.innerHeight;
          for (var i = 0; i < linked.length; i++) {
            var item = linked[i];
            try { item.fn(item.el.getBoundingClientRect(), vh); } catch (e) { /* izolace snímku */ }
          }
        }
        requestAnimationFrame(loop);
      })();
    }
  });

  /* ============================================
     8) TLAČÍTKA — hover slide textu
     ============================================ */
  safe('buttons', function () {
    document.querySelectorAll('.btn').forEach(function (btn) {
      var textNode = null;
      for (var i = 0; i < btn.childNodes.length; i++) {
        var n = btn.childNodes[i];
        if (n.nodeType === 3 && n.textContent.trim()) { textNode = n; break; }
      }
      if (!textNode) return;
      var label = textNode.textContent.trim();
      var wrap = document.createElement('span');
      wrap.className = 'btn__label';
      wrap.innerHTML = '<span class="btn__t1"></span><span class="btn__t2" aria-hidden="true"></span>';
      wrap.querySelector('.btn__t1').textContent = label;
      wrap.querySelector('.btn__t2').textContent = label;
      btn.replaceChild(wrap, textNode);
    });
  });

  /* ============================================
     9) FAQ AKORDEON
     ============================================ */
  safe('faq', function () {
    var qas = document.querySelectorAll('.qa');
    qas.forEach(function (qa) {
      qa.querySelector('.qa__q').addEventListener('click', function () {
        var isOpen = qa.classList.contains('open');
        qas.forEach(function (o) { o.classList.remove('open'); });
        if (!isOpen) qa.classList.add('open');
      });
    });
  });

  /* ============================================
     10) REFERENCE SLIDER
     ============================================ */
  safe('slider', function () {
    var track = document.getElementById('tstTrack');
    var prev = document.getElementById('tstPrev');
    var next = document.getElementById('tstNext');
    if (!track || !prev || !next) return;
    var index = 0, total = track.children.length;
    function render() { track.style.transform = 'translateX(' + (-index * 100) + '%)'; }
    prev.addEventListener('click', function () { index = (index - 1 + total) % total; render(); });
    next.addEventListener('click', function () { index = (index + 1) % total; render(); });
    var auto = setInterval(function () { index = (index + 1) % total; render(); }, 6000);
    track.parentElement.addEventListener('mouseenter', function () { clearInterval(auto); });
  });

  /* ============================================
     11) CENÍK — přepínač s blur crossfade
     ============================================ */
  safe('pricing', function () {
    var sw = document.getElementById('switch');
    if (!sw) return;
    var buttons = sw.querySelectorAll('button');
    var thumb = document.getElementById('switchThumb');
    var amounts = document.querySelectorAll('.plan__price .amount');

    function positionThumb(btn) {
      thumb.style.width = btn.offsetWidth + 'px';
      thumb.style.transform = 'translateX(' + (btn.offsetLeft - 4) + 'px)';
    }
    function setMode(mode, btn) {
      buttons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      positionThumb(btn);
      amounts.forEach(function (a) {
        a.classList.add('swap');
        setTimeout(function () {
          a.textContent = mode === 'yearly' ? a.getAttribute('data-yearly') : a.getAttribute('data-monthly');
          a.classList.remove('swap');
        }, 280);
      });
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode'), b); });
    });
    setTimeout(function () { positionThumb(buttons[0]); }, 60);
    window.addEventListener('resize', function () {
      var active = sw.querySelector('button.active');
      if (active) positionThumb(active);
    });
  });

  /* ============================================
     12) POČÍTADLA
     ============================================ */
  safe('counters', function () {
    var counters = document.querySelectorAll('.num__val[data-count]');
    if (!('IntersectionObserver' in window) || !counters.length) return;
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var numSpan = el.querySelector('span:first-child');
        var dur = 1100, t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          numSpan.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cIO.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cIO.observe(c); });
  });

  /* ============================================
     13) MOBILNÍ MENU
     ============================================ */
  safe('mobileMenu', function () {
    var toggle = document.querySelector('.nav__toggle');
    var menu = document.querySelector('.nav__menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      var open = menu.style.display === 'flex';
      menu.style.display = open ? '' : 'flex';
      menu.style.position = 'absolute';
      menu.style.top = '72px';
      menu.style.left = '0';
      menu.style.right = '0';
      menu.style.flexDirection = 'column';
      menu.style.gap = '4px';
      menu.style.padding = '16px 24px';
      menu.style.background = 'rgba(6,6,8,0.96)';
      menu.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
      menu.style.backdropFilter = 'blur(14px)';
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth <= 860) menu.style.display = '';
      });
    });
  });
})();

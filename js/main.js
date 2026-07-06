/* ============================================================
   Synthetix — interakce
   ============================================================ */
(function () {
  'use strict';

  /* ---- Nav: přidání pozadí po scrollu ---- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reveal animace při scrollu ---- */
  var revealEls = document.querySelectorAll('.reveal');
  var painSection = document.getElementById('pain');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { io.observe(el); });

    if (painSection) {
      var painIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { painSection.classList.add('in'); painIO.unobserve(e.target); }
        });
      }, { threshold: 0.35 });
      painIO.observe(painSection);
    }
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    if (painSection) painSection.classList.add('in');
  }

  /* ---- FAQ akordeon ---- */
  var qas = document.querySelectorAll('.qa');
  qas.forEach(function (qa) {
    var q = qa.querySelector('.qa__q');
    q.addEventListener('click', function () {
      var isOpen = qa.classList.contains('open');
      qas.forEach(function (o) { o.classList.remove('open'); });
      if (!isOpen) qa.classList.add('open');
    });
  });

  /* ---- Reference slider ---- */
  var track = document.getElementById('tstTrack');
  var prev = document.getElementById('tstPrev');
  var next = document.getElementById('tstNext');
  if (track && prev && next) {
    var index = 0;
    var total = track.children.length;
    function render() { track.style.transform = 'translateX(' + (-index * 100) + '%)'; }
    prev.addEventListener('click', function () { index = (index - 1 + total) % total; render(); });
    next.addEventListener('click', function () { index = (index + 1) % total; render(); });
    var auto = setInterval(function () { index = (index + 1) % total; render(); }, 6000);
    track.parentElement.addEventListener('mouseenter', function () { clearInterval(auto); });
  }

  /* ---- Přepínač ceníku (měsíčně / ročně) ---- */
  var sw = document.getElementById('switch');
  if (sw) {
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
        a.textContent = mode === 'yearly' ? a.getAttribute('data-yearly') : a.getAttribute('data-monthly');
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode'), b); });
    });

    // počáteční pozice
    setTimeout(function () { positionThumb(buttons[0]); }, 60);
    window.addEventListener('resize', function () {
      var active = sw.querySelector('button.active');
      if (active) positionThumb(active);
    });
  }

  /* ---- Počítadla čísel ---- */
  var counters = document.querySelectorAll('.num__val[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var numSpan = el.querySelector('span:first-child');
        var start = 0;
        var dur = 1100;
        var t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          numSpan.textContent = Math.round(start + (target - start) * eased);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cIO.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cIO.observe(c); });
  }

  /* ---- Mobilní menu (jednoduché) ---- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.querySelector('.nav__menu');
  if (toggle && menu) {
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
  }
})();

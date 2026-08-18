/* Método Escrita Invisível — comportamento mínimo.
   A página é integralmente funcional sem este arquivo. */

/* PONTO DE TROCA DO CHECKOUT
   Substitua o valor por uma URL real e descomente a linha de aplicação
   dentro de applyCheckoutUrl() para redirecionar todos os CTAs de uma vez. */
var CHECKOUT_URL = '#investimento';

/* marca que há JS antes da primeira pintura: os estados iniciais de
   animação só existem sob .js, então nada some com JS desativado */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOPBAR_AT = 600;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* --- CTAs ------------------------------------------------------------- */

  function applyCheckoutUrl() {
    if (CHECKOUT_URL === '#investimento') return;
    // document.querySelectorAll('[data-cta]').forEach(function (a) { a.href = CHECKOUT_URL; });
  }

  /* --- 1 · revelação em tinta invisível (hero, uma vez) ------------------ */

  function wrapWords(node) {
    var children = Array.prototype.slice.call(node.childNodes);
    var spans = [];

    children.forEach(function (child) {
      if (child.nodeType === 3) {
        var frag = document.createDocumentFragment();
        child.nodeValue.split(/(\s+)/).forEach(function (token) {
          if (token === '') return;
          if (/^\s+$/.test(token)) {
            frag.appendChild(document.createTextNode(token));
          } else {
            var span = document.createElement('span');
            span.className = 'w';
            span.textContent = token;
            frag.appendChild(span);
            spans.push(span);
          }
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        spans = spans.concat(wrapWords(child));
      }
    });

    return spans;
  }

  function inkReveal() {
    var title = document.querySelector('[data-ink-reveal]');
    if (!title || reduced) return;

    var words = wrapWords(title);
    if (!words.length) return;

    /* 320ms de duração + escalonamento: total abaixo de ~500ms */
    var step = Math.min(24, 180 / words.length);
    words.forEach(function (w, i) {
      w.style.setProperty('--d', Math.round(i * step) + 'ms');
    });

    requestAnimationFrame(function () {
      title.classList.add('is-revealed');
    });
  }

  /* --- 2 · header fixo --------------------------------------------------- */

  function topbar() {
    var bar = document.getElementById('topbar');
    if (!bar) return;

    var shown = null;
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      var show = y > TOPBAR_AT;
      if (show === shown) return;
      shown = show;
      bar.classList.toggle('is-visible', show);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* --- 3 · reveals de scroll -------------------------------------------- */

  function reveals() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-in');
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentNode ? el.parentNode.querySelectorAll(':scope > .reveal') : [];
        var index = Array.prototype.indexOf.call(siblings, el);
        el.style.transitionDelay = Math.min(index < 0 ? 0 : index, 4) * 55 + 'ms';
        el.classList.add('is-in');
        observer.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });

    for (var k = 0; k < items.length; k++) observer.observe(items[k]);
  }

  /* --- 4 · acordeão do FAQ ---------------------------------------------- */

  function faq() {
    var buttons = document.querySelectorAll('.qa__btn');
    if (!buttons.length) return;

    Array.prototype.forEach.call(buttons, function (btn, i) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;

      var open = i === 0;
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;

      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });
    });
  }

  ready(function () {
    applyCheckoutUrl();
    inkReveal();
    topbar();
    reveals();
    faq();
  });
})();

/* Método Escrita Invisível — comportamento mínimo.
   A página é integralmente funcional sem este arquivo. */

/* CHECKOUT
   A URL fica no href dos 10 CTAs, direto no HTML — de propósito. Assim o botão
   funciona mesmo se este arquivo falhar ou demorar a carregar, que é a pior
   falha possível numa página de venda. Para trocar: buscar e substituir
   "pay.hotmart.com/..." no index.html (10 ocorrências, todas idênticas). */

/* A classe .js é adicionada por um script inline no <head>, antes da primeira
   pintura. Este arquivo é carregado com defer e não bloqueia a renderização. */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOPBAR_AT = 600;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
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

  /* A barra aparece quando o CTA da hero sai de vista — nunca por um limiar
     em pixels. Assim nunca há dois botões iguais na tela ao mesmo tempo, e a
     regra se adapta sozinha a qualquer altura de viewport. */
  function topbar() {
    var bar = document.getElementById('topbar');
    if (!bar) return;

    var anchor = document.querySelector('.hero__act');

    if (anchor && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        bar.classList.toggle('is-visible', !entries[0].isIntersecting);
      }, { threshold: 0 }).observe(anchor);
      return;
    }

    /* fallback para navegadores sem IntersectionObserver */
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

  /* --- 4 · fachadas de vídeo -------------------------------------------- */

  /* Sem JS, cada fachada é só um link que abre o vídeo no YouTube. Com JS,
     o clique troca a miniatura pelo player — nenhum byte do YouTube antes disso. */
  function shorts() {
    var fachadas = document.querySelectorAll('.short[data-yt]');

    Array.prototype.forEach.call(fachadas, function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var img = a.querySelector('img');
        var frame = document.createElement('iframe');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + a.getAttribute('data-yt') +
                    '?autoplay=1&rel=0';
        frame.title = img ? img.alt : a.href;
        frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.setAttribute('allowfullscreen', '');
        a.parentNode.replaceChild(frame, a);
        frame.focus();
      });
    });
  }

  /* --- 5 · acordeão do FAQ ---------------------------------------------- */

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
    inkReveal();
    topbar();
    reveals();
    shorts();
    faq();
  });
})();

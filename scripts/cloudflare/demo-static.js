/* Comportamentos que, no site real, dependem do servidor. Aqui rodam no navegador (versão estática para a Cloudflare). */
(function () {
  'use strict';
  var norm = function (s) { return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* 0. Sem servidor: responde localmente ao que o Next.js e o site pediriam ao servidor (pré-carregamento RSC e /api). */
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  if (realFetch) {
    window.fetch = function (input, init) {
      try {
        var raw = typeof input === 'string' ? input : input && input.url ? input.url : String(input);
        var u = new URL(raw, location.href);
        if (u.origin === location.origin) {
          var h = (init && init.headers) || (input && input.headers);
          var rsc = u.searchParams.has('_rsc') || (h && (typeof h.get === 'function' ? h.get('rsc') : h.rsc || h.RSC));
          if (rsc) return Promise.resolve(new Response('', { status: 404 }));
          if (u.pathname.indexOf('/api/') === 0) return Promise.resolve(new Response(null, { status: 204 }));
        }
      } catch (_) {}
      return realFetch(input, init);
    };
  }

  /* 1. Links internos: carregamento normal da página (evita requisições RSC que não existem em hospedagem estática). */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var u; try { u = new URL(a.href, location.href); } catch (_) { return; }
    if (u.origin !== location.origin) return;
    if (u.pathname === location.pathname && u.search === location.search && u.hash) return;
    if (/\.(pdf|xml|txt|png|jpe?g|webp|svg)$/i.test(u.pathname)) return;
    e.preventDefault(); e.stopPropagation(); location.assign(u.href);
  }, true);

  /* 2. Formulários: busca/filtros (GET) e contato (demonstração). */
  function alertBox(tone, title, text) {
    return '<div role="' + (tone === 'danger' ? 'alert' : 'status') + '" class="su-alert su-alert--' + tone + '"><div class="su-alert__body"><div class="su-alert__title">' + esc(title) + '</div><div class="su-alert__text">' + esc(text) + '</div></div></div>';
  }
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!(f instanceof HTMLFormElement)) return;
    if (f.classList.contains('su-form')) {
      e.preventDefault(); e.stopPropagation();
      var g = function (n) { var el = f.elements[n]; return !el ? '' : el.type === 'checkbox' ? el.checked : String(el.value || '').trim(); };
      var bad = !g('name') || !/^\S+@\S+\.\S+$/.test(g('email')) || !g('subject') || !g('message') || !g('consent');
      var old = f.querySelector('[data-demo-msg]'); if (old) old.remove();
      if (bad) {
        var d = document.createElement('div'); d.setAttribute('data-demo-msg', '');
        d.innerHTML = alertBox('danger', 'Não foi possível enviar', 'Preencha nome, e-mail válido, assunto e mensagem, e aceite o tratamento dos dados.');
        f.insertBefore(d, f.firstChild); return;
      }
      var ok = document.createElement('div');
      ok.innerHTML = alertBox('success', 'Mensagem enviada', 'Recebemos sua mensagem. Esta é uma versão de demonstração: nenhum dado foi armazenado.');
      f.replaceWith(ok); return;
    }
    if (f.getAttribute('role') === 'search' || f.classList.contains('su-filters')) {
      e.preventDefault(); e.stopPropagation();
      var p = new URLSearchParams();
      new FormData(f).forEach(function (v, k) { if (typeof v === 'string' && v.trim() !== '') p.set(k, v.trim()); });
      var target = f.getAttribute('action') || (f.classList.contains('su-filters') ? location.pathname : '/busca');
      location.assign(target + (p.toString() ? '?' + p.toString() : ''));
    }
  }, true);

  /* 3. Ao carregar: aplica filtros da URL nas listas e monta a busca. Espera a hidratação do React terminar. */
  function applyFilters(form, params) {
    var words = [], phrases = [], order = null;
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'submit') return;
      var v = params.get(el.name); if (!v) return;
      if (el.tagName === 'SELECT') {
        el.value = v;
        if (el.name === 'ordem') { order = v; return; }
        var opt = Array.prototype.filter.call(el.options, function (o) { return o.value === v; })[0];
        if (opt && opt.text) phrases.push(norm(opt.text));
      } else { el.value = v; words = words.concat(norm(v).split(/\s+/).filter(Boolean)); }
    });
    var grid = form.parentElement.querySelector('.su-grid');
    if (!grid) return;
    var items = Array.prototype.slice.call(grid.children);
    var visible = 0;
    items.forEach(function (it) {
      var t = norm(it.textContent);
      var ok = words.every(function (w) { return t.indexOf(w) !== -1; }) && phrases.every(function (ph) { return t.indexOf(ph) !== -1; });
      it.style.display = ok ? '' : 'none'; if (ok) visible++;
    });
    if (order === 'antigas') items.slice().reverse().forEach(function (it) { grid.appendChild(it); });
    var count = form.parentElement.querySelector('p.su-muted[aria-live]');
    if (count) count.textContent = count.textContent.replace(/^\d+/, String(visible)).replace(visible === 1 ? /publicações encontradas/ : /^$/, 'publicação encontrada').replace(visible === 1 ? /unidades encontradas/ : /^$/, 'unidade encontrada');
    var none = grid.parentElement.querySelector('[data-demo-none]'); if (none) none.remove();
    if (!visible) { var n = document.createElement('p'); n.className = 'su-muted'; n.setAttribute('data-demo-none', ''); n.textContent = 'Nenhum resultado para os filtros escolhidos. Tente outra palavra ou remova os filtros.'; grid.after(n); }
  }

  function runSearch(q) {
    var box = document.querySelector('main .su-stack') || document.querySelector('main');
    var input = document.getElementById('b-q'); if (input) input.value = q;
    if (!q || !box) return;
    fetch('/search-index.json').then(function (r) { return r.json(); }).then(function (idx) {
      var words = norm(q).split(/\s+/).filter(Boolean);
      var hits = idx.filter(function (it) { var t = norm(it.t + ' ' + it.x); return words.every(function (w) { return t.indexOf(w) !== -1; }); });
      var groups = {};
      hits.forEach(function (h) { (groups[h.g] = groups[h.g] || []).push(h); });
      var html = '';
      ['Unidades', 'Serviços', 'Campanhas', 'Notícias'].forEach(function (g) {
        if (!groups[g]) return;
        html += '<section><h2 style="font:var(--text-h3);margin-bottom:var(--space-3)">' + g + '</h2><ul>' +
          groups[g].slice(0, 8).map(function (h) { return '<li><a href="' + esc(h.u) + '">' + esc(h.t) + '</a>' + (h.d ? ' <span class="su-muted">— ' + esc(h.d) + '</span>' : '') + '</li>'; }).join('') + '</ul></section>';
      });
      if (!hits.length) html = '<p class="su-muted" role="status">Nada encontrado para “' + esc(q) + '”. Confira a grafia ou tente uma palavra mais geral.</p>';
      var wrap = document.createElement('div'); wrap.className = 'su-stack'; wrap.innerHTML = html; box.appendChild(wrap);
    }).catch(function () {});
  }

  window.addEventListener('load', function () {
    setTimeout(function () {
      var params = new URLSearchParams(location.search);
      if (location.pathname.replace(/\/$/, '') === '/busca') return runSearch(params.get('q') || '');
      var form = document.querySelector('main form.su-filters');
      if (form && params.toString()) applyFilters(form, params);
    }, 700);
  });
})();

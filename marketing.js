/* NexumCell — medição de anúncios (Pixel do Meta e Google Analytics 4) e origem do visitante.
   Os códigos ficam no Painel do Dono → Configurações → "Anúncios e site" (gravados em publico/vitrine.marketing).
   Sem código configurado, nada é carregado. Com código, as tags só carregam depois que o visitante aceita os cookies (LGPD).
   Uso nas páginas: nxTrack('Lead', {...}) · nxUtm() · nxVitrine (Promise com a vitrine pública). */
(function () {
  var PROJ = (window.NEXUMCELL_FIREBASE || {}).projectId || 'nexumcell';
  /* origem do visitante (UTM, gclid, fbclid): guardada na sessão e enviada junto com os leads */
  try {
    var q = new URLSearchParams(location.search), u = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid'].forEach(function (k) { if (q.get(k)) u[k] = q.get(k).slice(0, 100); });
    if (Object.keys(u).length) { u.pagina = location.pathname.split('/').pop() || 'index'; sessionStorage.setItem('nx_utm', JSON.stringify(u)); }
  } catch (e) { }
  window.nxUtm = function () {
    try { var x = JSON.parse(sessionStorage.getItem('nx_utm') || '{}');
      return { source: x.utm_source || (x.gclid ? 'google' : x.fbclid ? 'facebook' : ''), medium: x.utm_medium || (x.gclid || x.fbclid ? 'cpc' : ''), campaign: x.utm_campaign || '', pagina: x.pagina || location.pathname.split('/').pop() || 'index' };
    } catch (e) { return {}; }
  };
  /* vitrine pública (Firestore REST, sem login) */
  function dec(v) {
    if (!v || typeof v !== 'object') return null;
    if ('stringValue' in v) return v.stringValue; if ('integerValue' in v) return +v.integerValue; if ('doubleValue' in v) return v.doubleValue;
    if ('booleanValue' in v) return v.booleanValue; if ('nullValue' in v) return null; if ('timestampValue' in v) return v.timestampValue;
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(dec);
    if ('mapValue' in v) { var o = {}, f = v.mapValue.fields || {}; for (var k in f) o[k] = dec(f[k]); return o; }
    return null;
  }
  window.nxVitrine = /[?&]demo\b/.test(location.search) ? Promise.resolve(window.NX_VITRINE_DEMO || {}) :
    fetch('https://firestore.googleapis.com/v1/projects/' + PROJ + '/databases/(default)/documents/publico/vitrine')
      .then(function (r) { return r.ok ? r.json() : {}; }).then(function (j) { return dec({ mapValue: { fields: j.fields || {} } }) || {}; }).catch(function () { return {}; });

  /* eventos: ficam na fila até as tags carregarem */
  var fila = [], pronto = false, GA = { Lead: 'generate_lead', Schedule: 'schedule_demo', ViewContent: 'view_item', Contact: 'contact', CompleteRegistration: 'sign_up' };
  window.nxTrack = function (ev, d) { fila.push([ev, d || {}]); descarregar(); };
  function descarregar() { if (!pronto) return; while (fila.length) { var x = fila.shift(); try { if (window.fbq) fbq('track', x[0], x[1]); if (window.gtag) gtag('event', GA[x[0]] || x[0], x[1]); } catch (e) { } } }

  function carregar(m) {
    if (m.metaPixel && /^\d{6,20}$/.test(m.metaPixel)) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', m.metaPixel); fbq('track', 'PageView');
    }
    if (m.ga4 && /^G-[A-Z0-9]{4,20}$/.test(m.ga4)) {
      var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + m.ga4; document.head.appendChild(s);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', m.ga4);
    }
    pronto = true; descarregar();
  }
  function aviso(m) {
    var d = document.createElement('div'); d.id = 'nxCookies';
    d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;max-width:560px;margin:0 auto;background:#0A1733;color:#fff;border-radius:16px;padding:14px 16px;box-shadow:0 18px 40px rgba(0,0,0,.3);font:14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:flex;gap:12px;align-items:center;flex-wrap:wrap';
    d.innerHTML = '<div style="flex:1;min-width:220px">Usamos cookies para medir de onde vêm as visitas e melhorar nossos anúncios. Veja a <a href="' + (location.pathname.indexOf('/cliente/') >= 0 ? 'privacidade.html' : 'privacidade.html') + '" style="color:#E2B33B">política de privacidade</a>.</div><div style="display:flex;gap:8px"><button data-ck="0" style="border:1px solid rgba(255,255,255,.35);background:none;color:#fff;border-radius:10px;padding:8px 12px;font:600 13px inherit;cursor:pointer">Recusar</button><button data-ck="1" style="border:0;background:#E2B33B;color:#0A1733;border-radius:10px;padding:8px 14px;font:700 13px inherit;cursor:pointer">Aceitar</button></div>';
    d.onclick = function (e) { var b = e.target.closest('[data-ck]'); if (!b) return; try { localStorage.setItem('nx_cookies', b.dataset.ck); } catch (er) { } d.remove(); if (b.dataset.ck === '1') carregar(m); };
    document.body.appendChild(d);
  }
  window.nxVitrine.then(function (v) {
    var m = (v && v.marketing) || {}; if (!m.metaPixel && !m.ga4) return;
    var c = null; try { c = localStorage.getItem('nx_cookies'); } catch (e) { }
    if (c === '1') carregar(m); else if (c !== '0') { if (document.body) aviso(m); else addEventListener('DOMContentLoaded', function () { aviso(m); }); }
  });
})();

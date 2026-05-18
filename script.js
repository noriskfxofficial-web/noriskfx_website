
const NRFX = (() => {
  const api = async (path, options = {}) => {
    const res = await fetch(path, { cache: 'no-store', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };
  const iconMap = {
    'graduation-cap':'<svg viewBox="0 0 24 24"><path d="m22 10-10-5-10 5 10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>',
    'workflow':'<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M9 6h6M8 8l8 8"/></svg>',
    'line-chart':'<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m6 16 4-5 4 3 5-8"/></svg>',
    'users':'<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'shield-check':'<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/></svg>',
    'bar-chart':'<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16V9M12 16V5M17 16v-3"/></svg>',
    'layout-dashboard':'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
    'folder-down':'<svg viewBox="0 0 24 24"><path d="M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M12 12v5m0 0 3-3m-3 3-3-3"/></svg>',
    'message-circle':'<svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 1 1 17 0Z"/></svg>'
  };
  const setIcons = () => document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = iconMap[el.dataset.icon] || iconMap['line-chart']; });
  const lang = () => localStorage.getItem('nrfx_lang') || 'ar';
  const setLang = (next = lang()) => {
    localStorage.setItem('nrfx_lang', next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.body.dataset.lang = next;
    document.querySelectorAll('[data-ar][data-en]').forEach(el => { el.textContent = el.dataset[next] || el.textContent; });
    document.querySelectorAll('[data-lang-toggle]').forEach(btn => btn.textContent = next === 'ar' ? 'EN' : 'AR');
    document.dispatchEvent(new CustomEvent('nrfx:lang', { detail: next }));
  };
  const loadContent = async () => {
    try {
      const data = await api('/api/public/content');
      window.NRFX_CONTENT = data;
      applyContent(data);
    } catch (e) { console.warn('Content fallback', e.message); }
  };
  const pathSet = (obj, path) => path.split('.').reduce((o,k)=>o && o[k], obj);
  const applyContent = (data) => {
    document.querySelectorAll('[data-cms]').forEach(el => { const v = pathSet(data.site || {}, el.dataset.cms); if (v) el.innerHTML = v; });
    const services = data.collections?.services || [];
    const grid = document.querySelector('[data-services-grid]');
    if (grid) grid.innerHTML = services.map(item => card(item)).join('');
    const learning = data.collections?.learning || [];
    const lg = document.querySelector('[data-learning-grid]');
    if (lg) lg.innerHTML = learning.map((item,i)=>`<article class="learn-card glass"><span class="num">${String(i+1).padStart(2,'0')}</span><h3>${item.title}</h3><p>${item.body}</p></article>`).join('');
    const pageId = document.body.dataset.page;
    const page = data.pages?.[pageId];
    if (page) {
      const t = document.querySelector('[data-page-title]'); if (t) t.textContent = page.title || t.textContent;
      const l = document.querySelector('[data-page-lead]'); if (l) l.textContent = page.lead || l.textContent;
      const st = document.querySelector('[data-page-secondary-title]'); if (st) st.textContent = page.secondaryTitle || st.textContent;
      const sl = document.querySelector('[data-page-secondary-lead]'); if (sl) sl.textContent = page.secondaryLead || sl.textContent;
      const pc = document.querySelector('[data-page-cards]'); if (pc) pc.innerHTML = (page.cards || []).map(card).join('');
    }
    setIcons(); setLang(lang());
  };
  const card = (item) => `<article class="service-card glass"><div class="icon" data-icon="${item.icon || 'line-chart'}"></div><h3>${item.title || ''}</h3><p>${item.body || ''}</p><b>${item.cta || 'اكتشف الخدمة'} →</b></article>`;
  const tradingView = () => {
    const el = document.querySelector('[data-tradingview-ticker]'); if (!el) return;
    el.innerHTML = '<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div></div>';
    const s = document.createElement('script'); s.src='https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'; s.async=true; s.textContent=JSON.stringify({symbols:[{proName:'OANDA:XAUUSD',title:'Gold'},{proName:'FX:EURUSD',title:'EUR/USD'},{proName:'FX:GBPUSD',title:'GBP/USD'},{proName:'TVC:DXY',title:'DXY'},{proName:'BITSTAMP:BTCUSD',title:'Bitcoin'},{proName:'NASDAQ:NDX',title:'Nasdaq 100'}],showSymbolLogo:true,isTransparent:true,displayMode:'adaptive',colorTheme:'dark',locale:lang()}); el.appendChild(s);
  };
  const tradays = () => {
    const frame = document.querySelector('[data-tradays-widget]'); if (!frame) return;
    frame.innerHTML='<div id="economicCalendarWidget"></div><div class="ecw-copyright"><a href="https://www.mql5.com/?utm_source=calendar.widget&utm_medium=link&utm_term=economic.calendar&utm_content=visit.mql5.calendar&utm_campaign=202.calendar.widget" rel="noopener nofollow" target="_blank">MQL5 Algo Trading Community</a></div>';
    const s=document.createElement('script');s.async=true;s.type='text/javascript';s.dataset.type='calendar-widget';s.src='https://www.tradays.com/c/js/widgets/calendar/widget.js?v=15';s.textContent=JSON.stringify({width:'100%',height:'100%',mode:'2',fw:'html',lang:lang(),theme:1});frame.appendChild(s);
  };
  document.addEventListener('DOMContentLoaded',()=>{setLang(lang());document.querySelectorAll('[data-lang-toggle]').forEach(btn=>btn.onclick=()=>{setLang(lang()==='ar'?'en':'ar');tradingView();tradays();});loadContent();tradingView();tradays();setIcons();});
  return { api, setLang, loadContent };
})();

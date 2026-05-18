(function(){
const serviceImages=['nrfx-service-tradingview.png','nrfx-service-mt5.png','nrfx-service-community.png','nrfx-service-risk.png','nrfx-service-analysis.png','nrfx-service-academy.png'];
const fallback={collections:{services:[
{title:'مؤشرات TradingView',body:'مؤشرات احترافية وتنبيهات ذكية تساعدك تقرأ السوق بوضوح وتحوّل الفكرة إلى خطة.',icon:'line-chart',image:'nrfx-service-tradingview.png',cta:'استكشف المؤشرات'},
{title:'أتمتة MT4 / MT5',body:'روبوتات تداول وخبراء مستشارين لأتمتة الاستراتيجيات وتنفيذ الصفقات بكفاءة.',icon:'bot',image:'nrfx-service-mt5.png',cta:'اكتشف حلول الأتمتة'},
{title:'مجتمع المتداولين',body:'مجتمع نشط لمشاركة الخبرات، مناقشة الفرص، والتعلم من محترفين.',icon:'users',image:'nrfx-service-community.png',cta:'انضم للمجتمع'},
{title:'إدارة المخاطر',body:'أدوات لحساب المخاطر، حجم الصفقات، ونسبة العائد إلى المخاطرة.',icon:'shield-check',image:'nrfx-service-risk.png',cta:'احسب مخاطرك'},
{title:'تحليلات الأسواق',body:'تحليلات يومية شاملة ونظرة فنية وأساسية وتحديثات لأهم الأسواق.',icon:'bar-chart',image:'nrfx-service-analysis.png',cta:'عرض التحليلات'},
{title:'أكاديمية No Risk FX',body:'دروس تعليمية احترافية ودورات متدرجة من المبتدئ إلى المتقدم.',icon:'graduation-cap',image:'nrfx-service-academy.png',cta:'ابدأ التعلم الآن'}],learning:[{title:'الأساسيات',body:'تعرف على الأسواق وأدوات التداول والمصطلحات الأساسية.'},{title:'التحليل الفني',body:'تعلم قراءة الشارت، الاتجاهات، الدعوم والمقاومات.'},{title:'إدارة المخاطر',body:'إدارة رأس المال، حجم الصفقة، ونسبة المخاطرة.'},{title:'التطبيق العملي',body:'تطبيق الاستراتيجيات في بيئة واقعية وتطوير خطة تداول.'}]}};
function esc(v){return String(v||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function load(){try{const r=await fetch('/api/public/content',{cache:'no-store'});if(r.ok)return await r.json()}catch(e){}return fallback}
function iconMarkup(name,i){
  const key=String(name||'').trim().toLowerCase();
  const svg={
    'graduation-cap':'<svg viewBox="0 0 24 24"><path d="M22 10L12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/></svg>',
    'workflow':'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="6" height="6" rx="2"/><rect x="15" y="3" width="6" height="6" rx="2"/><rect x="9" y="15" width="6" height="6" rx="2"/><path d="M9 6h6M6 9v3a3 3 0 0 0 3 3M18 9v3a3 3 0 0 1-3 3"/></svg>',
    'line-chart':'<svg viewBox="0 0 24 24"><path d="M3 19h18"/><path d="M5 16l4-5 4 3 6-8"/><path d="M17 6h2v2"/></svg>',
    'users':'<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'shield-check':'<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12l2 2 4-5"/></svg>',
    'bar-chart':'<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="5"/><rect x="12" y="8" width="3" height="9"/><rect x="17" y="5" width="3" height="12"/></svg>',
    'chart':'<svg viewBox="0 0 24 24"><path d="M3 19h18"/><path d="M6 16l4-4 3 3 5-7"/></svg>',
    'bot':'<svg viewBox="0 0 24 24"><rect x="5" y="7" width="14" height="11" rx="3"/><path d="M12 7V3"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M9 16h6"/></svg>',
    'shield':'<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>'
  };
  const emoji=['📈','🤖','👥','🛡','🔎','🎓'][i%6];
  if(svg[key]) return svg[key];
  if(/^\p{Extended_Pictographic}/u.test(String(name||''))) return esc(name);
  return '<span>'+emoji+'</span>';
}
function renderServices(items){document.querySelectorAll('[data-services-grid]').forEach(grid=>{grid.innerHTML=(items||fallback.collections.services).map((s,i)=>{const img=s.image||serviceImages[i%serviceImages.length];return `<article class="card service-card"><div><figure class="service-media"><img src="${esc(img)}" alt="${esc(s.title)} visual" loading="lazy" onerror="this.parentElement.classList.add('missing')"></figure><div class="service-title-row"><div class="mini-icon">${iconMarkup(s.icon,i)}</div><h3>${esc(s.title)}</h3></div><p>${esc(s.body)}</p></div><a class="service-link" href="client-portal.html">${esc(s.cta||'اكتشف الخدمة')} →</a></article>`}).join('')})}
function renderLearning(items){document.querySelectorAll('[data-learning-grid]').forEach(grid=>{grid.innerHTML=(items||fallback.collections.learning).map((s,i)=>`<article class="card"><span class="pill">0${i+1}</span><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></article>`).join('')})}

function addTvWidget(target,src,config){
  const el=document.querySelector(target); if(!el) return;
  el.innerHTML='<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div></div>';
  const holder=el.querySelector('.tradingview-widget-container');
  const sc=document.createElement('script'); sc.type='text/javascript'; sc.async=true; sc.src=src; sc.text=JSON.stringify(config);
  holder.appendChild(sc);
}
function initTradingViewLive(){
  addTvWidget('[data-tv-ticker]','https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js',{
    symbols:[{proName:'OANDA:XAUUSD',description:'Gold'},{proName:'FX:EURUSD',description:'EUR/USD'},{proName:'BITSTAMP:BTCUSD',description:'Bitcoin'},{proName:'NASDAQ:NDX',description:'US100'}],
    showSymbolLogo:true,colorTheme:'dark',isTransparent:true,displayMode:'adaptive',locale:'en'
  });
  addTvWidget('[data-tv-overview]','https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js',{
    symbols:[["OANDA:XAUUSD|1D"],["FX:EURUSD|1D"],["BITSTAMP:BTCUSD|1D"],["NASDAQ:NDX|1D"]],
    chartOnly:false,width:'100%',height:'100%',locale:'en',colorTheme:'dark',autosize:true,showVolume:false,showMA:false,hideDateRanges:false,hideMarketStatus:false,hideSymbolLogo:false,scalePosition:'right',scaleMode:'Normal',fontFamily:'Inter, sans-serif',fontSize:'12',noTimeScale:false,valuesTracking:'1',changeMode:'price-and-percent',chartType:'candlesticks',lineType:0,dateRanges:['1d|1','1m|30','3m|60','12m|1D','60m|1W','all|1M']
  });
}
initTradingViewLive();
setTimeout(()=>{if(document.querySelector('[data-tv-overview]')&&!document.querySelector('[data-tv-overview] iframe'))document.body.classList.add('tv-fallback')},6500);

load().then(content=>{renderServices(content.collections&&content.collections.services);renderLearning(content.collections&&content.collections.learning);if(content.site&&content.site.home&&content.site.home.hero){document.querySelector('[data-cms="home.hero.title"]')&&(document.querySelector('[data-cms="home.hero.title"]').innerHTML=esc(content.site.home.hero.title).replace(/تشبه غرف التداول/g,'<span>تشبه غرف التداول</span>'));document.querySelector('[data-cms="home.hero.lead"]')&&(document.querySelector('[data-cms="home.hero.lead"]').textContent=content.site.home.hero.lead||'')}})
})();

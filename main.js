(function(){
  const C = window.SITE_CONFIG, T = window.I18N;
  function apply(lang){
    const d = T[lang], brand = lang==='ar' ? C.brandNameAr : C.brandName;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang==='ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      el.textContent = (d[el.dataset.i18n]||'').replace(/\{brand\}/g,brand).replace('{year}',new Date().getFullYear());
    });
    document.querySelectorAll('[data-brand]').forEach(el=>el.textContent=brand);
    document.querySelectorAll('[data-logo]').forEach(el=>el.textContent=C.brandName);
    document.querySelectorAll('[data-wa]').forEach(a=>{a.href='#';a.removeAttribute('target');});
    document.getElementById('lang').textContent = lang==='ar' ? 'English' : 'العربية';
    document.title = d.hero_title + ' | ' + brand;
    try{localStorage.setItem('lang',lang)}catch(e){}
  }
  let lang = new URLSearchParams(location.search).get('lang') || (function(){try{return localStorage.getItem('lang')}catch(e){}})() || 'en';
  function waUrl(){
    const n = C.whatsappNumber.map(p=>p.split('').reverse().join('')).join('');
    const msg = lang==='ar' ? C.whatsappMessageAr : C.whatsappMessageEn;
    return 'https://' + 'wa.me/' + n + '?text=' + encodeURIComponent(msg);
  }
  document.addEventListener('click', e=>{
    const a = e.target.closest('[data-wa]'); if(!a) return;
    e.preventDefault(); window.open(waUrl(), '_blank', 'noopener');
  });
  apply(lang);
  document.getElementById('lang').onclick=()=>{lang = lang==='ar'?'en':'ar'; apply(lang);};
})();

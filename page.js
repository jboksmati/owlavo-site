/* Shared script for sub-pages (terms.html, privacy.html, signup.html).
   Handles the EN/AR toggle (same localStorage key as the main site),
   data-i18n text, placeholders, config placeholders and the DRAFT banner. */
(function(){
  const C = window.SITE_CONFIG, T = window.I18N;
  const fill = (s,brand)=>(s||'').replace(/\{brand\}/g,brand).replace('{year}',new Date().getFullYear());
  function apply(lang){
    const d = T[lang], brand = lang==='ar' ? C.brandNameAr : C.brandName;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang==='ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el=>{ if(d[el.dataset.i18n]!=null) el.textContent = fill(d[el.dataset.i18n],brand); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el=>{ el.placeholder = fill(d[el.dataset.i18nPh],brand); });
    document.querySelectorAll('[data-brand]').forEach(el=>el.textContent=brand);
    document.querySelectorAll('[data-logo]').forEach(el=>el.textContent=C.brandName);
    document.querySelectorAll('[data-cfg-email]').forEach(el=>{ el.textContent=C.signupEmail; if(el.tagName==='A') el.href='mailto:'+C.signupEmail; });
    document.querySelectorAll('[data-cfg-updated]').forEach(el=>el.textContent=C.legalLastUpdated||'');
    const b=document.getElementById('lang'); if(b) b.textContent = lang==='ar' ? 'English' : 'العربية';
    const tk=document.body.dataset.title; if(tk && d[tk]) document.title = fill(d[tk],brand) + ' | ' + C.brandName;
    try{localStorage.setItem('lang',lang)}catch(e){}
    window.PAGE_LANG = lang;
    document.dispatchEvent(new CustomEvent('langchange',{detail:lang}));
  }
  let lang = new URLSearchParams(location.search).get('lang') || (function(){try{return localStorage.getItem('lang')}catch(e){}})() || 'en';
  if(lang!=='ar') lang='en';
  // DRAFT banner: controlled by SITE_CONFIG.showDraftBanner (single flag) on pages with <body data-draft>
  if(C.showDraftBanner && document.body.hasAttribute('data-draft')){
    const bn=document.createElement('div'); bn.className='draft-banner'; bn.setAttribute('role','note');
    bn.setAttribute('data-i18n','draft_banner'); document.body.prepend(bn);
  }
  window.applyLang = apply;
  apply(lang);
  const btn=document.getElementById('lang'); if(btn) btn.onclick=()=>{lang = lang==='ar'?'en':'ar'; apply(lang);};
})();

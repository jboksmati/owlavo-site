/* Onboarding form: repeatable rows, validation, submit to SITE_CONFIG.signupEndpoint
   or (when empty) fall back to a mailto: with the form as readable text. */
(function(){
  const C = window.SITE_CONFIG, T = window.I18N;
  const form = document.getElementById('signup');
  const $ = (s,r=document)=>r.querySelector(s), $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  const t = k => (T[window.PAGE_LANG||'en'][k]||k);
  const relang = () => window.applyLang(window.PAGE_LANG||'en');

  /* ---------- repeatable rows ---------- */
  const lists = {branch:'#branches', service:'#services', faq:'#faqs'};
  const minRows = {branch:1, service:1, faq:0};
  function renumber(type){
    const items = $$(lists[type]+' > .rep-item');
    items.forEach((it,i)=>{ $('.num',it).textContent = '#'+(i+1); $('.rm',it).hidden = items.length<=minRows[type]; });
  }
  function addRow(type, focus){
    const node = $('#tpl-'+type).content.firstElementChild.cloneNode(true);
    $(lists[type]).appendChild(node); relang(); renumber(type);
    if(focus) $('input,textarea',node).focus();
  }
  document.addEventListener('click', e=>{
    const add = e.target.closest('[data-add]'); if(add){ addRow(add.dataset.add, true); return; }
    const rm = e.target.closest('.rm'); if(rm){ const it = rm.closest('.rep-item'), type = it.dataset.item; it.remove(); renumber(type); }
  });
  addRow('branch'); addRow('service'); addRow('service');

  /* ---------- opening hours ---------- */
  const days = ['mon','tue','wed','thu','fri','sat','sun'];
  const dayEn = {mon:'Monday',tue:'Tuesday',wed:'Wednesday',thu:'Thursday',fri:'Friday',sat:'Saturday',sun:'Sunday'};
  const hours = $('#hours');
  days.forEach(d=>{
    const r = document.createElement('div'); r.className = 'hrow'; r.dataset.day = d;
    r.innerHTML = `<span class="day" data-i18n="d_${d}"></span>
      <label class="choice closedt"><input type="checkbox" data-closed${d==='sun'?' checked':''}><span data-i18n="su_closed"></span></label>
      <div class="times"><span data-i18n="su_from"></span><input type="time" data-open value="09:00" aria-label="open"><span data-i18n="su_to"></span><input type="time" data-close value="18:00" aria-label="close"></div>
      <em class="err"></em>`;
    hours.appendChild(r);
    const cb = $('[data-closed]',r); const sync=()=>{ r.classList.toggle('closed',cb.checked); $$('input[type=time]',r).forEach(i=>i.disabled=cb.checked); clearErr(r); };
    cb.addEventListener('change',sync); sync();
  });
  relang();

  /* ---------- "other" toggles ---------- */
  function toggleOther(sel, input, show){ const i = $(input); i.hidden = !show; if(!show){ i.value=''; } }
  $$('input[name=business_type]').forEach(r=>r.addEventListener('change',()=>{ toggleOther(0,'[name=business_type_other]', $('input[name=business_type]:checked').value==='Other'); clearErr($('[data-group=business_type]')); }));
  $('[name=booking_system]').addEventListener('change',e=>toggleOther(0,'[name=booking_system_other]', e.target.value==='Other'));

  /* ---------- validation ---------- */
  const fieldOf = el => el.closest('.hrow') || el.closest('[data-group]') || el.closest('.field');
  function setErr(el, key){
    const f = fieldOf(el); if(!f) return; f.classList.add('invalid');
    const e = $('.err',f); if(e){ e.dataset.i18n = key; e.textContent = t(key); }
  }
  function clearErr(el){
    const f = el.classList && (el.classList.contains('field')||el.classList.contains('hrow')||el.dataset.group) ? el : fieldOf(el); if(!f) return;
    f.classList.remove('invalid'); const e = $('.err',f); if(e){ delete e.dataset.i18n; e.textContent=''; }
  }
  form.addEventListener('input', e=>clearErr(e.target));
  form.addEventListener('change', e=>clearErr(e.target));

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneOk = v => /^\+?\d{8,15}$/.test(v.replace(/[\s\-().]/g,''));
  function validate(){
    $$('.invalid',form).forEach(clearErr);
    let first = null; const bad = (el,key)=>{ setErr(el,key); if(!first) first = el; };
    // An extra repeatable row left completely empty is ignored (as long as another row of that type is filled in).
    const blank = it => $$('[data-k]',it).every(i=>!i.value.trim());
    const skip = new Set();
    Object.keys(lists).forEach(type=>{ const items=$$(lists[type]+' > .rep-item'); if(items.some(i=>!blank(i))) items.filter(blank).forEach(i=>skip.add(i)); });
    $$('[required]',form).forEach(el=>{
      if(el.type==='checkbox') return;
      if(skip.has(el.closest('.rep-item'))) return;
      if(!el.value.trim()) bad(el, el.tagName==='SELECT' ? 'e_choose' : 'e_required');
    });
    if(!$('input[name=business_type]:checked')) bad($('input[name=business_type]'),'e_choose');
    else if($('input[name=business_type]:checked').value==='Other' && !$('[name=business_type_other]').value.trim()) bad($('[name=business_type_other]'),'e_required');
    if($('[name=booking_system]').value==='Other' && !$('[name=booking_system_other]').value.trim()) bad($('[name=booking_system_other]'),'e_required');
    $$('input[type=email]',form).forEach(el=>{ if(el.value.trim() && !emailRe.test(el.value.trim())) bad(el,'e_email'); });
    $$('[data-phone]',form).forEach(el=>{ if(el.value.trim() && !phoneOk(el.value)) bad(el,'e_phone'); });
    $$('[data-minutes]',form).forEach(el=>{ if(el.value && !(+el.value>0 && +el.value<=1440)) bad(el,'e_number'); });
    $$('.hrow',form).forEach(r=>{
      if($('[data-closed]',r).checked) return;
      const o=$('[data-open]',r).value, c=$('[data-close]',r).value;
      if(!o||!c) bad($('[data-open]',r),'e_hours'); else if(c<=o) bad($('[data-close]',r),'e_time');
    });
    if(!$$('input[name=languages]:checked').length && !$('[name=languages_other]').value.trim()) bad($('input[name=languages]'),'e_lang');
    if(!$('[name=agree_terms]').checked) bad($('[name=agree_terms]'),'e_agree');
    return first;
  }

  /* ---------- collect + format ---------- */
  const v = n => ($('[name='+n+']',form).value||'').trim();
  function collect(){
    const rows = type => $$(lists[type]+' > .rep-item').map(it=>Object.fromEntries($$('[data-k]',it).map(i=>[i.dataset.k,i.value.trim()])));
    const bt = ($('input[name=business_type]:checked')||{}).value||'';
    const bs = v('booking_system');
    return {
      business_name:v('business_name'),
      business_type: bt==='Other' ? 'Other: '+v('business_type_other') : bt,
      contact_name:v('contact_name'), email:v('email'), whatsapp:v('whatsapp'), website:v('website'),
      branches: rows('branch').filter(b=>b.name),
      services: rows('service').filter(s=>s.name),
      opening_hours: Object.fromEntries($$('.hrow',form).map(r=>[dayEn[r.dataset.day], $('[data-closed]',r).checked ? 'Closed' : $('[data-open]',r).value+'–'+$('[data-close]',r).value])),
      closed_days: v('closed_days'),
      faqs: Object.assign(
        Object.fromEntries([['Location','faq_location'],['Parking','faq_parking'],['Insurance','faq_insurance'],['Payment methods','faq_payment'],['Cancellation policy','faq_cancellation']].map(([k,n])=>[k,v(n)]).filter(x=>x[1])),
        Object.fromEntries(rows('faq').filter(f=>f.q||f.a).map(f=>[f.q||'(question)', f.a]))),
      booking_system: bs==='Other' ? 'Other: '+v('booking_system_other') : bs,
      handoff:{name:v('handoff_name'), whatsapp:v('handoff_whatsapp'), email:v('handoff_email'), availability:v('handoff_hours')},
      languages: $$('input[name=languages]:checked').map(i=>i.value).concat(v('languages_other')?[v('languages_other')]:[]),
      notes: v('notes'),
      agreed_to_terms: $('[name=agree_terms]').checked,
      terms_version: C.legalLastUpdated||'',
      form_language: window.PAGE_LANG||'en',
      submitted_at: new Date().toISOString()
    };
  }
  function toText(d){
    const L=[], dash = s=>s||'-';
    L.push('NEW OWLAVO ONBOARDING FORM','');
    L.push('== BUSINESS ==','Business name: '+d.business_name,'Type: '+d.business_type,'Contact: '+d.contact_name,'Email: '+d.email,'WhatsApp: '+d.whatsapp,'Website/Instagram: '+dash(d.website),'');
    L.push('== BRANCHES / SERVICE AREAS ==');
    d.branches.forEach((b,i)=>L.push(`${i+1}. ${b.name}`+(b.address?` | ${b.address}`:'')+(b.notes?` | ${b.notes}`:'')));
    L.push('','== SERVICES ==');
    d.services.forEach((s,i)=>L.push(`${i+1}. ${s.name} | Price: ${s.price?s.price+' AED':'-'} | Duration: ${s.duration?s.duration+' min':'-'}`+(s.notes?` | ${s.notes}`:'')));
    L.push('','== OPENING HOURS ==');
    Object.entries(d.opening_hours).forEach(([k,x])=>L.push(k+': '+x));
    L.push('Other closed days / holidays: '+dash(d.closed_days),'');
    L.push('== FAQS ==');
    const fq=Object.entries(d.faqs); if(!fq.length) L.push('-'); fq.forEach(([q,a])=>L.push(q+': '+dash(a)));
    L.push('','== BOOKINGS & HANDOFF ==','Current booking system: '+d.booking_system,
      'Handoff contact: '+d.handoff.name,'Handoff WhatsApp: '+d.handoff.whatsapp,'Handoff email: '+dash(d.handoff.email),'Handoff availability: '+dash(d.handoff.availability),'');
    L.push('== LANGUAGES ==',d.languages.join(', '),'','== NOTES ==',dash(d.notes),'');
    L.push('Agreed to Client Service Terms: '+(d.agreed_to_terms?'YES':'NO')+(d.terms_version?' (version '+d.terms_version+')':''));
    L.push('Form language: '+d.form_language,'Submitted: '+d.submitted_at);
    return L.join('\r\n');
  }

  /* ---------- status UI ---------- */
  const status = $('#status');
  function show(kind, key, extra){
    status.className = 'status '+kind; status.innerHTML = '';
    const p = document.createElement('p'); p.style.margin=0;
    const s = document.createElement('span'); s.dataset.i18n = key; s.textContent = t(key); p.appendChild(s);
    if(extra && extra.email){ p.append(' '); const a=document.createElement('a'); a.href='mailto:'+extra.email; a.textContent=extra.email; a.dir='ltr'; p.appendChild(a); p.append('.'); }
    status.appendChild(p);
    if(extra && extra.text){
      const ta=document.createElement('textarea'); ta.readOnly=true; ta.value=extra.text; status.appendChild(ta);
      const b=document.createElement('button'); b.type='button'; b.className='btn ghost'; b.dataset.i18n='ok_copy'; b.textContent=t('ok_copy');
      b.onclick=()=>{ ta.select(); (navigator.clipboard?navigator.clipboard.writeText(ta.value):Promise.reject()).catch(()=>document.execCommand('copy')).finally(()=>{b.dataset.i18n='ok_copied'; b.textContent=t('ok_copied');}); };
      status.appendChild(b);
    }
    status.scrollIntoView({behavior:'smooth', block:'center'});
  }

  /* ---------- submit ---------- */
  const btn = $('#submitBtn');
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const first = validate();
    if(first){ show('bad','e_summary'); first.focus({preventScroll:true}); fieldOf(first).scrollIntoView({behavior:'smooth',block:'center'}); return; }
    const data = collect(), text = toText(data), to = C.signupEmail;
    const subject = 'Owlavo onboarding: '+data.business_name;
    if(!C.signupEndpoint){
      show('ok','ok_mail',{email:to, text}); showPay();
      location.href = 'mailto:'+to+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(text);
      return;
    }
    btn.disabled = true; btn.dataset.i18n='su_sending'; btn.textContent = t('su_sending');
    try{
      const r = await fetch(C.signupEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({subject, ...data, text})});
      if(!r.ok) throw new Error('HTTP '+r.status);
      form.querySelectorAll('fieldset,.field[data-group=agree],.submit-bar').forEach(x=>x.hidden=true);
      show('ok','ok_sent'); showPay();
    }catch(err){
      show('bad','bad_sent',{email:to, text});
    }finally{
      btn.disabled = false; btn.dataset.i18n='su_submit'; btn.textContent = t('su_submit');
    }
  });
  /* ---------- Pay and start (SITE_CONFIG.paymentLink) ---------- */
  const payBox = $('#pay');
  if(payBox){ if(C.paymentLink){ $$('[data-pay]').forEach(a=>a.href=C.paymentLink); } else payBox.hidden = true; }
  function showPay(){ if(!payBox || !C.paymentLink) return; const p=document.createElement('p'); p.style.margin='10px 0 0';
    const s=document.createElement('span'); s.dataset.i18n='ok_pay'; s.textContent=t('ok_pay'); p.appendChild(s); status.appendChild(p); }

  // expose for testing
  window.__signup = {collect, toText, validate};
})();

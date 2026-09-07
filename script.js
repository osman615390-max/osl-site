
// OSL V13 — robust progressive enhancement
try{ document.documentElement.classList.remove('no-js'); document.documentElement.classList.add('js'); }catch{}
const oslStorage={
  get(type,key){ try{return window[type].getItem(key)}catch{return null} },
  set(type,key,value){ try{window[type].setItem(key,value)}catch{} }
};

(() => {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const progress = document.querySelector('.scroll-progress');
  function onScroll(){ if(nav) nav.classList.toggle('scrolled', scrollY > 24); if(progress){ const h = document.documentElement.scrollHeight - innerHeight; progress.style.width = (h ? (scrollY/h)*100 : 0) + '%'; } }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  toggle?.addEventListener('click', () => { const open=!nav.classList.contains('open'); nav.classList.toggle('open',open); document.body.classList.toggle('menu-open',open); toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu'); if(open) setTimeout(()=>document.querySelector('.nav-links a')?.focus(),60); });
  document.addEventListener('keydown', e => { if(e.key==='Escape' && nav?.classList.contains('open')){ nav.classList.remove('open'); document.body.classList.remove('menu-open'); toggle?.setAttribute('aria-expanded','false'); toggle?.setAttribute('aria-label','Ouvrir le menu'); toggle?.focus(); } });
  const current = (location.pathname.split('/').pop() || 'index.html'); document.querySelectorAll('.nav-links a').forEach(a => { if(a.getAttribute('href') === current){ a.classList.add('active'); a.setAttribute('aria-current','page'); } a.addEventListener('click', () => { nav?.classList.remove('open'); document.body.classList.remove('menu-open'); toggle?.setAttribute('aria-expanded','false'); toggle?.setAttribute('aria-label','Ouvrir le menu'); }); });
  const loader = document.querySelector('.site-loader'); if(loader){ const seen = oslStorage.get('sessionStorage','oslV13Seen'); const hide = () => loader.classList.add('hide'); addEventListener('load', () => setTimeout(hide, seen ? 120 : 780), {once:true}); setTimeout(hide, 2400); oslStorage.set('sessionStorage','oslV13Seen','1'); }
  const ro = new IntersectionObserver(entries => { entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('show'); ro.unobserve(entry.target); } }); }, {threshold:.12}); document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
  if(matchMedia('(pointer:fine)').matches){ const glow = document.querySelector('.cursor-glow'); addEventListener('pointermove', e => { if(glow){ glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; glow.style.opacity = '1'; } }, {passive:true}); document.querySelectorAll('.magnet').forEach(el => { el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); const x = e.clientX - r.left - r.width/2; const y = e.clientY - r.top - r.height/2; el.style.transform = `translate(${x*.06}px, ${y*.09}px)`; }); el.addEventListener('pointerleave', () => el.style.transform = ''); }); document.querySelectorAll('.tilt').forEach(el => { el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5; const y = (e.clientY - r.top) / r.height - .5; el.style.setProperty('--mx', ((x+.5)*100)+'%'); el.style.setProperty('--my', ((y+.5)*100)+'%'); el.style.transform = `perspective(1000px) rotateX(${-y*4}deg) rotateY(${x*4}deg) translateY(-4px)`; }); el.addEventListener('pointerleave', () => el.style.transform = ''); }); }
  const vehicleStage = document.getElementById('vehicleStage'); if(vehicleStage){ const vo = new IntersectionObserver(entries => { entries.forEach(entry => { if(entry.isIntersecting) vehicleStage.classList.add('visible'); }); }, {threshold:.16, rootMargin:'0px 0px -8% 0px'}); vo.observe(vehicleStage); setTimeout(() => { if(vehicleStage.getBoundingClientRect().top < innerHeight*1.25) vehicleStage.classList.add('visible'); }, 900); }
  const mo = new IntersectionObserver(entries => { entries.forEach(entry => { if(!entry.isIntersecting || entry.target.dataset.done) return; entry.target.dataset.done = '1'; const target = Number(entry.target.dataset.count); const pad = entry.target.textContent.trim().startsWith('0'); const start = performance.now(); const tick = now => { const p = Math.min(1, (now-start)/800); const eased = 1 - Math.pow(1-p,3); const v = Math.round(target * eased); entry.target.textContent = pad ? String(v).padStart(2,'0') : String(v); if(p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }); }, {threshold:.7}); document.querySelectorAll('[data-count]').forEach(el => mo.observe(el));
  document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => { document.querySelectorAll('.filter').forEach(b => { const active=b===btn; b.classList.toggle('active',active); b.setAttribute('aria-pressed', active ? 'true' : 'false'); }); const f = btn.dataset.filter; document.querySelectorAll('.portfolio-card').forEach(card => card.classList.toggle('hidden', f !== 'all' && card.dataset.category !== f)); }));
  const baRange = document.querySelector('.ba-range'); const baWrap = document.querySelector('.ba-wrap'); baRange?.addEventListener('input', () => baWrap?.style.setProperty('--ba', baRange.value + '%'));
  document.querySelectorAll('.faq-section').forEach(section => { section.querySelectorAll('details').forEach(det => det.addEventListener('toggle', () => { if(!det.open) return; section.querySelectorAll('details').forEach(other => { if(other!==det) other.open = false; }); })); });
  const form = document.getElementById('quoteForm');
  if(form){
    const steps = [...form.querySelectorAll('.wizard-step')];
    const prev = document.getElementById('prevStep');
    const next = document.getElementById('nextStep');
    const send = document.getElementById('sendQuote');
    const label = document.getElementById('stepLabel');
    const title = document.getElementById('stepTitle');
    const bar = document.getElementById('stepBar');
    const status = document.getElementById('formStatus');
    const filesInfo = document.getElementById('filesInfo');
    const summaryBox = document.getElementById('summaryBox');
    const inputFiles = form.querySelector('input[type="file"]');
    const uploadField = inputFiles?.closest('.upload-field');
    const openedAt = Date.now();
    const MAX_FILES = 5;
    const MAX_TOTAL_BYTES = 8 * 1024 * 1024;
    const MAX_SINGLE_BYTES = 5 * 1024 * 1024;
    const ALLOWED_TYPES = new Set(['image/jpeg','image/png','image/webp','image/heic','image/heif']);
    let step = 1;
    let selectedFiles = [];
    const titles = ['Quel est votre projet ?','Précisons le besoin.','Où se trouve le chantier ?','Quel est votre délai ?','Comment vous recontacter ?'];

    const qs = new URLSearchParams(location.search);
    const serviceParam = qs.get('service');
    if(serviceParam){
      const map = {plomberie:'Plomberie',chauffage:'Chauffage',renovation:'Rénovation'};
      const value = map[serviceParam.toLowerCase()];
      if(value){
        const radio = form.querySelector(`input[name="service"][value="${value}"]`);
        if(radio) radio.checked = true;
      }
    }

    function humanSize(bytes){ return (bytes / 1024 / 1024).toFixed(bytes > 1024*1024 ? 1 : 2) + ' Mo'; }
    function validateFiles(files){
      uploadField?.classList.remove('invalid','valid');
      if(files.length > MAX_FILES) return `Maximum ${MAX_FILES} images.`;
      let total = 0;
      for(const file of files){
        if(file.size > MAX_SINGLE_BYTES) return `${file.name} dépasse 5 Mo.`;
        if(file.type && !ALLOWED_TYPES.has(file.type)) return `${file.name} n’est pas un format image accepté.`;
        total += file.size;
      }
      if(total > MAX_TOTAL_BYTES) return `Les photos dépassent 8 Mo au total (${humanSize(total)}).`;
      if(files.length) uploadField?.classList.add('valid');
      return '';
    }

    inputFiles?.addEventListener('change', () => {
      const files = [...inputFiles.files];
      const fileError = validateFiles(files);
      if(fileError){
        selectedFiles = [];
        inputFiles.value = '';
        uploadField?.classList.add('invalid');
        filesInfo.textContent = fileError;
        status.className = 'form-status error';
        status.textContent = fileError;
        return;
      }
      selectedFiles = files;
      const total = files.reduce((n,f) => n + f.size, 0);
      filesInfo.textContent = files.length ? `${files.length} image${files.length>1?'s':''} · ${humanSize(total)} · ${files.map(f => f.name).join(' · ')}` : 'Aucun fichier sélectionné.';
      status.className = 'form-status';
      status.textContent = '';
    });

    function getVal(name){
      const el = form.elements[name];
      if(!el) return '';
      if(el instanceof RadioNodeList) return el.value || '';
      return el.value || '';
    }

    function updateSummary(){
      const data = [
        ['SERVICE', getVal('service')],['BESOIN', getVal('besoin')],['BÂTIMENT', getVal('batiment')],
        ['COMMUNE', [getVal('commune'), getVal('code_postal')].filter(Boolean).join(' · ')],
        ['DÉLAI', getVal('delai')],['BUDGET', getVal('budget') || 'Non défini'],
        ['PHOTOS', selectedFiles.length ? `${selectedFiles.length} jointe${selectedFiles.length>1?'s':''}` : 'Aucune']
      ];
      summaryBox.innerHTML = data.map(([k,v]) => `<div><span>${k}</span><b>${escapeHtml(v || '—')}</b></div>`).join('');
    }

    function validateCurrent(){
      const current = steps[step-1];
      const required = [...current.querySelectorAll('[required]')];
      let valid = true;
      for(const field of required){
        if(field.type === 'radio'){
          if(!current.querySelector(`input[name="${field.name}"]:checked`)) valid = false;
        }else if(field.type === 'checkbox'){
          if(!field.checked) valid = false;
        }else{
          if(!field.value.trim()) valid = false;
          if(field.type === 'email' && field.value && !field.validity.valid) valid = false;
        }
      }
      const fileError = validateFiles(selectedFiles);
      if(fileError) valid = false;
      current.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
      let firstInvalid = null;
      if(!valid){
        for(const field of required){
          let bad=false;
          if(field.type==='radio') bad=!current.querySelector(`input[name="${field.name}"]:checked`);
          else if(field.type==='checkbox') bad=!field.checked;
          else bad=!field.value.trim() || (field.type==='email' && field.value && !field.validity.valid) || !field.checkValidity();
          if(bad){ field.setAttribute('aria-invalid','true'); firstInvalid ||= field; }
        }
      }
      status.className = valid ? 'form-status' : 'form-status error';
      status.textContent = valid ? '' : (fileError || (step===1 ? 'Choisissez le type de projet.' : step===5 ? 'Vérifiez vos coordonnées et votre accord avant l’envoi.' : 'Merci de compléter les champs obligatoires de cette étape.'));
      if(!valid && firstInvalid) requestAnimationFrame(()=>firstInvalid.focus({preventScroll:false}));
      return valid;
    }

    function updateWizard({ announce = false } = {}){
      steps.forEach(s => {
        const active = Number(s.dataset.step) === step;
        s.classList.toggle('active', active);
        s.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      label.textContent = `ÉTAPE ${String(step).padStart(2,'0')} / 05`;
      title.textContent = titles[step-1];
      bar.style.width = (step*20) + '%';
      prev.style.visibility = step === 1 ? 'hidden' : 'visible';
      next.style.display = step === 5 ? 'none' : 'inline-flex';
      send.style.display = step === 5 ? 'inline-flex' : 'none';
      if(step === 5) updateSummary(); else summaryBox.innerHTML = '';

      const targetTop = Math.max(0, form.getBoundingClientRect().top + scrollY - 100);
      window.scrollTo({top: targetTop, behavior:'smooth'});

      // Accessibility: after a user-triggered step change, move keyboard/screen-reader
      // focus to the new heading. aria-live on #stepTitle also announces the change.
      if(announce){
        requestAnimationFrame(() => {
          title.focus({preventScroll:true});
        });
      }
    }

    next.addEventListener('click', () => { if(!validateCurrent()) return; if(step < 5) step++; updateWizard({announce:true}); });
    prev.addEventListener('click', () => { if(step > 1) step--; updateWizard({announce:true}); });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if(!validateCurrent()) return;
      // Basic client-side bot/rate protection in addition to provider anti-spam.
      if(getVal('_honey')) return;
      if(Date.now() - openedAt < 2500){
        status.className = 'form-status error';
        status.textContent = 'Merci de vérifier votre demande avant l’envoi.';
        return;
      }
      const lastSend = Number(oslStorage.get('localStorage','oslLastQuoteSend') || 0);
      if(lastSend && Date.now() - lastSend < 60000){
        status.className = 'form-status error';
        status.textContent = 'Une demande vient déjà d’être envoyée depuis cet appareil. Merci d’attendre une minute avant un nouvel envoi.';
        return;
      }

      status.className = 'form-status';
      status.textContent = 'Envoi sécurisé en cours…';
      send.disabled = true; next.disabled = true; prev.disabled = true;

      const fd = new FormData(form);
      // Rebuild attachments under distinct field names and stay below the documented service limit.
      fd.delete('attachment');
      selectedFiles.forEach((file, i) => fd.append(`photo_${i+1}`, file, file.name));
      // Keep FormSubmit's default anti-spam/reCAPTCHA active: do NOT set _captcha=false.
      fd.append('_subject', `Demande de devis OSL — ${getVal('service')} — ${getVal('commune')}`);
      fd.append('_template', 'table');
      fd.append('_url', location.href);
      fd.append('_blacklist', 'bitcoin,casino,backlink,guest post,viagra,crypto investment,seo services,web design offer,loan offer');

      const endpoint = 'https://formsubmit.co/ajax/osl.plomberie.chauffage@gmail.com';
      let delivered = false;
      let lastError = null;
      // One controlled retry covers short network hiccups without duplicate-looping.
      for(let attempt=0; attempt<2 && !delivered; attempt++){
        try{
          if(attempt) await new Promise(r => setTimeout(r, 1200));
          const res = await fetch(endpoint, {method:'POST', body:fd, headers:{'Accept':'application/json'}});
          const data = await res.json().catch(() => ({}));
          const looksSuccessful = res.ok && (data.success === true || data.success === 'true' || /success|submitted|sent/i.test(String(data.message || '')));
          if(!looksSuccessful) throw new Error(data.message || `HTTP ${res.status}`);
          delivered = true;
        }catch(err){ lastError = err; }
      }

      if(delivered){
        oslStorage.set('localStorage','oslLastQuoteSend', String(Date.now()));
        status.className = 'form-status success';
        status.innerHTML = '✅ <strong>Demande transmise.</strong> Vous restez sur le site. OSL recevra les informations à l’adresse professionnelle après activation initiale du formulaire si elle n’a pas encore été faite.';
        send.textContent = 'Demande transmise ✓';
      }else{
        status.className = 'form-status error';
        status.innerHTML = `❌ La transmission automatique est momentanément indisponible. Votre page et vos informations restent affichées, vous ne perdez rien.<div class="fallback-contact"><a href="tel:0766123004">Appeler le 07 66 12 30 04</a><button type="button" data-copy-email>Copier l’e-mail OSL</button></div>`;
        status.querySelector('[data-copy-email]')?.addEventListener('click', async (ev) => {
          try{ await navigator.clipboard.writeText('osl.plomberie.chauffage@gmail.com'); ev.currentTarget.textContent = 'E-mail copié ✓'; }
          catch{ ev.currentTarget.textContent = 'osl.plomberie.chauffage@gmail.com'; }
        });
        console.warn('OSL form delivery failed:', lastError);
      }
      send.disabled = false; next.disabled = false; prev.disabled = false;
    });

    updateWizard();
  }
  function escapeHtml(str){ return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
})();

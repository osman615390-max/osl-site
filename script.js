
(() => {
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.menu');
  const progress = document.querySelector('.scroll-progress');

  const onScroll = () => {
    nav?.classList.toggle('scrolled', scrollY > 24);
    if (progress) {
      const h = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = (h ? (scrollY / h) * 100 : 0) + '%';
    }
  };
  addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  menu?.addEventListener('click', () => {
    nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
  });
  document.querySelectorAll('.links a').forEach(a => {
    const current = location.pathname.split('/').pop() || 'index.html';
    if (a.getAttribute('href') === current) {
      a.classList.add('active');
      a.setAttribute('aria-current','page');
    }
    a.addEventListener('click', () => {
      nav?.classList.remove('open');
      menu?.setAttribute('aria-expanded','false');
    });
  });

  // Intro: full once per tab/session, very short after that.
  const loader = document.querySelector('.site-loader');
  if (loader) {
    const seen = sessionStorage.getItem('oslIntroSeen');
    const delay = seen ? 120 : 750;
    const hide = () => loader.classList.add('hide');
    addEventListener('load', () => setTimeout(hide, delay), {once:true});
    setTimeout(hide, 2200);
    sessionStorage.setItem('oslIntroSeen','1');
  }

  // Reveals
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show');
        revealObserver.unobserve(e.target);
      }
    });
  }, {threshold:.10, rootMargin:'0px 0px -5% 0px'});
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Cursor light + magnetic buttons + tilt only on fine pointers.
  if (matchMedia('(pointer:fine)').matches) {
    const glow = document.querySelector('.cursor-glow');
    addEventListener('pointermove', e => {
      if (glow) {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        glow.style.opacity = '1';
      }
    }, {passive:true});
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width/2;
        const y = e.clientY - r.top - r.height/2;
        el.style.transform = `translate(${x*.07}px,${y*.10}px)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
    document.querySelectorAll('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX/r.width - .5, y = e.clientY/r.height - .5;
        el.style.setProperty('--mx', (x+.5)*100 + '%');
        el.style.setProperty('--my', (y+.5)*100 + '%');
        el.style.transform = `perspective(1000px) rotateX(${-y*4}deg) rotateY(${x*4}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });
  }

  // Metric count
  const metricObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target.dataset.done) return;
      entry.target.dataset.done = '1';
      const target = Number(entry.target.dataset.count);
      if (!Number.isFinite(target)) return;
      const pad = entry.target.textContent.trim().startsWith('0');
      const start = performance.now(), duration = 800;
      const tick = now => {
        const p = Math.min(1,(now-start)/duration);
        const v = Math.round(target * (1-Math.pow(1-p,3)));
        entry.target.textContent = pad ? String(v).padStart(2,'0') : String(v);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, {threshold:.65});
  document.querySelectorAll('[data-count]').forEach(el => metricObserver.observe(el));

  // Interactive story chapters
  const storyVisual = document.querySelector('.story-visual');
  const storyTitle = document.querySelector('.story-title');
  const storyCounter = document.querySelector('.story-counter');
  const chapters = [...document.querySelectorAll('.story-chapter')];
  if (storyVisual && chapters.length) {
    const activate = ch => {
      const scene = ch.dataset.scene || 'water';
      storyVisual.dataset.scene = scene;
      chapters.forEach(x => x.classList.toggle('active', x === ch));
      if (storyTitle) storyTitle.innerHTML = (ch.dataset.title || '').replace('|','<br>');
      if (storyCounter) storyCounter.textContent = ch.dataset.index || '';
    };
    const storyObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio)[0];
      if (visible) activate(visible.target);
    }, {threshold:[.25,.45,.65], rootMargin:'-18% 0px -26% 0px'});
    chapters.forEach(c => storyObserver.observe(c));
  }

  // Cinematic vehicle scroll progress.
  const vehicleSection = document.querySelector('.vehicle-cinema');
  if (vehicleSection && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let queued = false;
    const updateVehicle = () => {
      queued = false;
      const r = vehicleSection.getBoundingClientRect();
      const travel = Math.max(1, r.height - innerHeight);
      const p = Math.max(0, Math.min(1, -r.top / travel));
      // Drive completes slightly before the section ends for a composed final frame.
      const drive = Math.max(0, Math.min(1, p * 1.18));
      vehicleSection.style.setProperty('--drive', drive.toFixed(4));
    };
    addEventListener('scroll', () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(updateVehicle);
      }
    }, {passive:true});
    updateVehicle();
  }

  // Portfolio category filtering
  const filters = document.querySelectorAll('.filter');
  const projects = document.querySelectorAll('.project-card');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.toggle('active', b === btn));
    const f = btn.dataset.filter;
    projects.forEach(card => card.classList.toggle('hidden', f !== 'all' && card.dataset.category !== f));
  }));

  // Before / after
  const baRange = document.querySelector('.ba-range');
  const baWrap = document.querySelector('.ba-wrap');
  baRange?.addEventListener('input', () => baWrap?.style.setProperty('--ba', baRange.value + '%'));

  // FAQ: keep one open at a time per section for a cleaner mobile experience.
  document.querySelectorAll('.faq-section').forEach(section => {
    section.querySelectorAll('details').forEach(d => d.addEventListener('toggle', () => {
      if (!d.open) return;
      section.querySelectorAll('details').forEach(other => { if (other !== d) other.open = false; });
    }));
  });

  // ---------------- Project wizard ----------------
  const form = document.querySelector('#projectWizard');
  if (form) {
    const steps = [...form.querySelectorAll('.wizard-step')];
    const back = document.querySelector('#wizardBack');
    const next = document.querySelector('#wizardNext');
    const submit = document.querySelector('#wizardSubmit');
    const label = document.querySelector('#wizardStepLabel');
    const title = document.querySelector('#wizardStepTitle');
    const bar = document.querySelector('#wizardProgress');
    const error = document.querySelector('#wizardError');
    const summary = document.querySelector('#wizardSummary');
    const fileInput = form.querySelector('input[type=file]');
    const fileList = document.querySelector('#fileList');
    let step = 1;
    const titles = ['Quel est votre projet ?','Précisons le besoin.','Où se trouve le chantier ?','Quel est votre délai ?','Comment vous recontacter ?'];

    // Query parameter can preselect a service.
    const qService = new URLSearchParams(location.search).get('service');
    if (qService) {
      const map = {plomberie:'Plomberie',chauffage:'Chauffage',renovation:'Rénovation'};
      const value = map[qService.toLowerCase()];
      if (value) {
        const radio = form.querySelector(`input[name="service"][value="${value}"]`);
        if (radio) radio.checked = true;
      }
    }

    const update = () => {
      steps.forEach(s => s.classList.toggle('active', Number(s.dataset.step) === step));
      label.textContent = `ÉTAPE ${String(step).padStart(2,'0')} / 05`;
      title.textContent = titles[step-1];
      bar.style.width = (step*20) + '%';
      back.style.visibility = step === 1 ? 'hidden' : 'visible';
      next.style.display = step === 5 ? 'none' : 'inline-flex';
      submit.style.display = step === 5 ? 'inline-flex' : 'none';
      error.textContent = '';
      if (step === 5) buildSummary();
      scrollTo({top: Math.max(0, form.getBoundingClientRect().top + scrollY - 110), behavior:'smooth'});
    };

    const validateCurrent = () => {
      const current = steps[step-1];
      const required = [...current.querySelectorAll('[required]')];
      let valid = true;
      required.forEach(field => {
        if (field.type === 'radio') {
          if (!current.querySelector(`input[name="${field.name}"]:checked`)) valid = false;
        } else if (field.type === 'checkbox') {
          if (!field.checked) valid = false;
        } else if (!field.value.trim()) valid = false;
        if (field.type === 'email' && field.value && !field.validity.valid) valid = false;
      });
      if (!valid) {
        error.textContent = 'Merci de compléter les champs obligatoires de cette étape.';
        const first = required.find(f => (f.type==='checkbox' && !f.checked) || (f.type!=='radio' && !f.value.trim()));
        first?.focus({preventScroll:true});
      }
      return valid;
    };

    const get = name => {
      const el = form.elements[name];
      if (!el) return '';
      if (el instanceof RadioNodeList) return el.value;
      return el.value || '';
    };

    const buildSummary = () => {
      const data = [
        ['SERVICE', get('service')],
        ['BESOIN', get('besoin')],
        ['BÂTIMENT', get('batiment')],
        ['COMMUNE', [get('commune'),get('postal')].filter(Boolean).join(' · ')],
        ['DÉLAI', get('delai')],
        ['BUDGET', get('budget') || 'Non défini'],
      ];
      summary.innerHTML = data.map(([k,v]) => `<div><span>${k}</span><b>${escapeHtml(v || '—')}</b></div>`).join('');
    };
    const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    next.addEventListener('click', () => {
      if (!validateCurrent()) return;
      if (step < 5) step++;
      update();
    });
    back.addEventListener('click', () => {
      if (step > 1) step--;
      update();
    });

    fileInput?.addEventListener('change', () => {
      const files = [...fileInput.files];
      fileList.textContent = files.length ? files.map(f => f.name).join(' · ') : 'Aucun fichier sélectionné.';
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateCurrent()) return;
      const lines = [
        'Bonjour OSL,',
        '',
        'Je souhaite vous transmettre une demande de projet :',
        '',
        `Service : ${get('service')}`,
        `Besoin : ${get('besoin')}`,
        `Bâtiment : ${get('batiment')}`,
        `Commune : ${get('commune')} ${get('postal')}`.trim(),
        get('adresse') ? `Adresse : ${get('adresse')}` : '',
        `Délai : ${get('delai')}`,
        get('budget') ? `Budget indicatif : ${get('budget')}` : '',
        '',
        'Description :',
        get('description'),
        '',
        `Nom : ${get('nom')}`,
        `Téléphone : ${get('telephone')}`,
        `E-mail : ${get('email')}`,
        `Préférence de contact : ${get('contact_pref')}`,
        '',
        'Merci.'
      ].filter(Boolean);
      const subject = encodeURIComponent(`Demande de devis OSL — ${get('service')} — ${get('commune')}`);
      const body = encodeURIComponent(lines.join('\n'));
      location.href = `mailto:osl.plomberie.chauffage@gmail.com?subject=${subject}&body=${body}`;
    });

    update();
  }
})();

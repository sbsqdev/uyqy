/* Charter Key — state, account, venues, offer sections, map, two assistants, language */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const money = n => '$' + n.toLocaleString('en-US');
  const KEY = 'charterkey.v3';

  const DEFAULT = {
    registered: false, name: '', email: '', refCode: '', invitedBy: '',
    venue: 'newport', points: 0, checkins: [], events: [], referrals: 0,
    claimed: [], courses: [], club: false, tier: '', log: []
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const s = raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
      if (!DESTINATIONS.some(d => d.id === s.venue)) s.venue = DEFAULT.venue;
      return s;
    } catch { return { ...DEFAULT }; }
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

  const dest = () => DESTINATIONS.find(d => d.id === state.venue) || DESTINATIONS[0];
  const cityOf = id => DESTINATIONS.find(d => d.id === id);
  const pointById = id => dest().points.find(p => p.id === id);
  const levelOf = pts => [...LEVELS].reverse().find(l => pts >= l.from) || LEVELS[0];
  const nextLevel = pts => LEVELS.find(l => l.from > pts) || null;
  const displayName = () => state.registered ? state.name : (Lang.get() === 'ru' ? 'Гость' : 'Guest');
  const spotsLeft = r => Math.max(0, r.spots - (state.events.includes(r.id) ? 1 : 0));

  const catStyle = cat => {
    const c = CAT_META[cat].color;
    return `--cat-color:${c};--cat-bg:${hex(c, .16)};--cat-line:${hex(c, .45)}`;
  };
  function hex(h, a) {
    const n = parseInt(h.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  }
  const catIcon = cat => CATEGORIES.find(c => c.id === cat).icon;

  /* ────────── points, log, toasts ────────── */
  function addPoints(n, logKey, vars) {
    state.points += n;
    state.log.unshift({ t: Date.now(), key: logKey, vars: vars || {}, n });
    state.log = state.log.slice(0, 40);
    save();
    renderProfile();
    const chip = $('#ptsChip');
    chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
    toast(t('toast.points', { n, label: t('logLabel.' + logKey, vars) }));
  }

  function toast(html) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = html;
    $('#toasts').append(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 3400);
  }

  /* ────────── account ────────── */
  function openAuth(reason) {
    if (state.registered) { $('#account').scrollIntoView({ behavior: 'smooth' }); return; }
    $('#authError').hidden = true;
    $('#authModal').hidden = false;
    document.body.style.overflow = 'hidden';
    if (reason) toast(reason);
    setTimeout(() => $('#authName').focus(), 60);
  }
  const closeAuth = () => { $('#authModal').hidden = true; document.body.style.overflow = ''; };

  function requireAuth(reasonKey) {
    if (state.registered) return true;
    openAuth(t('toast.' + reasonKey));
    return false;
  }

  function register(name, email, promo) {
    const err = $('#authError');
    if (name.trim().length < 2) { err.textContent = t('modal.errName'); err.hidden = false; return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) { err.textContent = t('modal.errEmail'); err.hidden = false; return; }

    state.registered = true;
    state.name = name.trim();
    state.email = email.trim();
    state.invitedBy = promo.trim().toUpperCase();
    state.refCode = makeCode(state.name);
    save();
    closeAuth();

    addPoints(BONUS.signup, 'signup');
    if (state.invitedBy) addPoints(BONUS.invitee, 'promo', { code: state.invitedBy });
    renderAll();
    $('#magnet').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function makeCode(name) {
    const map = { А:'A',Б:'B',В:'V',Г:'G',Д:'D',Е:'E',Ж:'ZH',З:'Z',И:'I',Й:'Y',К:'K',Л:'L',М:'M',Н:'N',О:'O',П:'P',Р:'R',С:'S',Т:'T',У:'U',Ф:'F',Х:'H',Ц:'C',Ч:'CH',Ш:'SH',Щ:'SCH',Ы:'Y',Э:'E',Ю:'YU',Я:'YA',Ь:'',Ъ:'' };
    const first = (name.trim().split(/\s+/)[0] || 'CREW').toUpperCase();
    const lat = [...first].map(c => map[c] ?? c).join('').replace(/[^A-Z]/g, '').slice(0, 10) || 'CREW';
    return `CK-${lat}-${1000 + Math.floor(Math.random() * 8999)}`;
  }

  /* ────────── venues ────────── */
  function renderVenues() {
    $('#venueTabs').innerHTML = DESTINATIONS.map(d => {
      const ev = REGATTAS.filter(r => r.city === d.id);
      const left = ev.reduce((a, r) => a + spotsLeft(r), 0);
      return `
        <button class="venue" role="tab" data-venue="${d.id}" aria-selected="${d.id === state.venue}" style="--accent:${d.accent}" type="button">
          <span class="venue-top"><span class="venue-flag">${d.flag}</span><b>${esc(T(d.city))}</b></span>
          <span class="venue-region">${esc(T(d.region))}</span>
          <span class="venue-line">${esc(T(d.blurb))}</span>
          <span class="venue-foot">
            <span>${esc(T(d.season))}</span>
            <span class="${left <= 3 ? 'scarce' : ''}">${t('cal.left', { n: left })}</span>
          </span>
        </button>`;
    }).join('');
  }

  function switchVenue(id) {
    if (state.venue === id) return;
    state.venue = id;
    activePoi = null; query = ''; filter = 'all';
    $('#searchInput').value = '';
    save();
    MapView.render(dest());
    renderAll();
    resetChat();
    toast(t('toast.venue', { city: esc(T(dest().city)) }));
  }

  /* ────────── berth tiers ────────── */
  function renderTiers() {
    $('#tierGrid').innerHTML = TIERS.map(x => `
      <article class="tier ${x.featured ? 'featured' : ''} ${state.tier === x.id ? 'chosen' : ''}">
        ${x.featured ? `<span class="tier-flag">${esc(Lang.get() === 'ru' ? 'Выбирают чаще всего' : 'Most crews pick this')}</span>` : ''}
        <span class="tier-tag">${esc(T(x.tag))}</span>
        <h3>${esc(T(x.name))}</h3>
        <div class="tier-price"><b>${money(x.price)}</b><span>${esc(T(x.unit))}</span></div>
        <p class="tier-line">${esc(T(x.line))}</p>
        <ul class="tier-list">${T(x.includes).map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        <div class="tier-foot">
          <button class="btn ${x.featured ? 'btn-primary' : 'btn-ghost'} btn-sm" data-tier="${x.id}" type="button">
            ${state.tier === x.id ? esc(t('berths.chosen')) : esc(t('berths.choose', { name: T(x.name) }))}
          </button>
          <span class="tier-spots ${x.spots <= 2 ? 'low' : ''}">${esc(t('berths.left', { n: x.spots }))}</span>
        </div>
      </article>`).join('');
  }

  function chooseTier(id) {
    state.tier = id;
    save();
    renderTiers();
    toast(t('toast.tierPicked', { name: esc(T(TIERS.find(x => x.id === id).name)) }));
    $('#calendar').scrollIntoView({ behavior: 'smooth' });
  }

  /* ────────── lead magnet ────────── */
  function renderMagnet() {
    $('#magnetTitle').textContent = T(LEAD_MAGNET.title);
    $('#magnetSub').textContent = T(LEAD_MAGNET.sub);
    $('#magnetList').innerHTML = T(LEAD_MAGNET.items)
      .map(i => `<li>${state.registered ? '✓ ' : ''}${esc(i)}</li>`).join('');
    $('#magnet').classList.toggle('unlocked', state.registered);
    $('#magnetBtn').textContent = state.registered ? t('magnet.open') : t('magnet.unlock');
    $('#magnetBtn').toggleAttribute('data-auth', !state.registered);
    $('#magnetNote').textContent = state.registered ? t('magnet.noteOpen') : t('magnet.noteLocked');
  }

  /* ────────── quiz ────────── */
  let quizStep = 0;
  let quizScore = { rail: 0, trim: 0, helm: 0 };

  function renderQuiz() {
    const box = $('#quizBox');

    if (quizStep >= QUIZ.length) {
      const best = Object.entries(quizScore).sort((a, b) => b[1] - a[1])[0][0];
      const x = TIERS.find(y => y.id === best);
      box.innerHTML = `
        <div class="quiz-result">
          <span class="sec-kicker">${esc(t('quiz.match'))}</span>
          <h3>${esc(T(x.name))} — ${money(x.price)} <span class="muted">${esc(T(x.unit))}</span></h3>
          <p class="quiz-why">${esc(T(x.line))}</p>
          <ul class="tier-list">${T(x.includes).slice(0, 4).map(i => `<li>${esc(i)}</li>`).join('')}</ul>
          <div class="quiz-actions">
            <button class="btn btn-primary" data-tier="${x.id}" type="button">${esc(t('quiz.take', { name: T(x.name) }))}</button>
            <button class="btn btn-ghost btn-sm" data-quiz-restart type="button">${esc(t('quiz.again'))}</button>
            <button class="btn btn-link btn-sm" data-ask-tier="${x.id}" type="button">${esc(t('quiz.why'))}</button>
          </div>
        </div>`;
      return;
    }

    const q = QUIZ[quizStep];
    box.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-progress">
          ${QUIZ.map((_, i) => `<i class="${i <= quizStep ? 'on' : ''}"></i>`).join('')}
          <span>${esc(t('quiz.step', { i: quizStep + 1, n: QUIZ.length }))}</span>
        </div>
        <h3>${esc(T(q.q))}</h3>
        <div class="quiz-options">
          ${q.options.map(o => `<button class="quiz-option" data-answer="${o.id}" type="button">${esc(T(o.label))}</button>`).join('')}
        </div>
      </div>`;
  }

  function answerQuiz(optionId) {
    const q = QUIZ[quizStep];
    const o = q.options.find(x => x.id === optionId);
    if (!o) return;
    Object.entries(o.score).forEach(([k, v]) => { quizScore[k] += v; });
    quizStep++;
    renderQuiz();
  }

  function restartQuiz() {
    quizStep = 0;
    quizScore = { rail: 0, trim: 0, helm: 0 };
    renderQuiz();
  }

  /* ────────── calendar ────────── */
  function renderEvents() {
    const order = [...REGATTAS].sort((a, b) => (a.city === state.venue ? -1 : 0) - (b.city === state.venue ? -1 : 0));
    $('#regGrid').innerHTML = order.map(r => {
      const held = state.events.includes(r.id);
      const left = spotsLeft(r);
      const city = cityOf(r.city);
      return `
        <article class="reg ${held ? 'joined' : ''} ${r.city === state.venue ? 'here' : ''}">
          <div class="reg-top">
            <span class="reg-level">${esc(T(r.level))}</span>
            <span class="reg-date">${esc(T(r.date))}</span>
          </div>
          <h3>${esc(T(r.name))}</h3>
          <button class="reg-venue" data-venue="${r.city}" type="button">${city.flag} ${esc(T(city.city))}</button>
          <p class="reg-line">${esc(T(r.line))}</p>
          <div class="reg-rows">
            <span>${esc(t('cal.fleet'))}: ${esc(T(r.fleet))}</span>
            <span class="${left <= 2 ? 'scarce' : ''}">${left === 1 ? esc(t('cal.left1')) : esc(t('cal.left', { n: left }))}</span>
          </div>
          <div class="reg-foot">
            <button class="btn ${held ? 'btn-ghost' : 'btn-soft'} btn-sm" data-event="${r.id}" ${held ? 'disabled' : ''} type="button">
              ${held ? esc(t('cal.held')) : esc(t('cal.hold', { n: r.pts }))}
            </button>
            <button class="btn btn-link btn-sm" data-scroll="#berths" type="button">${esc(t('cal.tiers'))}</button>
          </div>
        </article>`;
    }).join('');
  }

  function holdEvent(id) {
    if (!requireAuth('gateEvent')) return;
    if (state.events.includes(id)) return;
    const r = REGATTAS.find(x => x.id === id);
    state.events.push(id);
    if (r.city !== state.venue) { state.venue = r.city; MapView.render(dest()); }
    addPoints(r.pts, 'event', { name: T(r.name) });
    renderAll();
  }

  /* ────────── academy + club ────────── */
  function renderAcademy() {
    $('#courseGrid').innerHTML = COURSES.map(c => {
      const owned = state.courses.includes(c.id);
      return `
        <article class="course ${owned ? 'owned' : ''}">
          <div class="course-top">
            <span class="course-level">${esc(T(c.level))}</span>
            <span class="course-time">${esc(T(c.time))}</span>
          </div>
          <h3>${esc(T(c.title))}</h3>
          <p class="course-line">${esc(T(c.line))}</p>
          <div class="course-foot">
            ${owned
              ? `<span class="course-owned">${esc(t('academy.owned'))}</span>`
              : `<button class="btn btn-soft btn-sm" data-buy="${c.id}" type="button">${esc(t('academy.buy', { price: money(c.price) }))}</button>
                 <button class="btn btn-ghost btn-sm" data-course-points="${c.id}" type="button">${esc(t('academy.orPoints', { n: c.pts }))}</button>`}
          </div>
        </article>`;
    }).join('');

    $('#clubCard').innerHTML = `
      <span class="sec-kicker">${esc(t('academy.membership'))}</span>
      <h3>${esc(t('academy.club'))}</h3>
      <div class="tier-price"><b>${money(CLUB.price)}</b><span>${esc(T(CLUB.unit))}</span></div>
      <p class="muted">${esc(t('academy.perYear', { price: money(CLUB.annual) }))}</p>
      <ul class="tier-list">${T(CLUB.perks).map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      <button class="btn ${state.club ? 'btn-ghost' : 'btn-primary'} btn-sm" id="clubBtn" ${state.club ? 'disabled' : ''} type="button">
        ${state.club ? esc(t('academy.member')) : esc(t('academy.join'))}
      </button>`;
  }

  function buyCourse(id, withPoints) {
    if (!requireAuth('gateCourse')) return;
    const c = COURSES.find(x => x.id === id);
    if (!c || state.courses.includes(id)) return;

    if (withPoints) {
      if (state.points < c.pts) {
        toast(t('toast.short', { n: c.pts - state.points, title: esc(T(c.title)) }));
        return;
      }
      state.points -= c.pts;
      state.log.unshift({ t: Date.now(), key: 'course', vars: { title: T(c.title) }, n: -c.pts });
      state.courses.push(id);
      save(); renderAcademy(); renderProfile();
      toast(t('toast.coursePoints', { title: esc(T(c.title)) }));
      return;
    }
    state.courses.push(id);
    save(); renderAcademy(); renderProfile();
    toast(t('toast.courseBuy', { title: esc(T(c.title)) }));
  }

  function joinClub() {
    if (!requireAuth('gateClub')) return;
    if (state.club) return;
    state.club = true;
    save(); renderAcademy();
    toast(t('toast.clubJoined'));
  }

  /* ────────── town map ────────── */
  let filter = 'all', query = '', activePoi = null;

  const visiblePoints = () => dest().points.filter(p => {
    const okCat = filter === 'all' || p.cat === filter;
    const q = query.trim().toLowerCase();
    const hay = (T(p.name) + ' ' + T(p.desc) + ' ' + p.tags.join(' ') + ' ' + (p.tagsRu || []).join(' ')).toLowerCase();
    return okCat && (!q || hay.includes(q));
  });

  function renderCity() {
    const d = dest();
    $('#cityMeta').innerHTML = `
      <span>${t('map.season')}: <b>${esc(T(d.season))}</b></span>
      <span>${t('map.wind')}: <b>${esc(T(d.wind))}</b></span>
      <span>${t('map.water')}: <b>${esc(T(d.water))}</b></span>
      <span>${t('map.airport')}: <b>${esc(T(d.airport))}</b></span>
      <span>${t('map.places')}: <b>${d.points.length}</b></span>`;
    $('#mapKicker').textContent = t('map.kicker', { city: T(d.city) });
    $('#tabTownSub').textContent = t('ai.tabTownSub', { city: T(d.city) });
    $('#eyebrow').textContent = t('hero.eyebrow', {
      city: T(d.city), n: REGATTAS.reduce((a, r) => a + spotsLeft(r), 0)
    });
    $('#statEvents').textContent = REGATTAS.length;
  }

  function renderFilters() {
    $('#filters').innerHTML = CATEGORIES.map(c => `
      <button class="filter" data-cat="${c.id}" aria-pressed="${filter === c.id}">${c.icon} ${esc(T(c.label))}</button>`).join('');
  }

  function renderList() {
    const list = visiblePoints();
    const box = $('#poiList');
    if (!list.length) { box.innerHTML = `<div class="poi-empty">${esc(t('map.empty'))}</div>`; return; }
    box.innerHTML = list.map(p => `
      <button class="poi-item ${activePoi === p.id ? 'active' : ''} ${state.checkins.includes(p.id) ? 'done' : ''}"
              data-poi="${p.id}" style="${catStyle(p.cat)}">
        <span class="poi-ico">${catIcon(p.cat)}</span>
        <span>
          <span class="poi-name">${esc(T(p.name))}</span><br>
          <span class="poi-sub">${esc(T(CAT_META[p.cat].label))} · ${esc(T(p.price))}</span>
        </span>
        <span class="poi-pts">+${p.pts}</span>
      </button>`).join('');
  }

  function renderPins() {
    const vis = new Set(visiblePoints().map(p => p.id));
    $('#pins').innerHTML = dest().points.map(p => `
      <button class="pin ${vis.has(p.id) ? '' : 'dim'} ${activePoi === p.id ? 'active' : ''} ${state.checkins.includes(p.id) ? 'done' : ''}"
              data-poi="${p.id}" style="left:${p.x}%;top:${p.y}%;${catStyle(p.cat)}" title="${esc(T(p.name))}">
        <span class="pin-body">
          <span class="pin-dot">${catIcon(p.cat)}</span>
          <span class="pin-label">${esc(T(p.name))}</span>
        </span>
        <span class="pin-stem"></span>
      </button>`).join('');

    $('#mapLegend').innerHTML = Object.values(CAT_META)
      .map(v => `<span class="lg"><i style="background:${v.color}"></i>${esc(T(v.label))}</span>`).join('');
  }

  function renderDetail() {
    const box = $('#poiDetail');
    const p = activePoi ? pointById(activePoi) : null;
    if (!p) { box.hidden = true; box.innerHTML = ''; return; }
    const done = state.checkins.includes(p.id);
    const tags = (Lang.get() === 'ru' ? (p.tagsRu || p.tags) : p.tags).slice(0, 7);
    box.hidden = false;
    box.style.cssText = catStyle(p.cat);
    box.innerHTML = `
      <div class="pd-top">
        <div>
          <span class="pd-cat">${catIcon(p.cat)} ${esc(T(CAT_META[p.cat].label))}</span>
          <h3 class="pd-title">${esc(T(p.name))}</h3>
          <p class="pd-desc">${esc(T(p.desc))}</p>
        </div>
        <button class="btn btn-link btn-sm" data-close-detail type="button">${esc(t('poi.close'))}</button>
      </div>
      <div class="pd-meta">
        <div><span>${t('poi.price')}</span><b>${esc(T(p.price))}</b></div>
        <div><span>${t('poi.hours')}</span><b>${esc(T(p.time))}</b></div>
        <div><span>${t('poi.checkin')}</span><b>${t('poi.pts', { n: p.pts })}</b></div>
      </div>
      <div class="pd-tip"><b>${t('poi.tip')}</b> ${esc(T(p.tip))}</div>
      <div class="pd-actions">
        <button class="btn ${done ? 'btn-ghost' : 'btn-primary'}" data-checkin="${p.id}" ${done ? 'disabled' : ''} type="button">
          ${done ? esc(t('poi.done')) : esc(t('poi.check', { n: p.pts }))}
        </button>
        <button class="btn btn-ghost btn-sm" data-ask="${p.id}" type="button">${esc(t('poi.ask'))}</button>
      </div>
      <div class="pd-tags">${tags.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>`;
  }

  function selectPoi(id, scroll) {
    activePoi = id;
    renderList(); renderPins(); renderDetail();
    if (scroll) $('#poiDetail').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function checkin(id) {
    if (!requireAuth('gateCheckin')) return;
    if (state.checkins.includes(id)) return;
    const p = pointById(id);
    state.checkins.push(id);
    addPoints(p.pts, 'checkin', { name: T(p.name) });
    renderList(); renderPins(); renderDetail(); renderHero();
  }

  function renderCollections() {
    const d = dest();
    $('#collGrid').innerHTML = COLLECTIONS.map(c => {
      const items = d.points
        .map(p => ({ p, s: p.tags.filter(x => c.match.includes(x)).length }))
        .filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, 3).map(r => r.p);
      if (!items.length) return '';
      return `
        <button class="coll" data-coll="${items[0].id}" type="button">
          <h3>${esc(T(c.title))}</h3>
          <span class="coll-sub">${esc(T(c.sub))}</span>
          <ul class="coll-items">${items.map(p => `<li>${esc(T(p.name))}<span class="muted"> · ${esc(T(p.price))}</span></li>`).join('')}</ul>
          <div class="coll-more">${esc(t('poi.show'))}</div>
        </button>`;
    }).join('');
  }

  /* ────────── FAQ ────────── */
  function renderFaq() {
    $('#faqList').innerHTML = FAQ.map((f, i) => `
      <details class="faq-item" ${i === 0 ? 'open' : ''}>
        <summary>${esc(T(f.q))}</summary>
        <p>${esc(T(f.a))}</p>
      </details>`).join('');
  }

  /* ────────── hero ────────── */
  function renderHero() {
    const here = REGATTAS.filter(r => r.city === state.venue && !state.events.includes(r.id));
    const r = here[0] || REGATTAS.find(x => !state.events.includes(x.id)) || REGATTAS[0];
    const city = cityOf(r.city);
    $('#hcName').textContent = T(r.name);
    $('#hcBadge').textContent = T(r.date);
    $('#hcLine').textContent = `${city.flag} ${T(city.city)} — ${T(r.line)}`;
    $('#hcFleet').textContent = T(r.fleet);
    $('#hcWind').textContent = T(city.wind);
    $('#hcSpots').textContent = spotsLeft(r);
    const held = state.events.includes(r.id);
    const btn = $('#hcJoin');
    btn.textContent = held ? t('hc.held') : t('hc.join', { n: r.pts });
    btn.disabled = held;
    btn.dataset.event = r.id;
    $('#statCheckins').textContent = state.checkins.length;
  }

  /* ────────── account ────────── */
  function renderProfile() {
    const reg = state.registered;
    const lvl = levelOf(state.points);
    const next = nextLevel(state.points);

    $('#authGate').hidden = reg;
    $('#gateText').textContent = t('gate.text', { n: BONUS.signup });
    $('#gateCta').textContent = t('gate.cta', { n: BONUS.signup });
    $('#authBtn').textContent = reg ? state.name.split(' ')[0] : t('btn.signup');
    $('#ptsChipValue').textContent = state.points.toLocaleString(Lang.get() === 'ru' ? 'ru-RU' : 'en-US');
    $('#ptsChipUnit').textContent = t('btn.points');
    $('#pfPts').textContent = state.points.toLocaleString(Lang.get() === 'ru' ? 'ru-RU' : 'en-US');
    $('#pfPtsLabel').textContent = t('account.points');
    $('#pfRole').textContent = reg ? `${T(lvl.name)} · ${state.email}` : t('account.guest');
    $('#pfName').value = displayName();
    $('#pfName').disabled = !reg;
    $('#avatar').textContent = reg
      ? (state.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CK')
      : '?';

    $('#lvCur').textContent = T(lvl.name);
    $('#lvNext').textContent = next
      ? t('account.toLevel', { n: next.from - state.points, name: T(next.name) })
      : t('account.maxLevel');
    const base = lvl.from, top = next ? next.from : lvl.from + 1;
    $('#lvFill').style.width = `${next ? Math.min(100, ((state.points - base) / (top - base)) * 100) : 100}%`;
    $('#lvTicks').innerHTML = LEVELS.map(l => `<span class="${state.points >= l.from ? 'on' : ''}">${esc(T(l.name))}</span>`).join('');

    $('#pfCheckins').textContent = state.checkins.length;
    $('#pfEvents').textContent = state.events.length;
    $('#pfRefs').textContent = state.referrals;
    $('#pfRewards').textContent = state.claimed.length + state.courses.length;

    $('#refText').textContent = t('ref.text', { a: BONUS.inviter, b: BONUS.invitee });
    $('#refLink').value = reg ? `charterkey.com/r/${state.refCode}` : t('ref.placeholder');
    $('#refCopy').disabled = !reg;
    $('#refSim').disabled = !reg;
    $('#refDots').innerHTML = Array.from({ length: 5 }, (_, i) => `<i class="${i < state.referrals ? 'on' : ''}"></i>`).join('');
    $('#refHint').textContent = state.referrals >= 5 ? t('ref.hintFull') : t('ref.hint', { n: state.referrals });
    $('#refTiers').innerHTML = REF_TIERS.map(x => `
      <li class="${state.referrals >= x.n ? 'on' : ''}">
        <b>${x.n} ${esc(Lang.plural(x.n, t('ref.friend'), t('ref.friends'), t('ref.friends')))}</b>
        <span>${esc(T(x.title))} — ${esc(T(x.sub))}</span>
      </li>`).join('');

    $('#rewards').innerHTML = REWARDS.map(r => {
      const claimed = state.claimed.includes(r.id);
      const can = reg && state.points >= r.cost;
      return `
        <div class="reward ${claimed ? 'claimed' : ''}">
          <div>
            <div class="rw-title">${esc(T(r.title))}</div>
            <div class="rw-sub">${esc(T(r.sub))}</div>
            ${claimed ? `<div class="rw-code">${t('rewards.code')} ${esc(r.code)}</div>` : ''}
          </div>
          ${claimed
            ? `<span class="poi-pts">${esc(t('rewards.claimed'))}</span>`
            : `<button class="btn ${can ? 'btn-soft' : 'btn-ghost'} btn-sm" data-reward="${r.id}" type="button">${can ? esc(t('rewards.claim')) : esc(t('rewards.cost', { n: r.cost }))}</button>`}
        </div>`;
    }).join('');

    const locale = Lang.get() === 'ru' ? 'ru-RU' : 'en-GB';
    $('#activityLog').innerHTML = state.log.length
      ? state.log.map(l => `<li>${esc(t('logLabel.' + l.key, l.vars))} <span>${l.n > 0 ? '+' : ''}${l.n} · ${new Date(l.t).toLocaleString(locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></li>`).join('')
      : `<li class="log-empty">${esc(t('log.empty'))}</li>`;
  }

  function claimReward(id) {
    if (!requireAuth('gateReward')) return;
    const r = REWARDS.find(x => x.id === id);
    if (!r || state.claimed.includes(id)) return;
    if (state.points < r.cost) {
      toast(t('toast.short', { n: r.cost - state.points, title: esc(T(r.title)) }));
      return;
    }
    state.points -= r.cost;
    state.claimed.push(id);
    state.log.unshift({ t: Date.now(), key: 'reward', vars: { title: T(r.title) }, n: -r.cost });
    save(); renderProfile();
    toast(t('toast.reward', { code: esc(r.code) }));
  }

  /* ────────── two assistants ────────── */
  let mode = 'assistant';
  const engine = () => (mode === 'guide' ? Guide : Assistant);
  const ctx = () => ({ dest: dest(), state: { ...state, name: displayName() }, level: levelOf(state.points), nextLevel: nextLevel(state.points) });

  function renderSidebar() {
    if (mode === 'guide') {
      $('#gaTitle').textContent = t('ai.sideTown');
      $('#gaList').innerHTML = t('ai.sideTownItems')
        .map(i => `<li>${esc(i.replace('{n}', dest().points.length).replace('{city}', T(dest().city)))}</li>`).join('');
    } else {
      $('#gaTitle').textContent = t('ai.sideCrew');
      $('#gaList').innerHTML = t('ai.sideCrewItems').map(i => `<li>${esc(i)}</li>`).join('');
    }
  }

  function renderBoat() {
    $('#boatType').textContent = T(BOAT.type);
    $('#boatSpecs').innerHTML = BOAT.specs
      .map(s => `<div class="ga-row"><span>${esc(T(s.label))}</span><b>${esc(T(s.value))}</b></div>`).join('');
  }

  function bubble(kind, html, cards) {
    const log = $('#chatLog');
    const b = document.createElement('div');
    b.className = `msg ${kind}`;
    b.innerHTML = html;
    if (cards && cards.length) {
      const wrap = document.createElement('div');
      wrap.className = 'msg-cards';
      wrap.innerHTML = cards.map(p => `
        <button class="msg-card" data-poi="${p.id}" style="${catStyle(p.cat)}" type="button">
          <span class="poi-ico">${catIcon(p.cat)}</span>
          <span><span class="mc-name">${esc(T(p.name))}</span><br><span class="mc-sub">${esc(T(p.price))} · ${esc(T(p.time))}</span></span>
          <span class="mc-go">${esc(t('ai.cardGo'))}</span>
        </button>`).join('');
      b.append(wrap);
    }
    log.append(b);
    log.scrollTop = log.scrollHeight;
  }

  const chips = list => {
    $('#chatChips').innerHTML = (list || []).map(c => `<button class="chip" type="button">${esc(c)}</button>`).join('');
  };

  function ask(text) {
    if (!text.trim()) return;
    bubble('me', esc(text));
    $('#chatInput').value = '';
    chips([]);
    const log = $('#chatLog');
    const typing = document.createElement('div');
    typing.className = 'msg bot typing';
    typing.innerHTML = '<i></i><i></i><i></i>';
    log.append(typing); log.scrollTop = log.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const res = engine().answer(text, ctx());
      bubble('bot', res.text, res.cards);
      chips(res.chips);
    }, 420 + Math.random() * 380);
  }

  function resetChat() {
    $('#chatLog').innerHTML = '';
    const w = mode === 'guide' ? Guide.WELCOME(dest()) : Assistant.WELCOME(ctx().state);
    bubble('bot', w.text);
    chips(w.chips);
    renderSidebar();
  }

  function setMode(next) {
    if (mode === next) return;
    mode = next;
    $$('[data-mode]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.mode === mode)));
    resetChat();
  }

  /* ────────── language ────────── */
  function applyI18n() {
    document.documentElement.lang = Lang.get();
    $$('[data-i18n]').forEach(el => {
      const v = t(el.dataset.i18n);
      if (typeof v === 'string') el.textContent = v;
    });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-lang]').forEach(b => b.classList.toggle('on', b.dataset.lang === Lang.get()));
    $('#authTitle').textContent = t('modal.title');
    $('#authSubmit').textContent = t('modal.submit', { n: BONUS.signup });
    $('#perk1').innerHTML = t('modal.perk1', { title: esc(T(LEAD_MAGNET.title)) });
    $('#perk2').innerHTML = t('modal.perk2', { n: BONUS.signup });
    $('#perk3').innerHTML = t('modal.perk3', { a: BONUS.inviter, b: BONUS.invitee });
  }

  function setLang(v) {
    if (v === Lang.get()) return;
    Lang.set(v);
    applyI18n();
    MapView.render(dest());
    renderAll();
    renderQuiz();
    resetChat();
  }

  /* ────────── events ────────── */
  document.addEventListener('click', e => {
    const el = e.target;

    const lang = el.closest('[data-lang]');
    if (lang) { setLang(lang.dataset.lang); return; }

    const venue = el.closest('[data-venue]');
    if (venue) {
      switchVenue(venue.dataset.venue);
      if (venue.classList.contains('reg-venue')) $('#venues').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (el.closest('[data-auth]')) { openAuth(); return; }
    if (el.closest('[data-auth-close]')) { closeAuth(); return; }

    const m = el.closest('[data-mode]');
    if (m) { setMode(m.dataset.mode); return; }

    const tierEl = el.closest('[data-tier]');
    if (tierEl) { chooseTier(tierEl.dataset.tier); return; }

    const ans = el.closest('[data-answer]');
    if (ans) { answerQuiz(ans.dataset.answer); return; }
    if (el.closest('[data-quiz-restart]')) { restartQuiz(); return; }

    const askTier = el.closest('[data-ask-tier]');
    if (askTier) {
      const x = TIERS.find(y => y.id === askTier.dataset.askTier);
      setMode('assistant');
      $('#ai').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => ask(Lang.get() === 'ru' ? `Расскажи про тариф ${T(x.name)}` : `Tell me about the ${T(x.name)} tier`), 350);
      return;
    }

    const ev = el.closest('[data-event]');
    if (ev) { holdEvent(ev.dataset.event); return; }

    const buy = el.closest('[data-buy]');
    if (buy) { buyCourse(buy.dataset.buy, false); return; }

    const cp = el.closest('[data-course-points]');
    if (cp) { buyCourse(cp.dataset.coursePoints, true); return; }

    if (el.closest('#clubBtn')) { joinClub(); return; }

    if (el.closest('#platformCta')) { toast(t('platform.toast')); return; }

    const f = el.closest('[data-cat]');
    if (f) { filter = f.dataset.cat; renderFilters(); renderList(); renderPins(); return; }

    const poi = el.closest('[data-poi]');
    if (poi) { selectPoi(poi.dataset.poi, true); return; }

    const coll = el.closest('[data-coll]');
    if (coll) { selectPoi(coll.dataset.coll, false); $('#map').scrollIntoView({ behavior: 'smooth' }); return; }

    const ci = el.closest('[data-checkin]');
    if (ci) { checkin(ci.dataset.checkin); return; }

    const ak = el.closest('[data-ask]');
    if (ak) {
      const p = pointById(ak.dataset.ask);
      setMode('guide');
      $('#ai').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => ask(T(p.name)), 350);
      return;
    }

    const rw = el.closest('[data-reward]');
    if (rw) { claimReward(rw.dataset.reward); return; }

    if (el.closest('[data-close-detail]')) { activePoi = null; renderList(); renderPins(); renderDetail(); return; }

    const sc = el.closest('[data-scroll]');
    if (sc) { $(sc.dataset.scroll).scrollIntoView({ behavior: 'smooth' }); return; }

    if (el.classList.contains('chip')) {
      const q = el.textContent;
      if (/^(sign up|зарегистрироваться)$/i.test(q.trim())) { openAuth(); return; }
      ask(q);
      return;
    }

    if (el.closest('#burger')) { $('#nav').classList.toggle('open'); return; }
    if (el.closest('#nav a')) { $('#nav').classList.remove('open'); return; }
    if (el.closest('#ptsChip')) { $('#account').scrollIntoView({ behavior: 'smooth' }); return; }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#authModal').hidden) closeAuth();
  });

  $('#authForm').addEventListener('submit', e => {
    e.preventDefault();
    register($('#authName').value, $('#authEmail').value, $('#authPromo').value);
  });

  $('#searchInput').addEventListener('input', e => { query = e.target.value; renderList(); renderPins(); });
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); ask($('#chatInput').value); });
  $('#chatReset').addEventListener('click', resetChat);

  $('#pfName').addEventListener('change', e => {
    if (!state.registered) return;
    state.name = e.target.value.trim() || state.name;
    save(); renderProfile();
  });

  $('#refCopy').addEventListener('click', async () => {
    if (!requireAuth('gateRef')) return;
    try { await navigator.clipboard.writeText($('#refLink').value); } catch { $('#refLink').select(); }
    toast(t('toast.copied'));
  });

  $('#refSim').addEventListener('click', () => {
    if (!requireAuth('gateInvite')) return;
    if (state.referrals >= 5) { toast(t('toast.invitesDone')); return; }
    state.referrals++;
    const tier = REF_TIERS.find(x => x.n === state.referrals);
    addPoints(BONUS.inviter, 'referral', { n: state.referrals });
    if (tier) toast(t('toast.tier', { n: tier.n, title: esc(T(tier.title)) }));
    renderProfile();
  });

  $('#resetAll').addEventListener('click', () => {
    if (!confirm(t('confirmReset'))) return;
    state = { ...DEFAULT }; save();
    restartQuiz(); MapView.render(dest()); renderAll(); resetChat();
    toast(t('toast.cleared'));
  });

  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      $$('[data-nav]').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['berths', 'calendar', 'academy', 'map', 'ai', 'account'].forEach(id => spy.observe($('#' + id)));

  /* ────────── start ────────── */
  function renderAll() {
    renderVenues();
    renderTiers();
    renderMagnet();
    renderEvents();
    renderAcademy();
    renderCity();
    renderFilters();
    renderList();
    renderPins();
    renderDetail();
    renderCollections();
    renderFaq();
    renderHero();
    renderProfile();
    renderBoat();
  }

  applyI18n();
  MapView.render(dest());
  renderQuiz();
  renderAll();
  resetChat();
})();

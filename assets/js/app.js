/* Charter Key — состояние, аккаунт, карта, очки, два ИИ, переключение языка */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KEY = 'charterkey.v1';

  /* ────────── состояние ────────── */
  const DEFAULT = {
    registered: false, name: '', email: '', refCode: '', invitedBy: '',
    points: 0, checkins: [], regattas: [], referrals: 0, claimed: [], log: []
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
    } catch { return { ...DEFAULT }; }
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

  const dest = () => DESTINATIONS[0];
  const pointById = id => dest().points.find(p => p.id === id);
  const levelOf = pts => [...LEVELS].reverse().find(l => pts >= l.from) || LEVELS[0];
  const nextLevel = pts => LEVELS.find(l => l.from > pts) || null;
  const guestName = () => Lang.get() === 'en' ? 'Guest' : 'Гость';
  const displayName = () => state.registered ? state.name : guestName();

  const catStyle = cat => {
    const c = CAT_META[cat].color;
    return `--cat-color:${c};--cat-bg:${hex(c, .16)};--cat-line:${hex(c, .45)}`;
  };
  function hex(h, a) {
    const n = parseInt(h.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  }
  const catIcon = cat => CATEGORIES.find(c => c.id === cat).icon;

  /* ────────── очки, журнал, тосты ────────── */
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

  /* ────────── аккаунт ────────── */
  function openAuth(reason) {
    if (state.registered) { $('#profile').scrollIntoView({ behavior: 'smooth' }); return; }
    $('#authError').hidden = true;
    $('#authModal').hidden = false;
    document.body.style.overflow = 'hidden';
    if (reason) toast(reason);
    setTimeout(() => $('#authName').focus(), 60);
  }
  function closeAuth() {
    $('#authModal').hidden = true;
    document.body.style.overflow = '';
  }
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
    $('#profile').scrollIntoView({ behavior: 'smooth' });
  }

  function makeCode(name) {
    const map = { А:'A',Б:'B',В:'V',Г:'G',Д:'D',Е:'E',Ж:'ZH',З:'Z',И:'I',Й:'Y',К:'K',Л:'L',М:'M',Н:'N',О:'O',П:'P',Р:'R',С:'S',Т:'T',У:'U',Ф:'F',Х:'H',Ц:'C',Ч:'CH',Ш:'SH',Щ:'SCH',Ы:'Y',Э:'E',Ю:'YU',Я:'YA',Ь:'',Ъ:'' };
    const first = name.trim().split(/\s+/)[0] || 'CREW';
    const lat = [...first.toUpperCase()].map(c => map[c] ?? c).join('').replace(/[^A-Z]/g, '').slice(0, 10) || 'CREW';
    return `CK-${lat}-${1000 + Math.floor(Math.random() * 8999)}`;
  }

  /* ────────── карта ────────── */
  let filter = 'all', query = '', activePoi = null;

  const visiblePoints = () => dest().points.filter(p => {
    const okCat = filter === 'all' || p.cat === filter;
    const q = query.trim().toLowerCase();
    const hay = (T(p.name) + ' ' + T(p.desc) + ' ' + p.tags.join(' ') + ' ' + (p.tagsEn || []).join(' ')).toLowerCase();
    return okCat && (!q || hay.includes(q));
  });

  function renderCity() {
    const d = dest();
    $('#cityMeta').innerHTML = `
      <span>${t('map.metaCity')}: <b>${esc(T(d.city))}, ${esc(T(d.region))}</b></span>
      <span>${t('map.metaSeason')}: <b>${esc(T(d.season))}</b></span>
      <span>${t('map.metaWind')}: <b>${esc(T(d.wind))}</b></span>
      <span>${t('map.metaWater')}: <b>${esc(T(d.water))}</b></span>
      <span>${t('map.metaPlaces')}: <b>${d.points.length}</b></span>`;
    $('#mapKicker').textContent = t('map.kicker', { city: T(d.city) });
    $('#eyebrow').textContent = t('hero.eyebrow', { city: T(d.city), n: d.points.length });
    $('#tabGuideSub').textContent = t('ai.tabGuideSub', { city: T(d.city) });
    $('#gaSeason').textContent = T(d.season);
    $('#gaWind').textContent = T(d.wind);
    $('#gaWater').textContent = T(d.water);
    $('#gaRegatta').textContent = T(d.regatta);
    $('#statPlaces').textContent = d.points.length;
    $('#statRegattas').textContent = REGATTAS.length;
  }

  function renderFilters() {
    $('#filters').innerHTML = CATEGORIES.map(c => `
      <button class="filter" data-cat="${c.id}" aria-pressed="${filter === c.id}">
        ${c.icon} ${esc(T(c.label))}
      </button>`).join('');
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
    const tags = (Lang.get() === 'en' ? (p.tagsEn || p.tags) : p.tags).slice(0, 7);
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
        <div><span>${t('poi.perCheckin')}</span><b>${t('poi.pts', { n: p.pts })}</b></div>
      </div>
      <div class="pd-tip"><b>${t('poi.tip')}</b> ${esc(T(p.tip))}</div>
      <div class="pd-actions">
        <button class="btn ${done ? 'btn-ghost' : 'btn-primary'}" data-checkin="${p.id}" ${done ? 'disabled' : ''} type="button">
          ${done ? esc(t('poi.done')) : esc(t('poi.checkin', { n: p.pts }))}
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

  /* ────────── подборки ────────── */
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
          <div class="coll-more">${esc(t('coll.open'))}</div>
        </button>`;
    }).join('');
  }

  /* ────────── регаты ────────── */
  function renderRegattas() {
    const d = dest();
    $('#regGrid').innerHTML = REGATTAS.map(r => {
      const joined = state.regattas.includes(r.id);
      return `
        <article class="reg ${joined ? 'joined' : ''}">
          <div class="reg-top">
            <span class="reg-level">${esc(T(r.level))}</span>
            <span class="reg-date">${esc(T(r.date))}</span>
          </div>
          <h3>${esc(T(r.name))}</h3>
          <span class="reg-city">${esc(T(d.city))} · ${esc(T(d.region))}</span>
          <div class="reg-rows">
            <span>${t('reg.fleet')}: ${esc(T(r.fleet))}</span>
            <span>${esc(T(r.slots))}</span>
          </div>
          <div class="reg-foot">
            <button class="btn ${joined ? 'btn-ghost' : 'btn-soft'} btn-sm" data-reg="${r.id}" ${joined ? 'disabled' : ''} type="button">
              ${joined ? esc(t('reg.joined')) : esc(t('reg.join', { n: r.pts }))}
            </button>
            <button class="btn btn-link btn-sm" data-scroll="#map" type="button">${esc(t('reg.nearby'))}</button>
          </div>
        </article>`;
    }).join('');
  }

  function joinRegatta(id) {
    if (!requireAuth('gateRegatta')) return;
    if (state.regattas.includes(id)) return;
    const r = REGATTAS.find(x => x.id === id);
    state.regattas.push(id);
    addPoints(r.pts, 'regatta', { name: T(r.name) });
    renderRegattas(); renderHero();
  }

  /* ────────── hero ────────── */
  function renderHero() {
    const d = dest(), r = REGATTAS[0];
    $('#hcName').textContent = T(r.name);
    $('#hcCity').textContent = `${T(d.city)} · ${T(d.region)}`;
    $('#hcWind').textContent = T(d.wind);
    $('#hcWater').textContent = T(d.water);
    $('#hcFleet').textContent = T(r.fleet);
    $('#hcBadge').textContent = T(r.date);
    const joined = state.regattas.includes(r.id);
    const btn = $('#hcJoin');
    btn.textContent = joined ? t('hc.joined') : t('hc.join', { n: r.pts });
    btn.disabled = joined;
    btn.dataset.reg = r.id;
    $('#statCheckins').textContent = state.checkins.length;
    $('#heroSignup').textContent = t('hero.ctaSignup', { n: BONUS.signup });
  }

  /* ────────── профиль ────────── */
  function renderProfile() {
    const reg = state.registered;
    const lvl = levelOf(state.points);
    const next = nextLevel(state.points);

    $('#authGate').hidden = reg;
    $('#gateText').textContent = t('gate.text', { n: BONUS.signup });
    $('#gateCta').textContent = t('gate.cta', { n: BONUS.signup });
    $('#authBtn').textContent = reg ? state.name.split(' ')[0] : t('btn.signup');

    $('#ptsChipValue').textContent = state.points.toLocaleString(Lang.get() === 'en' ? 'en-US' : 'ru-RU');
    $('#ptsChipUnit').textContent = t('btn.points');
    $('#pfPts').textContent = state.points.toLocaleString(Lang.get() === 'en' ? 'en-US' : 'ru-RU');
    $('#pfPtsLabel').textContent = t('profile.points');
    $('#pfRole').textContent = reg ? `${T(lvl.name)} · ${state.email}` : t('profile.guest');
    $('#pfName').value = displayName();
    $('#pfName').disabled = !reg;
    $('#avatar').textContent = reg
      ? (state.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CK')
      : '?';

    $('#lvCur').textContent = T(lvl.name);
    $('#lvNext').textContent = next
      ? t('profile.toLevel', { name: T(next.name), n: next.from - state.points })
      : t('profile.maxLevel');
    const base = lvl.from, top = next ? next.from : lvl.from + 1;
    $('#lvFill').style.width = `${next ? Math.min(100, ((state.points - base) / (top - base)) * 100) : 100}%`;
    $('#lvTicks').innerHTML = LEVELS.map(l => `<span class="${state.points >= l.from ? 'on' : ''}">${esc(T(l.name))}</span>`).join('');

    $('#pfCheckins').textContent = state.checkins.length;
    $('#pfRegattas').textContent = state.regattas.length;
    $('#pfRefs').textContent = state.referrals;
    $('#pfBonuses').textContent = state.claimed.length;

    $('#refText').textContent = t('ref.text', { a: BONUS.inviter, b: BONUS.invitee });
    $('#refLink').value = reg ? `charterkey.app/r/${state.refCode}` : t('ref.placeholder');
    $('#refCopy').disabled = !reg;
    $('#refSim').disabled = !reg;
    $('#refDots').innerHTML = Array.from({ length: 5 }, (_, i) => `<i class="${i < state.referrals ? 'on' : ''}"></i>`).join('');
    $('#refHint').textContent = state.referrals >= 5
      ? t('ref.hintFull')
      : t('ref.hint', { n: state.referrals, word: Lang.plural(state.referrals, t('ref.friendsWord')) });
    $('#refTiers').innerHTML = REF_TIERS.map(x => `
      <li class="${state.referrals >= x.n ? 'on' : ''}">
        <b>${x.n} ${esc(Lang.plural(x.n, t('ref.tierWord')))}</b>
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
            ${claimed ? `<div class="rw-code">${t('rewards.promo')} ${esc(r.code)}</div>` : ''}
          </div>
          ${claimed
            ? `<span class="poi-pts">${esc(t('rewards.claimed'))}</span>`
            : `<button class="btn ${can ? 'btn-soft' : 'btn-ghost'} btn-sm" data-reward="${r.id}" type="button">${can ? esc(t('rewards.claim')) : esc(t('rewards.cost', { n: r.cost }))}</button>`}
        </div>`;
    }).join('');

    const locale = Lang.get() === 'en' ? 'en-GB' : 'ru-RU';
    $('#activityLog').innerHTML = state.log.length
      ? state.log.map(l => `<li>${esc(t('logLabel.' + l.key, l.vars))} <span>${l.n > 0 ? '+' : ''}${l.n} · ${new Date(l.t).toLocaleString(locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></li>`).join('')
      : `<li class="log-empty">${esc(t('log.empty'))}</li>`;
  }

  function claimReward(id) {
    if (!requireAuth('gateReward')) return;
    const r = REWARDS.find(x => x.id === id);
    if (!r || state.claimed.includes(id)) return;
    if (state.points < r.cost) {
      toast(t('toast.notEnough', { n: r.cost - state.points, title: esc(T(r.title)) }));
      return;
    }
    state.points -= r.cost;
    state.claimed.push(id);
    state.log.unshift({ t: Date.now(), key: 'reward', vars: { title: T(r.title) }, n: -r.cost });
    save(); renderProfile();
    toast(t('toast.reward', { code: esc(r.code) }));
  }

  /* ────────── два ИИ ────────── */
  let mode = 'assistant';
  const engine = () => (mode === 'guide' ? Guide : Assistant);
  const ctx = () => ({ dest: dest(), state: { ...state, name: displayName() }, level: levelOf(state.points), nextLevel: nextLevel(state.points) });

  function renderSidebar() {
    if (mode === 'guide') {
      $('#gaTitle').textContent = t('ai.sideGuide');
      $('#gaList').innerHTML = t('ai.sideGuideItems')
        .map(i => `<li>${esc(i.replace('{n}', dest().points.length))}</li>`).join('');
    } else {
      $('#gaTitle').textContent = t('ai.sideAssistant');
      $('#gaList').innerHTML = t('ai.sideAssistantItems').map(i => `<li>${esc(i)}</li>`).join('');
    }
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

  /* ────────── язык ────────── */
  function applyI18n() {
    document.documentElement.lang = Lang.get();
    $$('[data-i18n]').forEach(el => {
      const v = t(el.dataset.i18n);
      if (typeof v === 'string') el.textContent = v;
    });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-lang]').forEach(b => b.classList.toggle('on', b.dataset.lang === Lang.get()));
    $('#perk1').innerHTML = t('modal.perk1', { n: BONUS.signup });
    $('#perk3').innerHTML = t('modal.perk3', { a: BONUS.inviter, b: BONUS.invitee });
    $('#authSubmit').textContent = t('modal.submit', { n: BONUS.signup });
    $('#authTitle').textContent = t('modal.title');
  }

  function setLang(v) {
    if (v === Lang.get()) return;
    Lang.set(v);
    applyI18n();
    MapView.render(dest());
    renderAll();
    resetChat();
  }

  /* ────────── события ────────── */
  document.addEventListener('click', e => {
    const el = e.target;

    const lang = el.closest('[data-lang]');
    if (lang) { setLang(lang.dataset.lang); return; }

    if (el.closest('[data-auth]')) { openAuth(); return; }
    if (el.closest('[data-auth-close]')) { closeAuth(); return; }

    const m = el.closest('[data-mode]');
    if (m) { setMode(m.dataset.mode); return; }

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
      $('#guide').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => ask(T(p.name)), 350);
      return;
    }

    const reg = el.closest('[data-reg]');
    if (reg) { joinRegatta(reg.dataset.reg); return; }

    const rw = el.closest('[data-reward]');
    if (rw) { claimReward(rw.dataset.reward); return; }

    if (el.closest('[data-close-detail]')) { activePoi = null; renderList(); renderPins(); renderDetail(); return; }

    const sc = el.closest('[data-scroll]');
    if (sc) { $(sc.dataset.scroll).scrollIntoView({ behavior: 'smooth' }); return; }

    if (el.classList.contains('chip')) {
      const q = el.textContent;
      if (/^(зарегистрироваться|sign up)$/i.test(q.trim())) { openAuth(); return; }
      ask(q);
      return;
    }

    if (el.closest('#burger')) { $('#nav').classList.toggle('open'); return; }
    if (el.closest('#nav a')) { $('#nav').classList.remove('open'); return; }
    if (el.closest('#ptsChip')) { $('#profile').scrollIntoView({ behavior: 'smooth' }); return; }
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
    renderAll(); resetChat();
    toast(t('toast.cleared'));
  });

  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      $$('[data-nav]').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['map', 'collections', 'regattas', 'guide', 'profile'].forEach(id => spy.observe($('#' + id)));

  /* ────────── старт ────────── */
  function renderAll() {
    renderCity();
    renderFilters();
    renderList();
    renderPins();
    renderDetail();
    renderCollections();
    renderRegattas();
    renderHero();
    renderProfile();
  }

  applyI18n();
  MapView.render(dest());
  renderAll();
  resetChat();
})();

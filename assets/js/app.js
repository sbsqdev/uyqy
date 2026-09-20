/* Charter Key — состояние, аккаунт, карта, очки, два ИИ */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KEY = 'charterkey.v1';

  /* ────────── состояние ────────── */
  const DEFAULT = {
    registered: false, name: 'Гость', email: '', refCode: '', invitedBy: '',
    points: 0, checkins: [], regattas: [], referrals: 0, claimed: [], log: []
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
    } catch { return { ...DEFAULT }; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }

  const dest = () => DESTINATIONS[0];
  const pointById = id => dest().points.find(p => p.id === id);
  const levelOf = pts => [...LEVELS].reverse().find(l => pts >= l.from) || LEVELS[0];
  const nextLevel = pts => LEVELS.find(l => l.from > pts) || null;

  const catStyle = cat => {
    const c = CAT_META[cat].color;
    return `--cat-color:${c};--cat-bg:${hex(c, .16)};--cat-line:${hex(c, .45)}`;
  };
  function hex(h, a) {
    const n = parseInt(h.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  }
  const catIcon = cat => CATEGORIES.find(c => c.id === cat).icon;

  /* склонение числительных: 1 друг, 2 друга, 5 друзей */
  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  /* ────────── очки, журнал, тосты ────────── */
  function addPoints(n, label) {
    state.points += n;
    state.log.unshift({ t: Date.now(), label, n });
    state.log = state.log.slice(0, 40);
    save();
    renderProfile();
    const chip = $('#ptsChip');
    chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
    toast(`<b>+${n}</b> очков · ${label}`);
  }

  function toast(html) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    $('#toasts').append(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 3400);
  }

  /* ────────── аккаунт ────────── */
  function openAuth(reason) {
    if (state.registered) { $('#profile').scrollIntoView({ behavior: 'smooth' }); return; }
    const m = $('#authModal');
    $('#authError').hidden = true;
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    if (reason) toast(reason);
    setTimeout(() => $('#authName').focus(), 60);
  }
  function closeAuth() {
    $('#authModal').hidden = true;
    document.body.style.overflow = '';
  }

  function requireAuth(reason) {
    if (state.registered) return true;
    openAuth(reason);
    return false;
  }

  function register(name, email, promo) {
    const err = $('#authError');
    if (name.trim().length < 2) { err.textContent = 'Напишите имя — оно будет на карточке экипажа.'; err.hidden = false; return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) { err.textContent = 'Проверьте почту: нужен формат name@domain.com'; err.hidden = false; return; }

    state.registered = true;
    state.name = name.trim();
    state.email = email.trim();
    state.invitedBy = promo.trim().toUpperCase();
    state.refCode = makeCode(state.name);
    save();
    closeAuth();

    addPoints(BONUS.signup, 'Регистрация в Charter Key');
    if (state.invitedBy) {
      addPoints(BONUS.invitee, `Промокод друга ${state.invitedBy}`);
    }
    renderAll();
    $('#profile').scrollIntoView({ behavior: 'smooth' });
  }

  function makeCode(name) {
    const first = name.trim().split(/\s+/)[0] || 'CREW';
    const map = { А:'A',Б:'B',В:'V',Г:'G',Д:'D',Е:'E',Ж:'ZH',З:'Z',И:'I',Й:'Y',К:'K',Л:'L',М:'M',Н:'N',О:'O',П:'P',Р:'R',С:'S',Т:'T',У:'U',Ф:'F',Х:'H',Ц:'C',Ч:'CH',Ш:'SH',Щ:'SCH',Ы:'Y',Э:'E',Ю:'YU',Я:'YA',Ь:'',Ъ:'' };
    const lat = [...first.toUpperCase()].map(c => map[c] ?? c).join('').replace(/[^A-Z]/g, '').slice(0, 10) || 'CREW';
    return `CK-${lat}-${1000 + Math.floor(Math.random() * 8999)}`;
  }

  /* ────────── карта: фильтры ────────── */
  let filter = 'all';
  let query = '';
  let activePoi = null;

  const visiblePoints = () => dest().points.filter(p => {
    const okCat = filter === 'all' || p.cat === filter;
    const q = query.trim().toLowerCase();
    const okQ = !q || (p.name + ' ' + p.desc + ' ' + p.tags.join(' ')).toLowerCase().includes(q);
    return okCat && okQ;
  });

  function renderCity() {
    const d = dest();
    $('#cityMeta').innerHTML = `
      <span>Город: <b>${esc(d.city)}, ${esc(d.region)}</b></span>
      <span>Сезон: <b>${esc(d.season)}</b></span>
      <span>Ветер: <b>${esc(d.wind)}</b></span>
      <span>Вода: <b>${esc(d.water)}</b></span>
      <span>Мест на карте: <b>${d.points.length}</b></span>`;
    $('#chatCity').textContent = d.city;
    $('#gaSeason').textContent = d.season;
    $('#gaWind').textContent = d.wind;
    $('#gaWater').textContent = d.water;
    $('#gaRegatta').textContent = d.regatta;
    $('#eyebrowPoints').textContent = d.points.length;
    $('#statPoints').textContent = d.points.length;
    $('#statRegattas').textContent = REGATTAS.length;
  }

  function renderFilters() {
    $('#filters').innerHTML = CATEGORIES.map(c => `
      <button class="filter" data-cat="${c.id}" aria-pressed="${filter === c.id}">
        ${c.icon} ${esc(c.label)}
      </button>`).join('');
  }

  function renderList() {
    const list = visiblePoints();
    const box = $('#poiList');
    if (!list.length) {
      box.innerHTML = `<div class="poi-empty">Ничего не нашлось. Попробуйте «рыба», «закат», «SUP» или сбросьте фильтр.</div>`;
      return;
    }
    box.innerHTML = list.map(p => `
      <button class="poi-item ${activePoi === p.id ? 'active' : ''} ${state.checkins.includes(p.id) ? 'done' : ''}"
              data-poi="${p.id}" style="${catStyle(p.cat)}">
        <span class="poi-ico">${catIcon(p.cat)}</span>
        <span>
          <span class="poi-name">${esc(p.name)}</span><br>
          <span class="poi-sub">${esc(CAT_META[p.cat].label)} · ${esc(p.price)}</span>
        </span>
        <span class="poi-pts">+${p.pts}</span>
      </button>`).join('');
  }

  function renderPins() {
    const vis = new Set(visiblePoints().map(p => p.id));
    $('#pins').innerHTML = dest().points.map(p => `
      <button class="pin ${vis.has(p.id) ? '' : 'dim'} ${activePoi === p.id ? 'active' : ''} ${state.checkins.includes(p.id) ? 'done' : ''}"
              data-poi="${p.id}" style="left:${p.x}%;top:${p.y}%;${catStyle(p.cat)}" title="${esc(p.name)}">
        <span class="pin-body">
          <span class="pin-dot">${catIcon(p.cat)}</span>
          <span class="pin-label">${esc(p.name)}</span>
        </span>
        <span class="pin-stem"></span>
      </button>`).join('');

    $('#mapLegend').innerHTML = Object.entries(CAT_META)
      .map(([, v]) => `<span class="lg"><i style="background:${v.color}"></i>${esc(v.label)}</span>`).join('');
  }

  function renderDetail() {
    const box = $('#poiDetail');
    const p = activePoi ? pointById(activePoi) : null;
    if (!p) { box.hidden = true; box.innerHTML = ''; return; }
    const done = state.checkins.includes(p.id);
    box.hidden = false;
    box.style.cssText = catStyle(p.cat);
    box.innerHTML = `
      <div class="pd-top">
        <div>
          <span class="pd-cat">${catIcon(p.cat)} ${esc(CAT_META[p.cat].label)}</span>
          <h3 class="pd-title">${esc(p.name)}</h3>
          <p class="pd-desc">${esc(p.desc)}</p>
        </div>
        <button class="btn btn-link btn-sm" data-close-detail type="button">Закрыть ✕</button>
      </div>
      <div class="pd-meta">
        <div><span>Цена</span><b>${esc(p.price)}</b></div>
        <div><span>Часы</span><b>${esc(p.time)}</b></div>
        <div><span>За чек-ин</span><b>+${p.pts} очков</b></div>
      </div>
      <div class="pd-tip"><b>Совет:</b> ${esc(p.tip)}</div>
      <div class="pd-actions">
        <button class="btn ${done ? 'btn-ghost' : 'btn-primary'}" data-checkin="${p.id}" ${done ? 'disabled' : ''} type="button">
          ${done ? '✓ Чек-ин сделан' : `Чек-ин · +${p.pts} очков`}
        </button>
        <button class="btn btn-ghost btn-sm" data-ask="${p.id}" type="button">Спросить гида об этом месте</button>
      </div>
      <div class="pd-tags">${p.tags.slice(0, 7).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>`;
  }

  function selectPoi(id, scroll) {
    activePoi = id;
    renderList(); renderPins(); renderDetail();
    if (scroll) $('#poiDetail').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function checkin(id) {
    if (!requireAuth('Чек-ины копятся в аккаунте — заведите его за минуту')) return;
    if (state.checkins.includes(id)) return;
    const p = pointById(id);
    state.checkins.push(id);
    addPoints(p.pts, `Чек-ин: ${p.name}`);
    renderList(); renderPins(); renderDetail(); renderHero();
  }

  /* ────────── подборки ────────── */
  function renderCollections() {
    const d = dest();
    $('#collGrid').innerHTML = COLLECTIONS.map(c => {
      const items = d.points
        .map(p => ({ p, s: p.tags.filter(t => c.match.includes(t)).length }))
        .filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, 3).map(r => r.p);
      if (!items.length) return '';
      return `
        <button class="coll" data-coll="${items[0].id}" type="button">
          <h3>${esc(c.title)}</h3>
          <span class="coll-sub">${esc(c.sub)}</span>
          <ul class="coll-items">${items.map(p => `<li>${esc(p.name)}<span class="muted"> · ${esc(p.price)}</span></li>`).join('')}</ul>
          <div class="coll-more">Открыть на карте →</div>
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
            <span class="reg-level">${esc(r.level)}</span>
            <span class="reg-date">${esc(r.date)}</span>
          </div>
          <h3>${esc(r.name)}</h3>
          <span class="reg-city">${esc(d.city)} · ${esc(d.region)}</span>
          <div class="reg-rows">
            <span>Флот: ${esc(r.fleet)}</span>
            <span>${esc(r.slots)}</span>
          </div>
          <div class="reg-foot">
            <button class="btn ${joined ? 'btn-ghost' : 'btn-soft'} btn-sm" data-reg="${r.id}" ${joined ? 'disabled' : ''} type="button">
              ${joined ? '✓ Вы в списке' : `Я иду · +${r.pts}`}
            </button>
            <button class="btn btn-link btn-sm" data-scroll="#map" type="button">Места рядом</button>
          </div>
        </article>`;
    }).join('');
  }

  function joinRegatta(id) {
    if (!requireAuth('Заявка на регату сохраняется в аккаунте')) return;
    if (state.regattas.includes(id)) return;
    const r = REGATTAS.find(x => x.id === id);
    state.regattas.push(id);
    addPoints(r.pts, `Заявка на регату: ${r.name}`);
    renderRegattas(); renderHero();
  }

  /* ────────── hero ────────── */
  function renderHero() {
    const d = dest();
    const r = REGATTAS[0];
    $('#hcName').textContent = r.name;
    $('#hcCity').textContent = `${d.city} · ${d.region}`;
    $('#hcWind').textContent = d.wind;
    $('#hcWater').textContent = d.water;
    $('#hcFleet').textContent = r.fleet;
    $('#hcBadge').textContent = r.date;
    const joined = state.regattas.includes(r.id);
    const btn = $('#hcJoin');
    btn.textContent = joined ? '✓ Вы в списке экипажей' : `Я иду · +${r.pts} очков`;
    btn.disabled = joined;
    btn.dataset.reg = r.id;
    $('#statCheckins').textContent = state.checkins.length;
  }

  /* ────────── профиль ────────── */
  function renderProfile() {
    const reg = state.registered;
    const lvl = levelOf(state.points);
    const next = nextLevel(state.points);

    $('#authGate').hidden = reg;
    $('#authBtn').textContent = reg ? state.name.split(' ')[0] : 'Регистрация';

    $('#ptsChipValue').textContent = state.points.toLocaleString('ru-RU');
    $('#pfPts').textContent = state.points.toLocaleString('ru-RU');
    $('#pfRole').textContent = reg ? `${lvl.name} · ${esc(state.email)}` : 'Гость · без аккаунта';
    $('#pfName').value = state.name;
    $('#pfName').disabled = !reg;
    $('#avatar').textContent = reg
      ? (state.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CK')
      : '?';

    $('#lvCur').textContent = lvl.name;
    $('#lvNext').textContent = next
      ? `до уровня «${next.name}» — ${next.from - state.points} очков`
      : 'максимальный уровень';
    const base = lvl.from, top = next ? next.from : lvl.from + 1;
    $('#lvFill').style.width = `${next ? Math.min(100, ((state.points - base) / (top - base)) * 100) : 100}%`;
    $('#lvTicks').innerHTML = LEVELS.map(l => `<span class="${state.points >= l.from ? 'on' : ''}">${esc(l.name)}</span>`).join('');

    $('#pfCheckins').textContent = state.checkins.length;
    $('#pfRegattas').textContent = state.regattas.length;
    $('#pfRefs').textContent = state.referrals;
    $('#pfBonuses').textContent = state.claimed.length;

    $('#refLink').value = reg ? `charterkey.app/r/${state.refCode}` : 'Появится после регистрации';
    $('#refCopy').disabled = !reg;
    $('#refSim').disabled = !reg;
    $('#refDots').innerHTML = Array.from({ length: 5 }, (_, i) => `<i class="${i < state.referrals ? 'on' : ''}"></i>`).join('');
    $('#refHint').textContent = state.referrals >= 5
      ? 'Все пятеро на борту — сутки чартера ваши.'
      : `${state.referrals} из 5 · приглашено ${state.referrals} ${plural(state.referrals, 'друг', 'друга', 'друзей')}`;
    $('#refTiers').innerHTML = REF_TIERS.map(t => `
      <li class="${state.referrals >= t.n ? 'on' : ''}">
        <b>${t.n} ${plural(t.n, 'друг', 'друга', 'друзей')}</b>
        <span>${esc(t.title)} — ${esc(t.sub)}</span>
      </li>`).join('');

    $('#rewards').innerHTML = REWARDS.map(r => {
      const claimed = state.claimed.includes(r.id);
      const can = reg && state.points >= r.cost;
      return `
        <div class="reward ${claimed ? 'claimed' : ''}">
          <div>
            <div class="rw-title">${esc(r.title)}</div>
            <div class="rw-sub">${esc(r.sub)}</div>
            ${claimed ? `<div class="rw-code">Промокод: ${esc(r.code)}</div>` : ''}
          </div>
          ${claimed
            ? '<span class="poi-pts">получено</span>'
            : `<button class="btn ${can ? 'btn-soft' : 'btn-ghost'} btn-sm" data-reward="${r.id}" type="button">${can ? 'Забрать' : `${r.cost} очк.`}</button>`}
        </div>`;
    }).join('');

    $('#activityLog').innerHTML = state.log.length
      ? state.log.map(l => `<li>${esc(l.label)} <span>${l.n > 0 ? '+' : ''}${l.n} · ${new Date(l.t).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></li>`).join('')
      : '<li class="log-empty">Пока пусто. Заведите аккаунт и сделайте первый чек-ин на карте.</li>';
  }

  function claimReward(id) {
    if (!requireAuth('Бонусы привязаны к аккаунту')) return;
    const r = REWARDS.find(x => x.id === id);
    if (!r || state.claimed.includes(id)) return;
    if (state.points < r.cost) {
      toast(`Не хватает <b>${r.cost - state.points}</b> очков до «${esc(r.title)}»`);
      return;
    }
    state.points -= r.cost;
    state.claimed.push(id);
    state.log.unshift({ t: Date.now(), label: `Бонус: ${r.title}`, n: -r.cost });
    save(); renderProfile();
    toast(`Бонус ваш · промокод <b>${esc(r.code)}</b>`);
  }

  /* ────────── два ИИ ────────── */
  let mode = 'assistant';

  const engine = () => (mode === 'guide' ? Guide : Assistant);
  const ctx = () => ({ dest: dest(), state, level: levelOf(state.points), nextLevel: nextLevel(state.points) });

  const SIDEBAR = {
    assistant: {
      title: 'Что знает ассистент',
      items: [
        'Лодки и цены по сезону, что входит в чартер',
        'Документы: права, радиолицензия, депозит и страховка',
        'Экипаж, провизия, трансфер из Даламана',
        'Отмены и переносы — сроки и суммы',
        'Ваши очки, бонусы и реферальная программа'
      ]
    },
    guide: {
      title: 'Что знает гид',
      items: [
        `${DESTINATIONS[0].points.length} мест города — с ценами и часами`,
        'В какое время суток куда идти',
        'Сценарии недели: штиль, вечер после гонки, день с детьми',
        'Ваш уровень, очки и уже сделанные чек-ины'
      ]
    }
  };

  function renderSidebar() {
    const s = SIDEBAR[mode];
    $('#gaTitle').textContent = s.title;
    $('#gaList').innerHTML = s.items.map(i => `<li>${i}</li>`).join('');
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
          <span><span class="mc-name">${esc(p.name)}</span><br><span class="mc-sub">${esc(p.price)} · ${esc(p.time)}</span></span>
          <span class="mc-go">на карте →</span>
        </button>`).join('');
      b.append(wrap);
    }
    log.append(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  function chips(list) {
    $('#chatChips').innerHTML = (list || []).map(c => `<button class="chip" type="button">${esc(c)}</button>`).join('');
  }

  function ask(text) {
    if (!text.trim()) return;
    bubble('me', esc(text));
    $('#chatInput').value = '';
    chips([]);
    const log = $('#chatLog');
    const t = document.createElement('div');
    t.className = 'msg bot typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    log.append(t); log.scrollTop = log.scrollHeight;

    setTimeout(() => {
      t.remove();
      const res = engine().answer(text, ctx());
      bubble('bot', res.text, res.cards);
      chips(res.chips);
    }, 420 + Math.random() * 380);
  }

  function resetChat() {
    $('#chatLog').innerHTML = '';
    const w = mode === 'guide' ? Guide.WELCOME(dest()) : Assistant.WELCOME(state);
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

  /* ────────── события ────────── */
  document.addEventListener('click', e => {
    const t = e.target;

    if (t.closest('[data-auth]')) { openAuth(); return; }
    if (t.closest('[data-auth-close]')) { closeAuth(); return; }

    const m = t.closest('[data-mode]');
    if (m) { setMode(m.dataset.mode); return; }

    const f = t.closest('[data-cat]');
    if (f) { filter = f.dataset.cat; renderFilters(); renderList(); renderPins(); return; }

    const poi = t.closest('[data-poi]');
    if (poi) { selectPoi(poi.dataset.poi, true); return; }

    const coll = t.closest('[data-coll]');
    if (coll) { selectPoi(coll.dataset.coll, false); $('#map').scrollIntoView({ behavior: 'smooth' }); return; }

    const ci = t.closest('[data-checkin]');
    if (ci) { checkin(ci.dataset.checkin); return; }

    const ak = t.closest('[data-ask]');
    if (ak) {
      const p = pointById(ak.dataset.ask);
      setMode('guide');
      $('#guide').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => ask(p.name), 350);
      return;
    }

    const reg = t.closest('[data-reg]');
    if (reg) { joinRegatta(reg.dataset.reg); return; }

    const rw = t.closest('[data-reward]');
    if (rw) { claimReward(rw.dataset.reward); return; }

    if (t.closest('[data-close-detail]')) { activePoi = null; renderList(); renderPins(); renderDetail(); return; }

    const sc = t.closest('[data-scroll]');
    if (sc) { $(sc.dataset.scroll).scrollIntoView({ behavior: 'smooth' }); return; }

    if (t.classList.contains('chip')) {
      const q = t.textContent;
      if (/зарегистрироваться/i.test(q)) { openAuth(); return; }
      ask(q);
      return;
    }

    if (t.closest('#burger')) { $('#nav').classList.toggle('open'); return; }
    if (t.closest('#nav a')) { $('#nav').classList.remove('open'); return; }
    if (t.closest('#ptsChip')) { $('#profile').scrollIntoView({ behavior: 'smooth' }); return; }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#authModal').hidden) closeAuth();
  });

  $('#authForm').addEventListener('submit', e => {
    e.preventDefault();
    register($('#authName').value, $('#authEmail').value, $('#authPromo').value);
  });

  $('#searchInput').addEventListener('input', e => {
    query = e.target.value; renderList(); renderPins();
  });

  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); ask($('#chatInput').value); });
  $('#chatReset').addEventListener('click', resetChat);

  $('#pfName').addEventListener('change', e => {
    state.name = e.target.value.trim() || 'Экипаж'; save(); renderProfile();
  });

  $('#refCopy').addEventListener('click', async () => {
    if (!requireAuth('Ссылка появится сразу после регистрации')) return;
    try { await navigator.clipboard.writeText($('#refLink').value); } catch { $('#refLink').select(); }
    toast('Ссылка скопирована — отправьте экипажу');
  });

  $('#refSim').addEventListener('click', () => {
    if (!requireAuth('Приглашать можно из аккаунта')) return;
    if (state.referrals >= 5) { toast('Все пять приглашений уже использованы'); return; }
    state.referrals++;
    const tier = REF_TIERS.find(x => x.n === state.referrals);
    addPoints(BONUS.inviter, `Друг по ссылке (${state.referrals}/5)`);
    if (tier) toast(`Порог ${tier.n}: <b>${esc(tier.title)}</b> открыт`);
    renderProfile();
  });

  $('#resetAll').addEventListener('click', () => {
    if (!confirm('Выйти из аккаунта и стереть очки, чек-ины и бонусы?')) return;
    state = { ...DEFAULT }; save();
    renderAll(); resetChat();
    toast('Аккаунт очищен');
  });

  /* активный пункт меню при скролле */
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

  MapView.render(dest());
  renderAll();
  resetChat();
})();

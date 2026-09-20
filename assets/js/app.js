/* Кильватер — логика приложения: состояние, карта, профиль, очки, чат */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KEY = 'kilvater.v1';

  /* ────────── состояние ────────── */
  const DEFAULT = {
    name: 'Алина Т.', city: 'gocek', points: 0,
    checkins: [], regattas: [], referrals: 0, claimed: [], log: []
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

  const dest = () => DESTINATIONS.find(d => d.id === state.city) || DESTINATIONS[0];
  const pointById = id => DESTINATIONS.flatMap(d => d.points).find(p => p.id === id);
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

  /* ────────── очки и журнал ────────── */
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
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 3200);
  }

  /* ────────── фильтры карты ────────── */
  let filter = 'all';
  let query = '';
  let activePoi = null;

  const visiblePoints = () => dest().points.filter(p => {
    const okCat = filter === 'all' || p.cat === filter;
    const q = query.trim().toLowerCase();
    const okQ = !q || (p.name + ' ' + p.desc + ' ' + p.tags.join(' ')).toLowerCase().includes(q);
    return okCat && okQ;
  });

  /* ────────── города ────────── */
  function renderCities() {
    $('#cityTabs').innerHTML = DESTINATIONS.map(d => `
      <button class="city-tab" role="tab" data-city="${d.id}" style="--accent:${d.accent}"
              aria-selected="${d.id === state.city}">
        <b>${esc(d.city)}</b><span>${esc(d.region)}</span>
      </button>`).join('');

    const d = dest();
    $('#cityMeta').innerHTML = `
      <span>Сезон: <b>${esc(d.season)}</b></span>
      <span>Ветер: <b>${esc(d.wind)}</b></span>
      <span>Вода: <b>${esc(d.water)}</b></span>
      <span>Регата: <b>${esc(d.regatta)}</b></span>
      <span>Точек: <b>${d.points.length}</b></span>`;
    $('#chatCity').textContent = d.city;
    $('#gaCity').textContent = d.city;
    $('#gaPoints').textContent = d.points.length;
    $('#gaSeason').textContent = d.season;
    $('#gaWind').textContent = d.wind;
    $('#gaWater').textContent = d.water;
    $('#gaRegatta').textContent = d.regatta;
    $('#eyebrowCities').textContent = DESTINATIONS.length;
    $('#eyebrowPoints').textContent = DESTINATIONS.reduce((a, x) => a + x.points.length, 0);
    document.documentElement.style.setProperty('--aqua-city', d.accent);
  }

  function renderFilters() {
    $('#filters').innerHTML = CATEGORIES.map(c => `
      <button class="filter" data-cat="${c.id}" aria-pressed="${filter === c.id}">
        ${c.icon} ${esc(c.label)}
      </button>`).join('');
  }

  /* ────────── список точек ────────── */
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
        <span class="poi-ico">${CATEGORIES.find(c => c.id === p.cat).icon}</span>
        <span>
          <span class="poi-name">${esc(p.name)}</span><br>
          <span class="poi-sub">${esc(CAT_META[p.cat].label)} · ${esc(p.price)}</span>
        </span>
        <span class="poi-pts">+${p.pts}</span>
      </button>`).join('');
  }

  /* ────────── пины ────────── */
  function renderPins() {
    const vis = new Set(visiblePoints().map(p => p.id));
    $('#pins').innerHTML = dest().points.map(p => `
      <button class="pin ${vis.has(p.id) ? '' : 'dim'} ${activePoi === p.id ? 'active' : ''} ${state.checkins.includes(p.id) ? 'done' : ''}"
              data-poi="${p.id}" style="left:${p.x}%;top:${p.y}%;${catStyle(p.cat)}" title="${esc(p.name)}">
        <span class="pin-body">
          <span class="pin-dot">${CATEGORIES.find(c => c.id === p.cat).icon}</span>
          <span class="pin-label">${esc(p.name)}</span>
        </span>
        <span class="pin-stem"></span>
      </button>`).join('');

    $('#mapLegend').innerHTML = Object.entries(CAT_META)
      .map(([k, v]) => `<span class="lg"><i style="background:${v.color}"></i>${esc(v.label)}</span>`).join('');
  }

  /* ────────── карточка точки ────────── */
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
          <span class="pd-cat">${CATEGORIES.find(c => c.id === p.cat).icon} ${esc(CAT_META[p.cat].label)}</span>
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
    $('#regGrid').innerHTML = REGATTAS.map(r => {
      const city = DESTINATIONS.find(d => d.id === r.city);
      const joined = state.regattas.includes(r.id);
      return `
        <article class="reg ${joined ? 'joined' : ''}">
          <div class="reg-top">
            <span class="reg-level">${esc(r.level)}</span>
            <span class="reg-date">${esc(r.date)}</span>
          </div>
          <h3>${esc(r.name)}</h3>
          <span class="reg-city">${esc(city.city)} · ${esc(city.region)}</span>
          <div class="reg-rows">
            <span>Флот: ${esc(r.fleet)}</span>
            <span>${esc(r.slots)}</span>
          </div>
          <div class="reg-foot">
            <button class="btn ${joined ? 'btn-ghost' : 'btn-soft'} btn-sm" data-reg="${r.id}" ${joined ? 'disabled' : ''} type="button">
              ${joined ? '✓ Вы в списке' : `Я иду · +${r.pts}`}
            </button>
            <button class="btn btn-link btn-sm" data-regcity="${r.city}" type="button">Город на карте</button>
          </div>
        </article>`;
    }).join('');
  }

  function joinRegatta(id) {
    if (state.regattas.includes(id)) return;
    const r = REGATTAS.find(x => x.id === id);
    state.regattas.push(id);
    addPoints(r.pts, `Заявка на регату: ${r.name}`);
    if (state.city !== r.city) switchCity(r.city);
    renderRegattas(); renderHero();
  }

  /* ────────── hero ────────── */
  function renderHero() {
    const d = dest();
    const r = REGATTAS.find(x => x.city === d.id) || REGATTAS[0];
    $('#hcName').textContent = r.name;
    $('#hcCity').textContent = `${d.city} · ${d.region}`;
    $('#hcWind').textContent = d.wind;
    $('#hcWater').textContent = d.water;
    $('#hcFleet').textContent = r.fleet;
    $('#hcBadge').textContent = r.date.split(' ').slice(0, 3).join(' ');
    const joined = state.regattas.includes(r.id);
    const btn = $('#hcJoin');
    btn.textContent = joined ? '✓ Вы в списке экипажей' : `Я иду · +${r.pts} очков`;
    btn.disabled = joined;
    btn.dataset.reg = r.id;
    $('#statPoints').textContent = DESTINATIONS.reduce((a, x) => a + x.points.length, 0);
    $('#statCheckins').textContent = state.checkins.length;
  }

  /* ────────── профиль ────────── */
  function renderProfile() {
    const lvl = levelOf(state.points);
    const next = nextLevel(state.points);
    $('#ptsChipValue').textContent = state.points.toLocaleString('ru-RU');
    $('#pfPts').textContent = state.points.toLocaleString('ru-RU');
    $('#pfRole').textContent = `${lvl.name} · экипаж «Кильватер»`;
    $('#pfName').value = state.name;
    $('#avatar').textContent = state.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'К';

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
    $('#pfCities').textContent = new Set(
      state.checkins.map(id => DESTINATIONS.find(d => d.points.some(p => p.id === id)).id)
    ).size;

    const slug = (state.name.trim().split(/\s+/)[0] || 'crew').toUpperCase()
      .replace(/[^A-ZА-Я]/g, '') || 'CREW';
    $('#refLink').value = `kilvater.app/r/${translit(slug)}-${(2600 + state.points % 900)}`;
    $('#refDots').innerHTML = Array.from({ length: 5 }, (_, i) => `<i class="${i < state.referrals ? 'on' : ''}"></i>`).join('');
    $('#refHint').textContent = state.referrals >= 5
      ? 'Все пятеро на борту — каюта на переходе ваша.'
      : `${state.referrals} из 5 друзей · на пятом — каюта на переходе Гёчек — Бодрум`;

    $('#rewards').innerHTML = REWARDS.map(r => {
      const claimed = state.claimed.includes(r.id);
      const can = state.points >= r.cost;
      return `
        <div class="reward ${claimed ? 'claimed' : ''}">
          <div>
            <div class="rw-title">${esc(r.title)}</div>
            <div class="rw-sub">${esc(r.sub)}</div>
            ${claimed ? `<div class="rw-code">Промокод: ${esc(r.code)}</div>` : ''}
          </div>
          ${claimed
            ? '<span class="poi-pts">получено</span>'
            : `<button class="btn ${can ? 'btn-soft' : 'btn-ghost'} btn-sm" data-reward="${r.id}" ${can ? '' : 'disabled'} type="button">${can ? 'Забрать' : `${r.cost} очк.`}</button>`}
        </div>`;
    }).join('');

    $('#activityLog').innerHTML = state.log.length
      ? state.log.map(l => `<li>${esc(l.label)} <span>+${l.n} · ${new Date(l.t).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></li>`).join('')
      : '<li class="log-empty">Пока пусто. Сделайте первый чек-ин на карте.</li>';
  }

  function translit(s) {
    const m = { А:'A',Б:'B',В:'V',Г:'G',Д:'D',Е:'E',Ж:'ZH',З:'Z',И:'I',Й:'Y',К:'K',Л:'L',М:'M',Н:'N',О:'O',П:'P',Р:'R',С:'S',Т:'T',У:'U',Ф:'F',Х:'H',Ц:'C',Ч:'CH',Ш:'SH',Щ:'SCH',Ы:'Y',Э:'E',Ю:'YU',Я:'YA',Ь:'',Ъ:'' };
    return [...s].map(c => m[c] ?? c).join('').slice(0, 10);
  }

  function claimReward(id) {
    const r = REWARDS.find(x => x.id === id);
    if (!r || state.claimed.includes(id) || state.points < r.cost) return;
    state.points -= r.cost;
    state.claimed.push(id);
    state.log.unshift({ t: Date.now(), label: `Бонус: ${r.title}`, n: -r.cost });
    save(); renderProfile();
    toast(`Бонус ваш · промокод <b>${esc(r.code)}</b>`);
  }

  /* ────────── чат ────────── */
  function ctx() {
    return { dest: dest(), state, level: levelOf(state.points), nextLevel: nextLevel(state.points) };
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
          <span class="poi-ico">${CATEGORIES.find(c => c.id === p.cat).icon}</span>
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
      const res = Guide.answer(text, ctx());
      bubble('bot', res.text, res.cards);
      chips(res.chips);
    }, 420 + Math.random() * 380);
  }

  function resetChat() {
    $('#chatLog').innerHTML = '';
    const w = Guide.WELCOME(dest());
    bubble('bot', w.text);
    chips(w.chips);
  }

  /* ────────── смена города ────────── */
  function switchCity(id) {
    state.city = id; activePoi = null; query = ''; filter = 'all';
    $('#searchInput').value = '';
    save();
    renderCities(); renderFilters(); MapView.render(dest());
    renderList(); renderPins(); renderDetail();
    renderCollections(); renderHero(); resetChat();
  }

  /* ────────── события ────────── */
  document.addEventListener('click', e => {
    const t = e.target;

    const city = t.closest('[data-city]');
    if (city) { switchCity(city.dataset.city); return; }

    const f = t.closest('[data-cat]');
    if (f) { filter = f.dataset.cat; renderFilters(); renderList(); renderPins(); return; }

    const poi = t.closest('[data-poi]');
    if (poi) { selectPoi(poi.dataset.poi, true); return; }

    const coll = t.closest('[data-coll]');
    if (coll) {
      selectPoi(coll.dataset.coll, false);
      $('#map').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const ci = t.closest('[data-checkin]');
    if (ci) { checkin(ci.dataset.checkin); return; }

    const ak = t.closest('[data-ask]');
    if (ak) {
      const p = pointById(ak.dataset.ask);
      $('#guide').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => ask(p.name), 350);
      return;
    }

    const reg = t.closest('[data-reg]');
    if (reg) { joinRegatta(reg.dataset.reg); return; }

    const rc = t.closest('[data-regcity]');
    if (rc) { switchCity(rc.dataset.regcity); $('#map').scrollIntoView({ behavior: 'smooth' }); return; }

    const rw = t.closest('[data-reward]');
    if (rw) { claimReward(rw.dataset.reward); return; }

    if (t.closest('[data-close-detail]')) { activePoi = null; renderList(); renderPins(); renderDetail(); return; }

    const sc = t.closest('[data-scroll]');
    if (sc) { $(sc.dataset.scroll).scrollIntoView({ behavior: 'smooth' }); return; }

    if (t.classList.contains('chip')) { ask(t.textContent); return; }

    if (t.closest('#burger')) { $('#nav').classList.toggle('open'); return; }
    if (t.closest('#nav a')) { $('#nav').classList.remove('open'); return; }
    if (t.closest('#ptsChip')) { $('#profile').scrollIntoView({ behavior: 'smooth' }); return; }
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
    const v = $('#refLink').value;
    try { await navigator.clipboard.writeText(v); } catch { $('#refLink').select(); }
    toast('Ссылка скопирована — отправьте экипажу');
  });

  $('#refSim').addEventListener('click', () => {
    if (state.referrals >= 5) { toast('Все пять приглашений уже использованы'); return; }
    state.referrals++;
    addPoints(250, `Друг присоединился по ссылке (${state.referrals}/5)`);
    renderProfile();
  });

  $('#resetAll').addEventListener('click', () => {
    if (!confirm('Сбросить очки, чек-ины и бонусы?')) return;
    state = { ...DEFAULT }; save();
    switchCity(state.city); renderProfile();
    toast('Прогресс сброшен');
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
  renderCities();
  renderFilters();
  MapView.render(dest());
  renderList();
  renderPins();
  renderCollections();
  renderRegattas();
  renderHero();
  renderProfile();
  resetChat();
})();

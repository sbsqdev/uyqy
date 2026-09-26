/* Charter Key — state, account, offer sections, map, two assistants */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const money = n => '$' + n.toLocaleString('en-US');
  const KEY = 'charterkey.v2';

  const DEFAULT = {
    registered: false, name: '', email: '', refCode: '', invitedBy: '',
    points: 0, checkins: [], events: [], referrals: 0, claimed: [], courses: [],
    club: false, tier: '', log: []
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
    } catch { return { ...DEFAULT }; }
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

  const D = DESTINATION;
  const pointById = id => D.points.find(p => p.id === id);
  const levelOf = pts => [...LEVELS].reverse().find(l => pts >= l.from) || LEVELS[0];
  const nextLevel = pts => LEVELS.find(l => l.from > pts) || null;
  const displayName = () => state.registered ? state.name : 'Guest';
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
  function addPoints(n, label) {
    state.points += n;
    state.log.unshift({ t: Date.now(), label, n });
    state.log = state.log.slice(0, 40);
    save();
    renderProfile();
    const chip = $('#ptsChip');
    chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
    toast(`<b>+${n}</b> points · ${esc(label)}`);
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

  function requireAuth(reason) {
    if (state.registered) return true;
    openAuth(reason);
    return false;
  }

  function register(name, email, promo) {
    const err = $('#authError');
    if (name.trim().length < 2) { err.textContent = 'Add your name — it goes on the crew list.'; err.hidden = false; return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim())) { err.textContent = 'Check the email: it should look like name@domain.com'; err.hidden = false; return; }

    state.registered = true;
    state.name = name.trim();
    state.email = email.trim();
    state.invitedBy = promo.trim().toUpperCase();
    state.refCode = makeCode(state.name);
    save();
    closeAuth();

    addPoints(BONUS.signup, 'Signed up');
    if (state.invitedBy) addPoints(BONUS.invitee, `Friend's code ${state.invitedBy}`);
    renderAll();
    $('#magnet').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function makeCode(name) {
    const first = (name.trim().split(/\s+/)[0] || 'CREW').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10) || 'CREW';
    return `CK-${first}-${1000 + Math.floor(Math.random() * 8999)}`;
  }

  /* ────────── berth tiers ────────── */
  function renderTiers() {
    $('#tierGrid').innerHTML = TIERS.map(t => `
      <article class="tier ${t.featured ? 'featured' : ''} ${state.tier === t.id ? 'chosen' : ''}">
        ${t.featured ? '<span class="tier-flag">Most crews pick this</span>' : ''}
        <span class="tier-tag">${esc(t.tag)}</span>
        <h3>${esc(t.name)}</h3>
        <div class="tier-price"><b>${money(t.price)}</b><span>${esc(t.unit)}</span></div>
        <p class="tier-line">${esc(t.line)}</p>
        <ul class="tier-list">${t.includes.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        <div class="tier-foot">
          <button class="btn ${t.featured ? 'btn-primary' : 'btn-ghost'} btn-sm" data-tier="${t.id}" type="button">
            ${state.tier === t.id ? '✓ Your tier' : 'Choose ' + esc(t.name)}
          </button>
          <span class="tier-spots ${t.spots <= 2 ? 'low' : ''}">${t.spots} left this season</span>
        </div>
      </article>`).join('');
  }

  function chooseTier(id) {
    state.tier = id;
    save();
    renderTiers();
    const t = TIERS.find(x => x.id === id);
    toast(`<b>${esc(t.name)}</b> selected · pick your event below`);
    $('#calendar').scrollIntoView({ behavior: 'smooth' });
  }

  /* ────────── lead magnet ────────── */
  function renderMagnet() {
    $('#magnetTitle').textContent = LEAD_MAGNET.title;
    $('#magnetSub').textContent = LEAD_MAGNET.sub;
    $('#magnetList').innerHTML = LEAD_MAGNET.items
      .map(i => `<li>${state.registered ? '✓ ' : ''}${esc(i)}</li>`).join('');
    $('#magnet').classList.toggle('unlocked', state.registered);
    $('#magnetBtn').textContent = state.registered ? 'Open the checklist' : 'Unlock it free';
    $('#magnetBtn').toggleAttribute('data-auth', !state.registered);
    $('#magnetNote').textContent = state.registered
      ? 'Unlocked on your account. We email the printable version before your first event.'
      : 'Free with an account. No card, no call, one minute.';
  }

  /* ────────── quiz ────────── */
  let quizStep = 0;
  let quizScore = { rail: 0, trim: 0, helm: 0 };

  function renderQuiz() {
    const box = $('#quizBox');

    if (quizStep >= QUIZ.length) {
      const best = Object.entries(quizScore).sort((a, b) => b[1] - a[1])[0][0];
      const t = TIERS.find(x => x.id === best);
      box.innerHTML = `
        <div class="quiz-result">
          <span class="sec-kicker">Your match</span>
          <h3>${esc(t.name)} — ${money(t.price)} <span class="muted">${esc(t.unit)}</span></h3>
          <p class="quiz-why">${esc(t.line)}</p>
          <ul class="tier-list">${t.includes.slice(0, 4).map(i => `<li>${esc(i)}</li>`).join('')}</ul>
          <div class="quiz-actions">
            <button class="btn btn-primary" data-tier="${t.id}" type="button">Take the ${esc(t.name)} berth</button>
            <button class="btn btn-ghost btn-sm" data-quiz-restart type="button">Start again</button>
            <button class="btn btn-link btn-sm" data-ask-tier="${t.id}" type="button">Ask the assistant why</button>
          </div>
        </div>`;
      return;
    }

    const q = QUIZ[quizStep];
    box.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-progress">
          ${QUIZ.map((_, i) => `<i class="${i <= quizStep ? 'on' : ''}"></i>`).join('')}
          <span>Question ${quizStep + 1} of ${QUIZ.length}</span>
        </div>
        <h3>${esc(q.q)}</h3>
        <div class="quiz-options">
          ${q.options.map(o => `<button class="quiz-option" data-answer="${o.id}" type="button">${esc(o.label)}</button>`).join('')}
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
    $('#regGrid').innerHTML = REGATTAS.map(r => {
      const held = state.events.includes(r.id);
      const left = spotsLeft(r);
      return `
        <article class="reg ${held ? 'joined' : ''}">
          <div class="reg-top">
            <span class="reg-level">${esc(r.level)}</span>
            <span class="reg-date">${esc(r.date)}</span>
          </div>
          <h3>${esc(r.name)}</h3>
          <p class="reg-line">${esc(r.line)}</p>
          <div class="reg-rows">
            <span>Fleet: ${esc(r.fleet)}</span>
            <span class="${left <= 2 ? 'scarce' : ''}">${left} berth${left === 1 ? '' : 's'} left</span>
          </div>
          <div class="reg-foot">
            <button class="btn ${held ? 'btn-ghost' : 'btn-soft'} btn-sm" data-event="${r.id}" ${held ? 'disabled' : ''} type="button">
              ${held ? '✓ Berth held' : `Hold a berth · +${r.pts}`}
            </button>
            <button class="btn btn-link btn-sm" data-scroll="#berths" type="button">Tiers</button>
          </div>
        </article>`;
    }).join('');
  }

  function holdEvent(id) {
    if (!requireAuth('Berths are held on an account — it takes a minute')) return;
    if (state.events.includes(id)) return;
    const r = REGATTAS.find(x => x.id === id);
    state.events.push(id);
    addPoints(r.pts, `Berth held: ${r.name}`);
    renderEvents(); renderHero();
  }

  /* ────────── academy + club ────────── */
  function renderAcademy() {
    $('#courseGrid').innerHTML = COURSES.map(c => {
      const owned = state.courses.includes(c.id);
      const canPoints = state.registered && state.points >= c.pts;
      return `
        <article class="course ${owned ? 'owned' : ''}">
          <div class="course-top">
            <span class="course-level">${esc(c.level)}</span>
            <span class="course-time">${esc(c.time)}</span>
          </div>
          <h3>${esc(c.title)}</h3>
          <p class="course-line">${esc(c.line)}</p>
          <div class="course-foot">
            ${owned
              ? '<span class="course-owned">✓ In your library</span>'
              : `<button class="btn btn-soft btn-sm" data-buy="${c.id}" type="button">Buy ${money(c.price)}</button>
                 <button class="btn ${canPoints ? 'btn-ghost' : 'btn-ghost'} btn-sm" data-course-points="${c.id}" type="button">or ${c.pts} points</button>`}
          </div>
        </article>`;
    }).join('');

    $('#clubCard').innerHTML = `
      <span class="sec-kicker">Membership</span>
      <h3>The Club</h3>
      <div class="tier-price"><b>${money(CLUB.price)}</b><span>${esc(CLUB.unit)}</span></div>
      <p class="muted">or ${money(CLUB.annual)} a year</p>
      <ul class="tier-list">${CLUB.perks.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      <button class="btn ${state.club ? 'btn-ghost' : 'btn-primary'} btn-sm" id="clubBtn" ${state.club ? 'disabled' : ''} type="button">
        ${state.club ? '✓ Member' : 'Join the club'}
      </button>`;
  }

  function buyCourse(id, withPoints) {
    if (!requireAuth('Courses are attached to an account')) return;
    const c = COURSES.find(x => x.id === id);
    if (!c || state.courses.includes(id)) return;

    if (withPoints) {
      if (state.points < c.pts) {
        toast(`<b>${c.pts - state.points}</b> points short of “${esc(c.title)}”`);
        return;
      }
      state.points -= c.pts;
      state.log.unshift({ t: Date.now(), label: `Course: ${c.title}`, n: -c.pts });
      state.courses.push(id);
      save(); renderAcademy(); renderProfile();
      toast(`<b>${esc(c.title)}</b> unlocked with points`);
      return;
    }
    state.courses.push(id);
    save(); renderAcademy(); renderProfile();
    toast(`Demo checkout: <b>${esc(c.title)}</b> added to your library`);
  }

  function joinClub() {
    if (!requireAuth('Membership sits on an account')) return;
    if (state.club) return;
    state.club = true;
    save(); renderAcademy();
    toast('Demo checkout: you are in the Club — 48h early access is on');
  }

  /* ────────── town map ────────── */
  let filter = 'all', query = '', activePoi = null;

  const visiblePoints = () => D.points.filter(p => {
    const okCat = filter === 'all' || p.cat === filter;
    const q = query.trim().toLowerCase();
    const hay = (p.name + ' ' + p.desc + ' ' + p.tags.join(' ')).toLowerCase();
    return okCat && (!q || hay.includes(q));
  });

  function renderCity() {
    $('#cityMeta').innerHTML = `
      <span>Season: <b>${esc(D.season)}</b></span>
      <span>Wind: <b>${esc(D.wind)}</b></span>
      <span>Water: <b>${esc(D.water)}</b></span>
      <span>Airport: <b>${esc(D.airport)}</b></span>
      <span>Places: <b>${D.points.length}</b></span>`;
  }

  function renderFilters() {
    $('#filters').innerHTML = CATEGORIES.map(c => `
      <button class="filter" data-cat="${c.id}" aria-pressed="${filter === c.id}">${c.icon} ${esc(c.label)}</button>`).join('');
  }

  function renderList() {
    const list = visiblePoints();
    const box = $('#poiList');
    if (!list.length) {
      box.innerHTML = `<div class="poi-empty">Nothing found. Try “fish”, “sunset”, “SUP” or clear the filter.</div>`;
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
    $('#pins').innerHTML = D.points.map(p => `
      <button class="pin ${vis.has(p.id) ? '' : 'dim'} ${activePoi === p.id ? 'active' : ''} ${state.checkins.includes(p.id) ? 'done' : ''}"
              data-poi="${p.id}" style="left:${p.x}%;top:${p.y}%;${catStyle(p.cat)}" title="${esc(p.name)}">
        <span class="pin-body">
          <span class="pin-dot">${catIcon(p.cat)}</span>
          <span class="pin-label">${esc(p.name)}</span>
        </span>
        <span class="pin-stem"></span>
      </button>`).join('');

    $('#mapLegend').innerHTML = Object.values(CAT_META)
      .map(v => `<span class="lg"><i style="background:${v.color}"></i>${esc(v.label)}</span>`).join('');
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
        <button class="btn btn-link btn-sm" data-close-detail type="button">Close ✕</button>
      </div>
      <div class="pd-meta">
        <div><span>Price</span><b>${esc(p.price)}</b></div>
        <div><span>Hours</span><b>${esc(p.time)}</b></div>
        <div><span>Check-in</span><b>+${p.pts} points</b></div>
      </div>
      <div class="pd-tip"><b>Tip:</b> ${esc(p.tip)}</div>
      <div class="pd-actions">
        <button class="btn ${done ? 'btn-ghost' : 'btn-primary'}" data-checkin="${p.id}" ${done ? 'disabled' : ''} type="button">
          ${done ? '✓ Checked in' : `Check in · +${p.pts} points`}
        </button>
        <button class="btn btn-ghost btn-sm" data-ask="${p.id}" type="button">Ask the guide about this place</button>
      </div>
      <div class="pd-tags">${p.tags.slice(0, 7).map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>`;
  }

  function selectPoi(id, scroll) {
    activePoi = id;
    renderList(); renderPins(); renderDetail();
    if (scroll) $('#poiDetail').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function checkin(id) {
    if (!requireAuth('Check-ins are saved to an account')) return;
    if (state.checkins.includes(id)) return;
    const p = pointById(id);
    state.checkins.push(id);
    addPoints(p.pts, `Check-in: ${p.name}`);
    renderList(); renderPins(); renderDetail(); renderHero();
  }

  function renderCollections() {
    $('#collGrid').innerHTML = COLLECTIONS.map(c => {
      const items = D.points
        .map(p => ({ p, s: p.tags.filter(x => c.match.includes(x)).length }))
        .filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, 3).map(r => r.p);
      if (!items.length) return '';
      return `
        <button class="coll" data-coll="${items[0].id}" type="button">
          <h3>${esc(c.title)}</h3>
          <span class="coll-sub">${esc(c.sub)}</span>
          <ul class="coll-items">${items.map(p => `<li>${esc(p.name)}<span class="muted"> · ${esc(p.price)}</span></li>`).join('')}</ul>
          <div class="coll-more">Show on the map →</div>
        </button>`;
    }).join('');
  }

  /* ────────── FAQ ────────── */
  function renderFaq() {
    $('#faqList').innerHTML = FAQ.map((f, i) => `
      <details class="faq-item" ${i === 0 ? 'open' : ''}>
        <summary>${esc(f.q)}</summary>
        <p>${esc(f.a)}</p>
      </details>`).join('');
  }

  /* ────────── hero ────────── */
  function renderHero() {
    const r = REGATTAS.find(x => !state.events.includes(x.id)) || REGATTAS[0];
    $('#hcName').textContent = r.name;
    $('#hcBadge').textContent = r.date;
    $('#hcLine').textContent = r.line;
    $('#hcFleet').textContent = r.fleet;
    $('#hcWind').textContent = D.wind;
    $('#hcSpots').textContent = `${spotsLeft(r)} of ${r.spots}`;
    const held = state.events.includes(r.id);
    const btn = $('#hcJoin');
    btn.textContent = held ? '✓ Berth held' : `Hold a berth · +${r.pts} points`;
    btn.disabled = held;
    btn.dataset.event = r.id;
    $('#statEvents').textContent = REGATTAS.length;
    $('#statCheckins').textContent = state.checkins.length;
    $('#eyebrowSpots').textContent = REGATTAS.reduce((a, x) => a + spotsLeft(x), 0);
  }

  /* ────────── account ────────── */
  function renderProfile() {
    const reg = state.registered;
    const lvl = levelOf(state.points);
    const next = nextLevel(state.points);

    $('#authGate').hidden = reg;
    $('#authBtn').textContent = reg ? state.name.split(' ')[0] : 'Sign up';
    $('#ptsChipValue').textContent = state.points.toLocaleString('en-US');
    $('#pfPts').textContent = state.points.toLocaleString('en-US');
    $('#pfRole').textContent = reg ? `${lvl.name} · ${state.email}` : 'Guest · no account';
    $('#pfName').value = displayName();
    $('#pfName').disabled = !reg;
    $('#avatar').textContent = reg
      ? (state.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CK')
      : '?';

    $('#lvCur').textContent = lvl.name;
    $('#lvNext').textContent = next ? `${next.from - state.points} points to ${next.name}` : 'top level reached';
    const base = lvl.from, top = next ? next.from : lvl.from + 1;
    $('#lvFill').style.width = `${next ? Math.min(100, ((state.points - base) / (top - base)) * 100) : 100}%`;
    $('#lvTicks').innerHTML = LEVELS.map(l => `<span class="${state.points >= l.from ? 'on' : ''}">${esc(l.name)}</span>`).join('');

    $('#pfCheckins').textContent = state.checkins.length;
    $('#pfEvents').textContent = state.events.length;
    $('#pfRefs').textContent = state.referrals;
    $('#pfRewards').textContent = state.claimed.length + state.courses.length;

    $('#refLink').value = reg ? `charterkey.com/r/${state.refCode}` : 'Appears once you sign up';
    $('#refCopy').disabled = !reg;
    $('#refSim').disabled = !reg;
    $('#refDots').innerHTML = Array.from({ length: 5 }, (_, i) => `<i class="${i < state.referrals ? 'on' : ''}"></i>`).join('');
    $('#refHint').textContent = state.referrals >= 5
      ? 'All five aboard — your next race week is on us.'
      : `${state.referrals} of 5 invited`;
    $('#refTiers').innerHTML = REF_TIERS.map(x => `
      <li class="${state.referrals >= x.n ? 'on' : ''}">
        <b>${x.n} ${x.n === 1 ? 'friend' : 'friends'}</b>
        <span>${esc(x.title)} — ${esc(x.sub)}</span>
      </li>`).join('');

    $('#rewards').innerHTML = REWARDS.map(r => {
      const claimed = state.claimed.includes(r.id);
      const can = reg && state.points >= r.cost;
      return `
        <div class="reward ${claimed ? 'claimed' : ''}">
          <div>
            <div class="rw-title">${esc(r.title)}</div>
            <div class="rw-sub">${esc(r.sub)}</div>
            ${claimed ? `<div class="rw-code">Code: ${esc(r.code)}</div>` : ''}
          </div>
          ${claimed
            ? '<span class="poi-pts">claimed</span>'
            : `<button class="btn ${can ? 'btn-soft' : 'btn-ghost'} btn-sm" data-reward="${r.id}" type="button">${can ? 'Claim' : r.cost + ' pts'}</button>`}
        </div>`;
    }).join('');

    $('#activityLog').innerHTML = state.log.length
      ? state.log.map(l => `<li>${esc(l.label)} <span>${l.n > 0 ? '+' : ''}${l.n} · ${new Date(l.t).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></li>`).join('')
      : '<li class="log-empty">Empty so far. Create an account and hold your first berth.</li>';
  }

  function claimReward(id) {
    if (!requireAuth('Rewards are tied to an account')) return;
    const r = REWARDS.find(x => x.id === id);
    if (!r || state.claimed.includes(id)) return;
    if (state.points < r.cost) {
      toast(`<b>${r.cost - state.points}</b> points short of “${esc(r.title)}”`);
      return;
    }
    state.points -= r.cost;
    state.claimed.push(id);
    state.log.unshift({ t: Date.now(), label: `Reward: ${r.title}`, n: -r.cost });
    save(); renderProfile();
    toast(`Reward claimed · code <b>${esc(r.code)}</b>`);
  }

  /* ────────── two assistants ────────── */
  let mode = 'assistant';
  const engine = () => (mode === 'guide' ? Guide : Assistant);
  const ctx = () => ({ state: { ...state, name: displayName() }, level: levelOf(state.points), nextLevel: nextLevel(state.points) });

  const SIDEBAR = {
    assistant: {
      title: 'What the crew assistant knows',
      items: [
        'The three tiers and what each one actually includes',
        'Experience needed, and when we will say no',
        'Category 3 safety inventory aboard',
        'Flights into Dalaman, transfers, money and packing',
        'Cancellations, the Academy, the Club, your points'
      ]
    },
    guide: {
      title: 'What the town guide knows',
      items: [
        '12 places in Göcek — with prices and hours',
        'Which place suits which time of day',
        'Lay days, evenings after racing, days with the shore crew',
        'Your level, points and check-ins so far'
      ]
    }
  };

  function renderSidebar() {
    const s = SIDEBAR[mode];
    $('#gaTitle').textContent = s.title;
    $('#gaList').innerHTML = s.items.map(i => `<li>${esc(i)}</li>`).join('');
  }

  function renderBoat() {
    $('#boatType').textContent = BOAT.type;
    $('#boatSpecs').innerHTML = BOAT.specs
      .map(s => `<div class="ga-row"><span>${esc(s.label)}</span><b>${esc(s.value)}</b></div>`).join('');
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
          <span class="mc-go">on the map →</span>
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
    const w = mode === 'guide' ? Guide.WELCOME() : Assistant.WELCOME(ctx().state);
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

  /* ────────── events ────────── */
  document.addEventListener('click', e => {
    const el = e.target;

    if (el.closest('[data-auth]')) { openAuth(); return; }
    if (el.closest('[data-auth-close]')) { closeAuth(); return; }

    const m = el.closest('[data-mode]');
    if (m) { setMode(m.dataset.mode); return; }

    const tier = el.closest('[data-tier]');
    if (tier) { chooseTier(tier.dataset.tier); return; }

    const ans = el.closest('[data-answer]');
    if (ans) { answerQuiz(ans.dataset.answer); return; }
    if (el.closest('[data-quiz-restart]')) { restartQuiz(); return; }

    const askTier = el.closest('[data-ask-tier]');
    if (askTier) {
      const t = TIERS.find(x => x.id === askTier.dataset.askTier);
      setMode('assistant');
      $('#ai').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => ask(`Tell me about the ${t.name} tier`), 350);
      return;
    }

    const ev = el.closest('[data-event]');
    if (ev) { holdEvent(ev.dataset.event); return; }

    const buy = el.closest('[data-buy]');
    if (buy) { buyCourse(buy.dataset.buy, false); return; }

    const cp = el.closest('[data-course-points]');
    if (cp) { buyCourse(cp.dataset.coursePoints, true); return; }

    if (el.closest('#clubBtn')) { joinClub(); return; }

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
      setTimeout(() => ask(p.name), 350);
      return;
    }

    const rw = el.closest('[data-reward]');
    if (rw) { claimReward(rw.dataset.reward); return; }

    if (el.closest('[data-close-detail]')) { activePoi = null; renderList(); renderPins(); renderDetail(); return; }

    const sc = el.closest('[data-scroll]');
    if (sc) { $(sc.dataset.scroll).scrollIntoView({ behavior: 'smooth' }); return; }

    if (el.classList.contains('chip')) {
      const q = el.textContent;
      if (/^sign up$/i.test(q.trim())) { openAuth(); return; }
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
    if (!requireAuth('Your link appears as soon as you sign up')) return;
    try { await navigator.clipboard.writeText($('#refLink').value); } catch { $('#refLink').select(); }
    toast('Link copied — send it to your crew');
  });

  $('#refSim').addEventListener('click', () => {
    if (!requireAuth('Invitations are sent from your account')) return;
    if (state.referrals >= 5) { toast('All five invitations are already used'); return; }
    state.referrals++;
    const tier = REF_TIERS.find(x => x.n === state.referrals);
    addPoints(BONUS.inviter, `Friend joined (${state.referrals}/5)`);
    if (tier) toast(`Tier ${tier.n}: <b>${esc(tier.title)}</b> unlocked`);
    renderProfile();
  });

  $('#resetAll').addEventListener('click', () => {
    if (!confirm('Sign out and erase points, check-ins, berths and rewards?')) return;
    state = { ...DEFAULT }; save();
    restartQuiz(); renderAll(); resetChat();
    toast('Account cleared');
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

  MapView.render(D);
  renderQuiz();
  renderAll();
  resetChat();
})();

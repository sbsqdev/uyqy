/* Charter Key — ИИ-гид по городу (ru/en).
   Офлайн-движок: разбор намерения + ранжирование мест по тегам. */

const Guide = (() => {
  const L = (ru, en) => (Lang.get() === 'en' ? en : ru);
  const norm = s => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9\s-]/gi, ' ');
  const stem = w => w.replace(/(ами|ями|ого|ему|ой|ей|ая|ые|ий|ых|ам|ом|ах|ing|ed|s)$/u, '');
  const words = q => norm(q).split(/\s+/).filter(w => w.length > 2).map(stem);
  const has = (q, list) => list.some(k => norm(q).includes(k));

  const allTags = p => [...p.tags, ...(p.tagsEn || [])];

  /* поиск по свободному запросу */
  function rank(dest, terms) {
    return dest.points
      .map(p => {
        let s = 0;
        const hay = norm(T(p.name) + ' ' + T(p.desc) + ' ' + T(p.tip));
        allTags(p).forEach(tag => {
          const tn = stem(norm(tag));
          terms.forEach(w => {
            if (tn === w) s += 6;
            else if (tn.startsWith(w) || w.startsWith(tn)) s += 4;
          });
        });
        terms.forEach(w => { if (hay.includes(w)) s += 2; });
        return { p, s };
      })
      .filter(r => r.s > 0).sort((a, b) => b.s - a.s).map(r => r.p);
  }

  /* выборка по внутренним (русским) тегам — они не зависят от языка интерфейса */
  const byTags = (dest, tags, cat, n = 3) => dest.points
    .map(p => {
      let s = p.tags.filter(x => tags.includes(x)).length * 5;
      if (cat && p.cat === cat) s += 4;
      return { p, s };
    })
    .filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, n).map(r => r.p);

  const pick = (dest, cat, tags = [], n = 3) => dest.points
    .filter(p => p.cat === cat)
    .map(p => ({ p, s: p.tags.filter(x => tags.includes(x)).length }))
    .sort((a, b) => b.s - a.s).slice(0, n).map(r => r.p);

  const line = p => `${T(p.name)} — ${T(p.price)}, ${T(p.time)}`;
  const first = p => T(p.desc).split('.')[0];

  const INTENTS = [
    {
      id: 'greet',
      test: q => has(q, ['привет', 'здравствуй', 'добрый день', 'hello', 'hi ', 'hey']),
      run: (q, c) => ({
        text: L(
          `Привет! Я гид по городу <b>${T(c.dest.city)}</b>. Знаю здесь ${c.dest.points.length} мест — от завтрака перед выходом до бара, где флот сидит после перехода.\n\nСпрашивайте конкретно: «что делать, если нет ветра», «где поесть рыбу», «куда идти на закат».`,
          `Hello! I am the city guide for <b>${T(c.dest.city)}</b>. I know ${c.dest.points.length} places here — from breakfast before you cast off to the bar where the fleet lands after a passage.\n\nAsk me directly: “what to do when there is no wind”, “where to eat fish”, “where to watch the sunset”.`),
        chips: L(['Собери план на день', 'Где поесть рыбу?', 'Ветра нет — что делать?'],
                 ['Plan my day', 'Where to eat fish?', 'No wind — what now?'])
      })
    },
    {
      id: 'plan',
      test: q => has(q, ['план', 'маршрут', 'на день', 'расписани', 'спланируй', 'программ', 'plan', 'itinerary', 'schedule'])
        && !has(q, ['вечер', 'ночь', 'evening', 'night']),
      run: (q, c) => {
        const d = c.dest;
        const bf = pick(d, 'eat', ['завтрак', 'кофе'], 1)[0];
        const morning = byTags(d, ['утро', 'штиль', 'sup'], 'do', 1)[0] || pick(d, 'do')[0];
        const day = pick(d, 'see', ['вид', 'природа', 'история'], 1)[0];
        const dinner = pick(d, 'eat', ['ужин', 'рыба'], 1)[0];
        const night = pick(d, 'night', [], 1)[0];
        const list = [bf, morning, day, dinner, night].filter(Boolean);
        const pts = list.reduce((a, p) => a + p.pts, 0);
        return {
          text: L(
            `Один день в городе <b>${T(d.city)}</b> — так, чтобы к вечеру не жалеть:\n\n`
            + `<b>07:30</b> · ${bf ? line(bf) : '—'}\n<b>09:00</b> · ${morning ? T(morning.name) : '—'} — пока вода стоит\n<b>13:00</b> · ${day ? T(day.name) : '—'}\n<b>19:30</b> · ${dinner ? line(dinner) : '—'}\n<b>22:00</b> · ${night ? T(night.name) : '—'}\n\n`
            + `Пройдёте маршрут целиком — <b>+${pts} очков</b> в аккаунт.`,
            `One day in <b>${T(d.city)}</b>, arranged so you do not regret the evening:\n\n`
            + `<b>07:30</b> · ${bf ? line(bf) : '—'}\n<b>09:00</b> · ${morning ? T(morning.name) : '—'} — while the water is still flat\n<b>13:00</b> · ${day ? T(day.name) : '—'}\n<b>19:30</b> · ${dinner ? line(dinner) : '—'}\n<b>22:00</b> · ${night ? T(night.name) : '—'}\n\n`
            + `Do the whole route and that is <b>+${pts} points</b> in your account.`),
          cards: list,
          chips: L(['А если будет дождь?', 'Где взять SUP?', 'Ужин подороже'],
                   ['What if it rains?', 'Where to rent a SUP?', 'A pricier dinner'])
        };
      }
    },
    {
      id: 'calm',
      test: q => has(q, ['штил', 'без ветра', 'нет ветра', 'отменили', 'свободный день', 'занят', 'скучно',
                         'no wind', 'calm', 'cancelled', 'bored', 'free day']),
      run: (q, c) => {
        const list = byTags(c.dest, ['штиль', 'природа', 'активность', 'sup'], null, 3);
        return {
          text: L(
            `День без ветра — лучший день, чтобы увидеть город, а не только воду. Три варианта на разную энергию:\n\n`
            + list.map((p, i) => `<b>${i + 1}.</b> ${T(p.name)} — ${first(p)}. ${T(p.price)}, ${T(p.time)}.`).join('\n'),
            `A windless day is the best day to see the town rather than the water. Three options, different energy levels:\n\n`
            + list.map((p, i) => `<b>${i + 1}.</b> ${T(p.name)} — ${first(p)}. ${T(p.price)}, ${T(p.time)}.`).join('\n')),
          cards: list,
          chips: L(['Что-то одно, но сильное', 'Куда с детьми?', 'Где поесть рядом?'],
                   ['One strong thing only', 'Where to go with kids?', 'Somewhere to eat nearby?'])
        };
      }
    },
    {
      id: 'eat',
      test: q => has(q, ['поесть', 'еда', 'ресторан', 'кафе', 'ужин', 'обед', 'завтрак', 'кухн', 'рыб', 'голод',
                         'eat', 'food', 'restaurant', 'dinner', 'lunch', 'breakfast', 'fish', 'hungry', 'cafe']),
      run: (q, c) => {
        const morning = has(q, ['завтрак', 'утр', 'кофе', 'breakfast', 'morning', 'coffee']);
        const cheap = has(q, ['дешев', 'недорог', 'бюджет', 'cheap', 'budget', 'affordable']);
        const tags = morning ? ['завтрак', 'кофе', 'утро'] : ['ужин', 'рыба', 'вечер', 'после гонки'];
        if (cheap) tags.push('дёшево');
        const list = pick(c.dest, 'eat', tags, 3);
        const body = list.map(p => `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}.\n  <i>${T(p.tip)}</i>`).join('\n');
        return {
          text: L(
            (morning ? `Завтрак в городе <b>${T(c.dest.city)}</b> — с расчётом на ранний выход:\n\n`
                     : `Где есть в городе <b>${T(c.dest.city)}</b>${cheap ? ', без перерасхода' : ''}:\n\n`) + body,
            (morning ? `Breakfast in <b>${T(c.dest.city)}</b>, timed for an early departure:\n\n`
                     : `Where to eat in <b>${T(c.dest.city)}</b>${cheap ? ', without overspending' : ''}:\n\n`) + body),
          cards: list,
          chips: L(['Где ужинают экипажи?', 'Завтрак до выхода', 'Что-то местное'],
                   ['Where do crews have dinner?', 'Breakfast before casting off', 'Something local'])
        };
      }
    },
    {
      id: 'see',
      test: q => has(q, ['увидет', 'посмотрет', 'закат', 'вид', 'фото', 'достопримечат', 'красив', 'панорам',
                         'see', 'sunset', 'view', 'photo', 'sights', 'scenery', 'beautiful']),
      run: (q, c) => {
        const list = byTags(c.dest, ['закат', 'вид', 'фото', 'история', 'природа'], 'see', 3);
        const body = list.map(p => `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}.`).join('\n');
        return {
          text: L(`Что здесь стоит увидеть:\n\n${body}\n\nСовет по первой точке: <i>${list[0] ? T(list[0].tip) : ''}</i>`,
                  `What is worth seeing here:\n\n${body}\n\nTip for the first one: <i>${list[0] ? T(list[0].tip) : ''}</i>`),
          cards: list,
          chips: L(['Куда на закат?', 'Что-то на весь день', 'А где поесть рядом?'],
                   ['Where for the sunset?', 'Something for a whole day', 'Anywhere to eat nearby?'])
        };
      }
    },
    {
      id: 'night',
      test: q => has(q, ['ночь', 'вечер', 'бар', 'тусов', 'вечеринк', 'выпит', 'музык', 'после гонк', 'после перехода',
                         'night', 'evening', 'bar', 'party', 'drink', 'music', 'after racing']),
      run: (q, c) => {
        const list = [...pick(c.dest, 'night', [], 2), ...pick(c.dest, 'eat', ['ужин', 'после гонки'], 1)];
        const body = list.map(p => `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}.`).join('\n');
        return {
          text: L(`Вечер после перехода в городе <b>${T(c.dest.city)}</b>:\n\n${body}\n\nПравило места: ${list[0] ? T(list[0].tip) : ''}`,
                  `The evening after a passage in <b>${T(c.dest.city)}</b>:\n\n${body}\n\nHouse rule: ${list[0] ? T(list[0].tip) : ''}`),
          cards: list,
          chips: L(['Где тише?', 'Восстановиться после перехода', 'Завтрак на утро'],
                   ['Somewhere quieter?', 'Recover after the passage', 'Breakfast for tomorrow'])
        };
      }
    },
    {
      id: 'active',
      test: q => has(q, ['поделат', 'занят', 'актив', 'спорт', 'sup', 'сап', 'снорклинг', 'нырят', 'адреналин',
                         'do ', 'activity', 'sport', 'snorkel', 'swim', 'paddle', 'dive']),
      run: (q, c) => {
        const list = pick(c.dest, 'do', ['активность', 'вода', 'sup', 'спорт'], 3);
        const body = list.map(p => L(
          `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}. <b>+${p.pts}</b> очков за чек-ин.`,
          `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}. <b>+${p.pts}</b> points for a check-in.`)).join('\n');
        return {
          text: L(`Чем занять себя и экипаж:\n\n${body}`, `Things to do with the crew:\n\n${body}`),
          cards: list,
          chips: L(['Что-то спокойное', 'Куда с детьми?', 'Собери план на день'],
                   ['Something calmer', 'Where with kids?', 'Plan my day'])
        };
      }
    },
    {
      id: 'family',
      test: q => has(q, ['дет', 'семь', 'жена', 'муж', 'родител', 'команда поддержк',
                         'kids', 'children', 'family', 'wife', 'husband', 'parents', 'non-sailor']),
      run: (q, c) => {
        const list = byTags(c.dest, ['дети', 'команда', 'вода', 'снорклинг'], null, 3);
        const body = list.map(p => `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}.`).join('\n');
        return {
          text: L(`Для тех, кто приехал с вами, но не рвётся на воду:\n\n${body}\n\nЛогика простая: утро — вода и снорклинг, после полудня поднимается мелтеми и берег становится комфортнее.`,
                  `For the people who came with you but are not desperate to be on the water:\n\n${body}\n\nThe logic is simple: mornings for water and snorkelling, and once the meltemi fills in after midday the shore is the nicer place to be.`),
          cards: list,
          chips: L(['Где поесть с детьми?', 'Что-то на полдня', 'Куда на закат?'],
                   ['Where to eat with kids?', 'Something for half a day', 'Where for the sunset?'])
        };
      }
    },
    {
      id: 'recover',
      test: q => has(q, ['спин', 'восстанов', 'устал', 'массаж', 'спа', 'хамам', 'расслаб', 'болит',
                         'back', 'recover', 'tired', 'massage', 'spa', 'hammam', 'relax', 'sore']),
      run: (q, c) => {
        const list = byTags(c.dest, ['восстановление', 'спа', 'расслабиться'], null, 2);
        const body = list.map(p => `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}.\n  <i>${T(p.tip)}</i>`).join('\n');
        return {
          text: L(`После трёх дней на руле тело просит не ещё одного ужина, а вот этого:\n\n${body}`,
                  `After three days on the helm your body needs this more than another dinner:\n\n${body}`),
          cards: list,
          chips: L(['Тихий ужин после', 'Что утром?', 'План на завтра'],
                   ['A quiet dinner after', 'What about the morning?', 'Plan for tomorrow'])
        };
      }
    },
    {
      id: 'repair',
      test: q => has(q, ['ремонт', 'парус', 'такелаж', 'почини', 'сервис', 'сломал', 'порвал', 'швартов', 'марин',
                         'repair', 'sail', 'rigging', 'broken', 'torn', 'berth', 'marina', 'service']),
      run: (q, c) => {
        const list = pick(c.dest, 'yacht', [], 3);
        const body = list.map(p => `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}.\n  <i>${T(p.tip)}</i>`).join('\n');
        return {
          text: L(`Яхтенная инфраструктура города <b>${T(c.dest.city)}</b>:\n\n${body}`,
                  `Yacht infrastructure in <b>${T(c.dest.city)}</b>:\n\n${body}`),
          cards: list,
          chips: L(['Где стоянка?', 'Сколько стоит швартовка?', 'План на день'],
                   ['Where is the berth?', 'How much is mooring?', 'Plan my day'])
        };
      }
    },
    {
      id: 'weather',
      test: q => has(q, ['ветр', 'ветер', 'погод', 'температур', 'сезон', 'когда ехат', 'прогноз',
                         'wind', 'weather', 'temperature', 'season', 'forecast', 'when to come']),
      run: (q, c) => {
        const d = c.dest;
        return {
          text: L(`<b>${T(d.city)}</b>, ${T(d.region)}\n\n• Сезон: ${T(d.season)}\n• Ветер: ${T(d.wind)}\n• Вода: ${T(d.water)}\n• Главная регата: ${T(d.regatta)}\n\n${T(d.blurb)}\n\nЕсли ветра нет — спросите «что делать в штиль», подберу берег.`,
                  `<b>${T(d.city)}</b>, ${T(d.region)}\n\n• Season: ${T(d.season)}\n• Wind: ${T(d.wind)}\n• Water: ${T(d.water)}\n• Main regatta: ${T(d.regatta)}\n\n${T(d.blurb)}\n\nIf the wind dies, ask “what to do in flat calm” and I will find you something ashore.`),
          chips: L(['Ветра нет — что делать?', 'Собери план на день', 'Календарь регат'],
                   ['No wind — what now?', 'Plan my day', 'Regatta calendar'])
        };
      }
    },
    {
      id: 'regatta',
      test: q => has(q, ['регат', 'гонк', 'календар', 'соревнован', 'race', 'regatta', 'calendar']),
      run: (q, c) => ({
        text: L(
          `Регаты в городе <b>${T(c.dest.city)}</b>:\n\n`
          + REGATTAS.map(r => `• <b>${T(r.name)}</b> — ${T(r.date)}. ${T(r.fleet)}. ${T(r.slots)}. За участие <b>+${r.pts}</b> очков.`).join('\n')
          + `\n\nОтметиться можно в разделе «Регаты». Про лодку на эти даты спросите ассистента Charter Key на соседней вкладке.`,
          `Regattas in <b>${T(c.dest.city)}</b>:\n\n`
          + REGATTAS.map(r => `• <b>${T(r.name)}</b> — ${T(r.date)}. ${T(r.fleet)}. ${T(r.slots)}. Entry is worth <b>+${r.pts}</b> points.`).join('\n')
          + `\n\nYou can put your name down in the Regattas section. For a boat on those dates ask the Charter Key assistant on the next tab.`),
        chips: L(['Сколько у меня очков?', 'Где швартоваться?', 'Собери план на день'],
                 ['How many points do I have?', 'Where to berth?', 'Plan my day'])
      })
    },
    {
      id: 'points-how',
      test: q => has(q, ['как набрат', 'быстрее очк', 'больше очк', 'where to earn', 'earn points', 'more points']),
      run: (q, c) => {
        const top = [...c.dest.points].sort((a, b) => b.pts - a.pts).slice(0, 3);
        const body = top.map(p => `  – ${T(p.name)}: <b>+${p.pts}</b>`).join('\n');
        return {
          text: L(`Порядок такой:\n\n• Участие в регате — от 300 до 500 очков.\n• Друг по вашей ссылке — ${BONUS.inviter} очков вам и ${BONUS.invitee} ему.\n• Чек-ины: самые «дорогие» места —\n${body}`,
                  `It works like this:\n\n• A regatta entry — 300 to 500 points.\n• A friend through your link — ${BONUS.inviter} points for you, ${BONUS.invitee} for them.\n• Check-ins: the highest-scoring places are —\n${body}`),
          cards: top,
          chips: L(['Сколько у меня очков?', 'Календарь регат', 'Собери план на день'],
                   ['How many points do I have?', 'Regatta calendar', 'Plan my day'])
        };
      }
    },
    {
      id: 'profile',
      test: q => has(q, ['очк', 'балл', 'бонус', 'уровен', 'профил', 'награ', 'реферал', 'пригласит', 'друз',
                         'points', 'reward', 'level', 'account', 'referral', 'invite', 'friend']),
      run: (q, c) => {
        const s = c.state;
        if (!s.registered) {
          return {
            text: L(`Очки живут в аккаунте, а вы сейчас смотрите как гость.\n\nРегистрация занимает минуту и сразу даёт <b>${BONUS.signup} очков</b>. После неё чек-ины на карте начнут копиться, а бонусы — открываться.`,
                    `Points live in an account, and you are browsing as a guest.\n\nSigning up takes a minute and gives you <b>${BONUS.signup} points</b> right away. After that check-ins start adding up and rewards start unlocking.`),
            chips: L(['Зарегистрироваться', 'Собери план на день', 'Где поесть рыбу?'],
                     ['Sign up', 'Plan my day', 'Where to eat fish?'])
          };
        }
        const next = c.nextLevel;
        const afford = REWARDS.filter(r => r.cost <= s.points && !s.claimed.includes(r.id));
        return {
          text: L(
            `<b>${s.name}</b> · уровень «${T(c.level.name)}»\n\n• Очки: <b>${s.points}</b>\n• Чек-ины: ${s.checkins.length}\n• Регаты: ${s.regattas.length}\n• Друзья по ссылке: ${s.referrals} из 5\n`
            + (next ? `\nДо уровня «${T(next.name)}» осталось <b>${next.from - s.points}</b> очков.\n` : `\nВы на максимальном уровне.\n`)
            + (afford.length ? `\nУже можно забрать: ${afford.map(r => `<b>${T(r.title)}</b> (${r.cost})`).join(', ')}.` : ''),
            `<b>${s.name}</b> · level “${T(c.level.name)}”\n\n• Points: <b>${s.points}</b>\n• Check-ins: ${s.checkins.length}\n• Regattas: ${s.regattas.length}\n• Friends invited: ${s.referrals} of 5\n`
            + (next ? `\n<b>${next.from - s.points}</b> points to “${T(next.name)}”.\n` : `\nYou are at the top level.\n`)
            + (afford.length ? `\nReady to claim: ${afford.map(r => `<b>${T(r.title)}</b> (${r.cost})`).join(', ')}.` : '')),
          chips: L(['Где набрать очки быстрее?', 'Календарь регат', 'Собери план на день'],
                   ['How to earn points faster?', 'Regatta calendar', 'Plan my day'])
        };
      }
    },
    {
      id: 'price',
      test: q => has(q, ['сколько стоит', 'цен', 'бюджет', 'дорого', 'дешев', 'how much', 'price', 'cost', 'budget']),
      run: (q, c) => {
        const d = c.dest;
        const free = d.points.filter(p => /бесплатно|free/i.test(T(p.price))).slice(0, 3);
        const eat = pick(d, 'eat', ['ужин'], 1)[0];
        const yacht = pick(d, 'yacht', [], 1)[0];
        return {
          text: L(
            `Ориентиры по деньгам в городе <b>${T(d.city)}</b>:\n\n`
            + (yacht ? `• Стоянка / сервис: ${T(yacht.price)}\n` : '')
            + (eat ? `• Ужин на человека: ${T(eat.price)}\n` : '')
            + `• Бесплатно: ${free.length ? free.map(p => T(p.name)).join(', ') : 'смотровые точки и прогулки по берегу'}\n\n`
            + `Совет: дорогое впечатление берите одно за поездку, остальное собирайте из бесплатных точек.`,
            `Money guide for <b>${T(d.city)}</b>:\n\n`
            + (yacht ? `• Berth / service: ${T(yacht.price)}\n` : '')
            + (eat ? `• Dinner per person: ${T(eat.price)}\n` : '')
            + `• Free: ${free.length ? free.map(p => T(p.name)).join(', ') : 'viewpoints and shoreline walks'}\n\n`
            + `Advice: take one expensive experience per trip and build the rest out of the free spots.`),
          cards: free,
          chips: L(['Что бесплатно?', 'Недорогая еда', 'Одно большое впечатление'],
                   ['What is free?', 'Cheap eats', 'One big moment'])
        };
      }
    },
    {
      id: 'city',
      test: q => has(q, ['город', 'что за место', 'расскажи о', 'about the town', 'about the city', 'what is göcek', 'what is gocek']),
      run: (q, c) => ({
        text: L(`<b>${T(c.dest.city)}</b>, ${T(c.dest.region)}.\n\n${T(c.dest.blurb)}\n\n• Сезон: ${T(c.dest.season)}\n• Ветер: ${T(c.dest.wind)}\n• Вода: ${T(c.dest.water)}\n\nНа карте ${c.dest.points.length} мест: еда, виды, занятия, вечер и яхт-сервис.`,
                `<b>${T(c.dest.city)}</b>, ${T(c.dest.region)}.\n\n${T(c.dest.blurb)}\n\n• Season: ${T(c.dest.season)}\n• Wind: ${T(c.dest.wind)}\n• Water: ${T(c.dest.water)}\n\nThe map holds ${c.dest.points.length} places: food, sights, activities, evenings and yacht services.`),
        chips: L(['Собери план на день', 'Где поесть рыбу?', 'Куда на закат?'],
                 ['Plan my day', 'Where to eat fish?', 'Where for the sunset?'])
      })
    }
  ];

  function answer(query, c) {
    const q = norm(query);
    for (const it of INTENTS) if (it.test(q)) return it.run(q, c);

    const found = rank(c.dest, words(query)).slice(0, 3);
    if (found.length) {
      const body = found.map(p => `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}.`).join('\n');
      return {
        text: L(`Вот что нашёл по запросу в городе <b>${T(c.dest.city)}</b>:\n\n${body}`,
                `Here is what matches in <b>${T(c.dest.city)}</b>:\n\n${body}`),
        cards: found,
        chips: L(['Собери план на день', 'Где поесть?', 'Ветра нет — что делать?'],
                 ['Plan my day', 'Where to eat?', 'No wind — what now?'])
      };
    }
    return {
      text: L(`Не нашёл точного совпадения. Я знаю ${c.dest.points.length} мест города, цены, часы и время суток, когда туда идти.\n\nПопробуйте: «где поесть рыбу», «что делать в штиль», «куда идти на закат», «где починить парус».`,
              `No exact match. I know ${c.dest.points.length} places in town — prices, hours and the right time of day for each.\n\nTry: “where to eat fish”, “what to do in flat calm”, “where to watch the sunset”, “where to fix a sail”.`),
      chips: L(['Собери план на день', 'Ветра нет — что делать?', 'Сколько у меня очков?'],
               ['Plan my day', 'No wind — what now?', 'How many points do I have?'])
    };
  }

  const WELCOME = dest => ({
    text: L(`Я гид по городу <b>${T(dest.city)}</b>. ${T(dest.blurb)}\n\nЗнаю здесь ${dest.points.length} мест, цены, часы работы и то, в какое время туда идти. Спрашивайте как местного.`,
            `I am the city guide for <b>${T(dest.city)}</b>. ${T(dest.blurb)}\n\nI know ${dest.points.length} places here — prices, opening hours and the right time of day for each. Ask me like you would ask a local.`),
    chips: L(['Собери план на день', 'Где поесть рыбу?', 'Ветра нет — что делать?', 'Сколько у меня очков?'],
             ['Plan my day', 'Where to eat fish?', 'No wind — what now?', 'How many points do I have?'])
  });

  return { answer, WELCOME };
})();

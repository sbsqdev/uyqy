/* Charter Key — town guide (en/ru), venue-aware. Offline engine: intent + tag ranking. */

const Guide = (() => {
  const L = (en, ru) => (Lang.get() === 'ru' ? ru : en);
  const norm = s => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9\s-]/gi, ' ');
  const stem = w => w.replace(/(ing|ed|ами|ями|ого|ому|ой|ей|ая|ые|ий|ых|ам|ом|ах|s)$/u, '');
  const words = q => norm(q).split(/\s+/).filter(w => w.length > 2).map(stem);
  const has = (q, list) => list.some(k => norm(q).includes(k));

  const tagsOf = p => [...p.tags, ...(p.tagsRu || [])];

  function rank(d, terms) {
    return d.points
      .map(p => {
        let s = 0;
        const hay = norm(T(p.name) + ' ' + T(p.desc) + ' ' + T(p.tip));
        tagsOf(p).forEach(tag => {
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

  /* выборки идут по английским тегам — они внутренние ключи */
  const byTags = (d, tags, cat, n = 3) => d.points
    .map(p => {
      let s = p.tags.filter(x => tags.includes(x)).length * 5;
      if (cat && p.cat === cat) s += 4;
      return { p, s };
    })
    .filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, n).map(r => r.p);

  const pick = (d, cat, tags = [], n = 3) => d.points
    .filter(p => p.cat === cat)
    .map(p => ({ p, s: p.tags.filter(x => tags.includes(x)).length }))
    .sort((a, b) => b.s - a.s).slice(0, n).map(r => r.p);

  const line = p => `${T(p.name)} — ${T(p.price)}, ${T(p.time)}`;
  const first = p => T(p.desc).split('.')[0];
  const bullet = list => list.map(p => `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}.`).join('\n');

  const INTENTS = [
    {
      id: 'greet',
      test: q => has(q, ['hello', 'hi ', 'hey', 'привет', 'здравствуй', 'добрый']),
      run: (q, c) => ({
        text: L(`Hello. I am the town guide for <b>${T(c.dest.city)}</b> — ${c.dest.points.length} places, with prices, hours and the right time of day for each.\n\nAsk the way you would ask a local: “where to eat after racing”, “what to do on a lay day”, “sunset spot”.`,
                `Привет. Я гид по городу <b>${T(c.dest.city)}</b> — ${c.dest.points.length} мест с ценами, часами и временем суток, когда туда идти.\n\nСпрашивайте как местного: «где поесть после гонки», «что делать в день без гонок», «куда на закат».`),
        chips: L(['Plan my lay day', 'Where to eat?', 'Sunset spot?'],
                 ['Собери план на день', 'Где поесть?', 'Куда на закат?'])
      })
    },
    {
      id: 'plan',
      test: q => has(q, ['plan', 'itinerary', 'schedule', 'lay day', 'day off', 'free day',
                         'план', 'маршрут', 'на день', 'расписани', 'спланируй'])
        && !has(q, ['evening', 'night', 'вечер', 'ночь']),
      run: (q, c) => {
        const d = c.dest;
        const bf = pick(d, 'eat', ['breakfast', 'coffee'], 1)[0];
        const morning = byTags(d, ['morning', 'calm', 'activity'], 'do', 1)[0];
        const day = pick(d, 'see', ['view', 'nature', 'history'], 1)[0];
        const dinner = pick(d, 'eat', ['dinner', 'fish'], 1)[0];
        const night = pick(d, 'night', [], 1)[0];
        const list = [bf, morning, day, dinner, night].filter(Boolean);
        const pts = list.reduce((a, p) => a + p.pts, 0);
        const rows = `<b>07:30</b> · ${bf ? line(bf) : '—'}\n<b>09:00</b> · ${morning ? T(morning.name) : '—'}\n<b>13:00</b> · ${day ? T(day.name) : '—'}\n<b>19:30</b> · ${dinner ? line(dinner) : '—'}\n<b>22:00</b> · ${night ? T(night.name) : '—'}`;
        return {
          text: L(`A lay day in <b>${T(d.city)}</b>, arranged so you do not waste it:\n\n${rows}\n\nDo the whole route and that is <b>+${pts} points</b> on your account.`,
                  `День без гонок в городе <b>${T(d.city)}</b> — так, чтобы не жалеть:\n\n${rows}\n\nПройдёте маршрут целиком — <b>+${pts} очков</b> в аккаунт.`),
          cards: list,
          chips: L(['What if it rains?', 'Somewhere quieter', 'Where to eat?'],
                   ['А если дождь?', 'Где потише?', 'Где поесть?'])
        };
      }
    },
    {
      id: 'calm',
      test: q => has(q, ['no wind', 'calm', 'abandoned', 'cancelled', 'bored', 'nothing to do',
                         'штил', 'без ветра', 'нет ветра', 'отменили', 'скучно', 'занят']),
      run: (q, c) => {
        const list = byTags(c.dest, ['lay day', 'calm', 'nature', 'activity', 'view'], null, 3);
        return {
          text: L(`No racing is the best excuse to see the place instead of the water. Three options, different energy levels:\n\n`,
                  `День без гонок — лучший повод увидеть город, а не только воду. Три варианта на разную энергию:\n\n`)
            + list.map((p, i) => `<b>${i + 1}.</b> ${T(p.name)} — ${first(p)}. ${T(p.price)}, ${T(p.time)}.`).join('\n'),
          cards: list,
          chips: L(['One strong thing only', 'With kids?', 'Somewhere to eat nearby'],
                   ['Что-то одно, но сильное', 'Куда с детьми?', 'Где поесть рядом?'])
        };
      }
    },
    {
      id: 'eat',
      test: q => has(q, ['eat', 'food', 'restaurant', 'dinner', 'lunch', 'breakfast', 'fish', 'hungry', 'cafe', 'coffee',
                         'поесть', 'еда', 'ресторан', 'кафе', 'ужин', 'обед', 'завтрак', 'рыб', 'кофе', 'голод']),
      run: (q, c) => {
        const morning = has(q, ['breakfast', 'morning', 'coffee', 'завтрак', 'утр', 'кофе']);
        const cheap = has(q, ['cheap', 'budget', 'дешев', 'недорог', 'бюджет']);
        const tags = morning ? ['breakfast', 'coffee', 'morning'] : ['dinner', 'fish', 'evening', 'after racing'];
        if (cheap) tags.push('cheap');
        const list = pick(c.dest, 'eat', tags, 3);
        const body = list.map(p => `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}.\n  <i>${T(p.tip)}</i>`).join('\n');
        return {
          text: L((morning ? `Breakfast in <b>${T(c.dest.city)}</b>, timed for the briefing:\n\n` : `Where to eat in <b>${T(c.dest.city)}</b>${cheap ? ', without overspending' : ''}:\n\n`) + body,
                  (morning ? `Завтрак в городе <b>${T(c.dest.city)}</b>, с расчётом на брифинг:\n\n` : `Где есть в городе <b>${T(c.dest.city)}</b>${cheap ? ', без перерасхода' : ''}:\n\n`) + body),
          cards: list,
          chips: L(['Where does the fleet eat?', 'Breakfast before racing', 'Something local'],
                   ['Где ужинают экипажи?', 'Завтрак перед гонкой', 'Что-то местное'])
        };
      }
    },
    {
      id: 'see',
      test: q => has(q, ['see', 'sunset', 'view', 'photo', 'sights', 'walk',
                         'увидет', 'посмотрет', 'закат', 'вид', 'фото', 'достопримечат', 'прогул']),
      run: (q, c) => {
        const list = byTags(c.dest, ['sunset', 'view', 'photo', 'history', 'nature'], 'see', 3);
        return {
          text: L(`Worth seeing here:\n\n${bullet(list)}\n\nTip for the first one: <i>${list[0] ? T(list[0].tip) : ''}</i>`,
                  `Что здесь стоит увидеть:\n\n${bullet(list)}\n\nСовет по первой точке: <i>${list[0] ? T(list[0].tip) : ''}</i>`),
          cards: list,
          chips: L(['Where for the sunset?', 'Something for a whole day', 'Anywhere to eat nearby'],
                   ['Куда на закат?', 'Что-то на весь день', 'Где поесть рядом?'])
        };
      }
    },
    {
      id: 'night',
      test: q => has(q, ['night', 'evening', 'bar', 'party', 'drink', 'music', 'after racing',
                         'ночь', 'вечер', 'бар', 'вечеринк', 'выпит', 'музык', 'после гонк']),
      run: (q, c) => {
        const list = [...pick(c.dest, 'night', [], 2), ...pick(c.dest, 'eat', ['dinner', 'after racing'], 1)];
        return {
          text: L(`The evening after racing in <b>${T(c.dest.city)}</b>:\n\n${bullet(list)}\n\nHouse rule: ${list[0] ? T(list[0].tip) : ''}`,
                  `Вечер после гонки в городе <b>${T(c.dest.city)}</b>:\n\n${bullet(list)}\n\nПравило места: ${list[0] ? T(list[0].tip) : ''}`),
          cards: list,
          chips: L(['Somewhere quieter', 'Breakfast for tomorrow', 'Plan my lay day'],
                   ['Где потише?', 'Завтрак на утро', 'Собери план на день'])
        };
      }
    },
    {
      id: 'active',
      test: q => has(q, ['do ', 'activity', 'sport', 'snorkel', 'swim', 'paddle', 'kayak', 'run',
                         'поделат', 'занят', 'актив', 'спорт', 'снорклинг', 'купат', 'плыт']),
      run: (q, c) => {
        const list = pick(c.dest, 'do', ['activity', 'water', 'crew', 'morning'], 3);
        const body = list.map(p => L(
          `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}. <b>+${p.pts}</b> points for a check-in.`,
          `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}. <b>+${p.pts}</b> очков за чек-ин.`)).join('\n');
        return {
          text: L(`Things to do with the crew:\n\n${body}`, `Чем занять себя и экипаж:\n\n${body}`),
          cards: list,
          chips: L(['Something calmer', 'With kids?', 'Plan my lay day'],
                   ['Что-то поспокойнее', 'Куда с детьми?', 'Собери план на день'])
        };
      }
    },
    {
      id: 'family',
      test: q => has(q, ['kids', 'children', 'family', 'partner', 'parents', 'non-sailor', 'shore crew',
                         'дет', 'семь', 'родител', 'команда поддержк']),
      run: (q, c) => {
        const list = byTags(c.dest, ['kids', 'crew', 'water', 'snorkelling', 'walk'], null, 3);
        return {
          text: L(`For the people who came with you but are not racing:\n\n${bullet(list)}\n\nThe logic is simple: mornings on the water, afternoons ashore once the breeze fills in.`,
                  `Для тех, кто приехал с вами, но не гоняется:\n\n${bullet(list)}\n\nЛогика простая: утро на воде, после полудня — берег, когда наполняет ветер.`),
          cards: list,
          chips: L(['Where to eat with kids?', 'Something for half a day', 'Where for the sunset?'],
                   ['Где поесть с детьми?', 'Что-то на полдня', 'Куда на закат?'])
        };
      }
    },
    {
      id: 'repair',
      test: q => has(q, ['repair', 'sail', 'rigging', 'broken', 'torn', 'berth', 'marina', 'service', 'laundry', 'shower',
                         'ремонт', 'парус', 'такелаж', 'сломал', 'порвал', 'швартов', 'марин', 'прачечн', 'душ']),
      run: (q, c) => {
        const list = pick(c.dest, 'yacht', [], 3);
        const body = list.map(p => `• <b>${T(p.name)}</b> — ${first(p)}. ${T(p.price)}, ${T(p.time)}.\n  <i>${T(p.tip)}</i>`).join('\n');
        return {
          text: L(`Yacht services in <b>${T(c.dest.city)}</b>:\n\n${body}`,
                  `Яхтенная инфраструктура города <b>${T(c.dest.city)}</b>:\n\n${body}`),
          cards: list,
          chips: L(['Where is the marina?', 'How much is a berth?', 'Plan my lay day'],
                   ['Где марина?', 'Сколько стоит стоянка?', 'Собери план на день'])
        };
      }
    },
    {
      id: 'weather',
      test: q => has(q, ['wind', 'weather', 'temperature', 'season', 'forecast', 'when to come', 'cold', 'hot',
                         'ветр', 'ветер', 'погод', 'температур', 'сезон', 'холодн', 'жарк']),
      run: (q, c) => {
        const d = c.dest;
        return {
          text: L(`<b>${T(d.city)}</b>, ${T(d.region)}\n\n• Season: ${T(d.season)}\n• Wind: ${T(d.wind)}\n• Water: ${T(d.water)}\n• Airport: ${T(d.airport)}\n\n${T(d.blurb)}`,
                  `<b>${T(d.city)}</b>, ${T(d.region)}\n\n• Сезон: ${T(d.season)}\n• Ветер: ${T(d.wind)}\n• Вода: ${T(d.water)}\n• Аэропорт: ${T(d.airport)}\n\n${T(d.blurb)}`),
          chips: L(['Plan my lay day', 'Where to eat?', 'Sunset spot?'],
                   ['Собери план на день', 'Где поесть?', 'Куда на закат?'])
        };
      }
    },
    {
      id: 'price',
      test: q => has(q, ['how much', 'price', 'cost', 'budget', 'expensive', 'cheap',
                         'сколько стоит', 'цен', 'бюджет', 'дорого', 'дешев']),
      run: (q, c) => {
        const d = c.dest;
        const free = d.points.filter(p => /free|бесплатно/i.test(T(p.price))).slice(0, 3);
        const eat = pick(d, 'eat', ['dinner'], 1)[0];
        const yacht = pick(d, 'yacht', [], 1)[0];
        const rows = (yacht ? `• ${L('Berth / service', 'Стоянка / сервис')}: ${T(yacht.price)}\n` : '')
          + (eat ? `• ${L('Dinner per person', 'Ужин на человека')}: ${T(eat.price)}\n` : '')
          + `• ${L('Free', 'Бесплатно')}: ${free.length ? free.map(p => T(p.name)).join(', ') : L('viewpoints and shoreline walks', 'смотровые точки и прогулки по берегу')}`;
        return {
          text: L(`Money ashore in <b>${T(d.city)}</b>:\n\n${rows}\n\nBudget $250–400 for a week ashore. For what the berth itself covers, ask the crew assistant.`,
                  `Деньги на берегу в городе <b>${T(d.city)}</b>:\n\n${rows}\n\nНа неделю на берегу закладывайте $250–400. Что входит в само место — спросите ассистента экипажа.`),
          cards: free,
          chips: L(['What is free?', 'Cheap eats', 'One big moment'],
                   ['Что бесплатно?', 'Недорогая еда', 'Одно большое впечатление'])
        };
      }
    },
    {
      id: 'account',
      test: q => has(q, ['point', 'reward', 'level', 'account', 'referral', 'check-in', 'checkin',
                         'очк', 'балл', 'награ', 'уровен', 'аккаунт', 'реферал', 'чек-ин']),
      run: (q, c) => {
        if (!c.state.registered) {
          return {
            text: L(`Points live on an account, and you are browsing as a guest.\n\nSigning up takes a minute and gives you <b>${BONUS.signup} points</b> plus the prep checklist. After that your check-ins here start adding up.`,
                    `Очки живут в аккаунте, а вы смотрите как гость.\n\nРегистрация занимает минуту и сразу даёт <b>${BONUS.signup} очков</b> и чек-лист подготовки. После неё чек-ины начнут копиться.`),
            chips: L(['Sign up', 'Plan my lay day', 'Where to eat?'],
                     ['Зарегистрироваться', 'Собери план на день', 'Где поесть?'])
          };
        }
        const top = [...c.dest.points].sort((a, b) => b.pts - a.pts).slice(0, 3);
        const rows = top.map(p => `  – ${T(p.name)}: <b>+${p.pts}</b>`).join('\n');
        return {
          text: L(`<b>${c.state.name}</b> · ${T(c.level.name)}, <b>${c.state.points}</b> points, ${c.state.checkins.length} check-ins ashore.\n\nThe highest-scoring places here:\n${rows}`,
                  `<b>${c.state.name}</b> · ${T(c.level.name)}, <b>${c.state.points}</b> очков, чек-инов: ${c.state.checkins.length}.\n\nСамые «дорогие» места здесь:\n${rows}`),
          cards: top,
          chips: L(['Plan my lay day', 'What can I spend points on?', 'Sunset spot?'],
                   ['Собери план на день', 'На что потратить очки?', 'Куда на закат?'])
        };
      }
    }
  ];

  function answer(query, c) {
    const q = norm(query);
    for (const it of INTENTS) if (it.test(q)) return it.run(q, c);

    const found = rank(c.dest, words(query)).slice(0, 3);
    if (found.length) {
      return {
        text: L(`Here is what matches in <b>${T(c.dest.city)}</b>:\n\n${bullet(found)}`,
                `Вот что нашёл в городе <b>${T(c.dest.city)}</b>:\n\n${bullet(found)}`),
        cards: found,
        chips: L(['Plan my lay day', 'Where to eat?', 'No racing — what now?'],
                 ['Собери план на день', 'Где поесть?', 'Гонок нет — что делать?'])
      };
    }
    return {
      text: L(`No exact match ashore. I know ${c.dest.points.length} places in ${T(c.dest.city)} — prices, hours and the right time of day for each.\n\nTry: “where to eat”, “lay day plan”, “sunset spot”, “where to fix a sail”. Anything about the boat, tiers or getting here is the crew assistant.`,
              `Точного совпадения нет. Я знаю ${c.dest.points.length} мест в городе ${T(c.dest.city)} — цены, часы и время суток для каждого.\n\nПопробуйте: «где поесть», «план на день без гонок», «куда на закат», «где починить парус». Всё про лодку, тарифы и дорогу — к ассистенту экипажа.`),
      chips: L(['Plan my lay day', 'Where to eat?', 'Sunset spot?'],
               ['Собери план на день', 'Где поесть?', 'Куда на закат?'])
    };
  }

  const WELCOME = dest => ({
    text: L(`I am the town guide for <b>${T(dest.city)}</b>. ${T(dest.blurb)}\n\nI know ${dest.points.length} places here — prices, opening hours and the right time of day for each.`,
            `Я гид по городу <b>${T(dest.city)}</b>. ${T(dest.blurb)}\n\nЗнаю здесь ${dest.points.length} мест: цены, часы работы и время суток, когда туда идти.`),
    chips: L(['Plan my lay day', 'Where to eat?', 'Sunset spot?', 'How many points do I have?'],
             ['Собери план на день', 'Где поесть?', 'Куда на закат?', 'Сколько у меня очков?'])
  });

  return { answer, WELCOME };
})();

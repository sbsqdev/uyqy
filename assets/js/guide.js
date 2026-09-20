/* Кильватер — ИИ-гид по городу.
   Работает офлайн: разбор намерения + ранжирование точек по тегам.
   Чтобы подключить настоящую модель, см. README (раздел «Живой ИИ-гид»). */

const Guide = (() => {
  const norm = s => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9\s-]/gi, ' ');
  const stem = w => w.replace(/(ами|ями|ого|ему|ой|ей|ая|ые|ий|ых|ам|ом|ах|у|ю|ы|и|е|а|о)$/u, '');
  const words = q => norm(q).split(/\s+/).filter(w => w.length > 2).map(stem);

  const has = (q, list) => list.some(k => norm(q).includes(k));

  /* ── ранжирование точек ── */
  function rank(dest, terms, catFilter) {
    return dest.points
      .map(p => {
        let s = 0;
        const hay = norm(p.name + ' ' + p.desc + ' ' + p.tip);
        p.tags.forEach(t => {
          const tn = stem(norm(t));
          terms.forEach(w => {
            if (tn === w) s += 6;
            else if (tn.startsWith(w) || w.startsWith(tn)) s += 4;
          });
        });
        terms.forEach(w => { if (hay.includes(w)) s += 2; });
        if (catFilter && p.cat === catFilter) s += 3;
        return { p, s };
      })
      .filter(r => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map(r => r.p);
  }

  const byTags = (dest, tags, cat, n = 3) => {
    const set = tags.map(t => stem(norm(t)));
    return dest.points
      .map(p => {
        let s = p.tags.filter(t => set.includes(stem(norm(t)))).length * 5;
        if (cat && p.cat === cat) s += 4;
        return { p, s };
      })
      .filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, n).map(r => r.p);
  };

  const pick = (dest, cat, tags = [], n = 3) => {
    const set = tags.map(t => stem(norm(t)));
    return dest.points.filter(p => p.cat === cat)
      .map(p => ({ p, s: p.tags.filter(t => set.includes(stem(norm(t)))).length }))
      .sort((a, b) => b.s - a.s).slice(0, n).map(r => r.p);
  };

  const money = p => `${p.name} — ${p.price}, ${p.time}`;

  /* ── сценарии ── */
  const INTENTS = [
    {
      id: 'greet',
      test: q => has(q, ['привет', 'здравствуй', 'добрый день', 'хай', 'салют']),
      run: (q, c) => ({
        text: `Привет! Я гид по городу <b>${c.dest.city}</b>. Знаю здесь ${c.dest.points.length} точек — от завтрака перед брифингом до бара, где флот сидит после награждения.\n\nСпросите конкретно: «что делать, если отменили гонку», «где поесть рыбу», «куда идти на закат», «сколько у меня очков».`,
        chips: ['Собери план на день', 'Где поесть рыбу?', 'Гонку отменили — что делать?']
      })
    },
    {
      id: 'plan',
      test: q => has(q, ['план', 'маршрут', 'на день', 'расписани', 'что делать сегодня', 'спланируй', 'программ'])
        && !has(q, ['вечер', 'ночь', 'после гонк']),
      run: (q, c) => {
        const d = c.dest;
        const morning = byTags(d, ['утро', 'штиль', 'sup'], 'do', 1)[0] || pick(d, 'do')[0];
        const bf = pick(d, 'eat', ['завтрак', 'кофе'], 1)[0];
        const day = pick(d, 'see', ['вид', 'природа', 'история'], 1)[0];
        const dinner = pick(d, 'eat', ['ужин', 'рыба'], 1)[0];
        const night = pick(d, 'night', [], 1)[0];
        const list = [bf, morning, day, dinner, night].filter(Boolean);
        const pts = list.reduce((a, p) => a + p.pts, 0);
        return {
          text: `Один день в городе <b>${d.city}</b> — так, чтобы к вечеру не жалеть:\n\n`
            + `<b>07:30</b> · ${bf ? money(bf) : '—'}\n`
            + `<b>09:00</b> · ${morning ? morning.name : '—'} — пока вода стоит\n`
            + `<b>13:00</b> · ${day ? day.name : '—'}\n`
            + `<b>19:30</b> · ${dinner ? money(dinner) : '—'}\n`
            + `<b>22:00</b> · ${night ? night.name : '—'}\n\n`
            + `Пройдёте маршрут целиком — <b>+${pts} очков</b> в профиль.`,
          cards: list, chips: ['А если будет дождь?', 'Где взять SUP?', 'Ужин подороже']
        };
      }
    },
    {
      id: 'calm',
      test: q => has(q, ['штил', 'без ветра', 'отменили', 'не будет гонк', 'нет ветра', 'свободный день', 'занят', 'скучно']),
      run: (q, c) => {
        const list = byTags(c.dest, ['штиль', 'день без ветра', 'природа', 'активность', 'sup'], null, 3);
        return {
          text: `День без ветра — лучший день, чтобы увидеть город, а не только воду. Вот три варианта на разную энергию:\n\n`
            + list.map((p, i) => `<b>${i + 1}.</b> ${p.name} — ${p.desc.split('.')[0]}. ${p.price}, ${p.time}.`).join('\n'),
          cards: list, chips: ['Что-то одно, но сильное', 'Куда с детьми?', 'Где поесть рядом?']
        };
      }
    },
    {
      id: 'eat',
      test: q => has(q, ['поесть', 'еда', 'ресторан', 'кафе', 'ужин', 'обед', 'завтрак', 'кухн', 'рыб', 'плов', 'голод', 'покушат']),
      run: (q, c) => {
        const morning = has(q, ['завтрак', 'утр', 'кофе']);
        const cheap = has(q, ['дешев', 'недорог', 'бюджет', 'экономн']);
        const tags = morning ? ['завтрак', 'кофе', 'утро'] : ['ужин', 'рыба', 'местная кухня', 'после гонки'];
        if (cheap) tags.push('дёшево', 'недорого');
        const list = pick(c.dest, 'eat', tags, 3);
        return {
          text: (morning
            ? `Завтрак в городе <b>${c.dest.city}</b> — с расчётом на утренний брифинг:\n\n`
            : `Где есть в городе <b>${c.dest.city}</b>${cheap ? ', без перерасхода' : ''}:\n\n`)
            + list.map(p => `• <b>${p.name}</b> — ${p.desc.split('.')[0]}. ${p.price}, ${p.time}.\n  <i>${p.tip}</i>`).join('\n'),
          cards: list, chips: ['Где ужинают экипажи?', 'Завтрак до брифинга', 'Что-то местное']
        };
      }
    },
    {
      id: 'see',
      test: q => has(q, ['увидет', 'посмотрет', 'закат', 'вид', 'фото', 'достопримечат', 'красив', 'панорам', 'экскурс']),
      run: (q, c) => {
        const list = byTags(c.dest, ['закат', 'вид', 'фото', 'история', 'природа', 'панорама'], 'see', 3);
        return {
          text: `Что здесь стоит увидеть:\n\n`
            + list.map(p => `• <b>${p.name}</b> — ${p.desc.split('.')[0]}. ${p.price}, ${p.time}.`).join('\n')
            + `\n\nСовет по первой точке: <i>${list[0] ? list[0].tip : ''}</i>`,
          cards: list, chips: ['Куда на закат?', 'Что-то на весь день', 'А где поесть рядом?']
        };
      }
    },
    {
      id: 'night',
      test: q => has(q, ['ночь', 'вечер', 'бар', 'тусов', 'вечеринк', 'выпит', 'музык', 'после финиш', 'после гонк']),
      run: (q, c) => {
        const list = [...pick(c.dest, 'night', [], 2), ...pick(c.dest, 'eat', ['ужин', 'после гонки'], 1)];
        return {
          text: `Вечер после гонки в городе <b>${c.dest.city}</b>:\n\n`
            + list.map(p => `• <b>${p.name}</b> — ${p.desc.split('.')[0]}. ${p.price}, ${p.time}.`).join('\n')
            + `\n\nПравило места: ${list[0] ? list[0].tip : 'столы занимают рано — бронируйте днём.'}`,
          cards: list, chips: ['Где тише?', 'Восстановиться после гонки', 'Завтрак на утро']
        };
      }
    },
    {
      id: 'active',
      test: q => has(q, ['поделат', 'занят', 'актив', 'спорт', 'sup', 'сап', 'кайт', 'снорклинг', 'нырят', 'покатат', 'адреналин']),
      run: (q, c) => {
        const list = pick(c.dest, 'do', ['активность', 'спорт', 'вода', 'адреналин', 'sup'], 3);
        return {
          text: `Чем занять себя и экипаж:\n\n`
            + list.map(p => `• <b>${p.name}</b> — ${p.desc.split('.')[0]}. ${p.price}, ${p.time}. <b>+${p.pts}</b> очков за чек-ин.`).join('\n'),
          cards: list, chips: ['Что-то спокойное', 'Куда с детьми?', 'Собери план на день']
        };
      }
    },
    {
      id: 'family',
      test: q => has(q, ['дет', 'семь', 'жена', 'муж', 'родител', 'не ходит под парус', 'команда поддержк']),
      run: (q, c) => {
        const list = byTags(c.dest, ['дети', 'семья', 'пляж', 'отдых', 'купание'], null, 3);
        return {
          text: `Для тех, кто приехал с вами, но не рвётся на воду:\n\n`
            + list.map(p => `• <b>${p.name}</b> — ${p.desc.split('.')[0]}. ${p.price}, ${p.time}.`).join('\n')
            + `\n\nЛогика простая: утро — вода и пляж, после обеда поднимается ветер и волна, и берег становится комфортнее.`,
          cards: list, chips: ['Где поесть с детьми?', 'Что-то на полдня', 'Куда на закат?']
        };
      }
    },
    {
      id: 'recover',
      test: q => has(q, ['спин', 'восстанов', 'устал', 'массаж', 'спа', 'бан', 'хамам', 'расслаб', 'болит']),
      run: (q, c) => {
        const list = byTags(c.dest, ['восстановление', 'спа', 'баня', 'расслабиться'], null, 2);
        return {
          text: `После трёх гонок подряд тело просит не ещё одного ужина, а вот этого:\n\n`
            + list.map(p => `• <b>${p.name}</b> — ${p.desc.split('.')[0]}. ${p.price}, ${p.time}.\n  <i>${p.tip}</i>`).join('\n'),
          cards: list, chips: ['Тихий ужин после', 'Что утром?', 'План на завтра']
        };
      }
    },
    {
      id: 'repair',
      test: q => has(q, ['ремонт', 'парус', 'такелаж', 'почини', 'сервис', 'сломал', 'порвал', 'мастер', 'швартов', 'марин']),
      run: (q, c) => {
        const list = pick(c.dest, 'yacht', [], 3);
        return {
          text: `Яхтенная инфраструктура города <b>${c.dest.city}</b>:\n\n`
            + list.map(p => `• <b>${p.name}</b> — ${p.desc.split('.')[0]}. ${p.price}, ${p.time}.\n  <i>${p.tip}</i>`).join('\n'),
          cards: list, chips: ['Где стоянка?', 'Сколько стоит швартовка?', 'План на день']
        };
      }
    },
    {
      id: 'weather',
      test: q => has(q, ['ветр', 'ветер', 'погод', 'температур', 'сезон', 'когда ехат', 'прогноз', 'штормит']),
      run: (q, c) => {
        const d = c.dest;
        return {
          text: `<b>${d.city}</b>, ${d.region}\n\n• Сезон: ${d.season}\n• Ветер: ${d.wind}\n• Вода: ${d.water}\n• Главная регата: ${d.regatta}\n\n${d.blurb}\n\nЕсли ветра нет — спросите «что делать в штиль», подберу берег.`,
          chips: ['Гонку отменили — что делать?', 'Собери план на день', 'Календарь регат']
        };
      }
    },
    {
      id: 'regatta',
      test: q => has(q, ['регат', 'гонк', 'календар', 'старт', 'соревнован', 'когда', 'записат', 'участ']),
      run: (q, c) => ({
        text: `Регаты в городе <b>${c.dest.city}</b>:\n\n`
          + REGATTAS.map(r => `• <b>${r.name}</b> — ${r.date}. ${r.fleet}. ${r.slots}. За участие <b>+${r.pts}</b> очков.`).join('\n')
          + `\n\nОтметиться можно в разделе «Регаты» — очки упадут в аккаунт сразу. Про лодку на эти даты спросите ассистента Charter Key на соседней вкладке.`,
        chips: ['Сколько у меня очков?', 'Что делать в день гонки?', 'Где швартоваться?']
      })
    },
    {
      id: 'profile',
      test: q => has(q, ['очк', 'балл', 'бонус', 'уровен', 'профил', 'награ', 'реферал', 'пригласит', 'друз', 'скидк', 'промокод'])
        && !has(q, ['как набрат', 'быстрее', 'больше очк', 'фарм', 'где набрат']),
      run: (q, c) => {
        const s = c.state;
        const lvl = c.level;
        const next = c.nextLevel;
        if (!s.registered) {
          return {
            text: `Очки живут в аккаунте, а вы сейчас смотрите как гость.\n\nРегистрация занимает минуту и сразу даёт <b>${BONUS.signup} очков</b>. После неё чек-ины на карте начнут копиться, а бонусы — открываться.`,
            chips: ['Зарегистрироваться', 'Собери план на день', 'Где поесть рыбу?']
          };
        }
        const affordable = REWARDS.filter(r => r.cost <= s.points && !s.claimed.includes(r.id));
        return {
          text: `<b>${s.name}</b> · уровень «${lvl.name}»\n\n`
            + `• Очки: <b>${s.points}</b>\n`
            + `• Чек-ины: ${s.checkins.length}\n`
            + `• Регаты: ${s.regattas.length}\n`
            + `• Друзья по ссылке: ${s.referrals} из 5\n`
            + (next ? `\nДо уровня «${next.name}» осталось <b>${next.from - s.points}</b> очков.\n` : `\nВы на максимальном уровне — «Адмирал».\n`)
            + (affordable.length
              ? `\nУже можно забрать: ${affordable.map(r => `<b>${r.title}</b> (${r.cost})`).join(', ')}.`
              : `\nБлижайший бонус: <b>${(REWARDS.find(r => r.cost > s.points) || REWARDS[0]).title}</b>.`)
            + `\n\nБыстрее всего очки набираются чек-инами на карте и участием в регате.`,
          chips: ['Где набрать очки быстрее?', 'Показать бонусы', 'Собери план на день']
        };
      }
    },
    {
      id: 'points-how',
      test: q => has(q, ['как набрат', 'быстрее очк', 'больше очк', 'фарм']),
      run: (q, c) => {
        const top = [...c.dest.points].sort((a, b) => b.pts - a.pts).slice(0, 3);
        return {
          text: `Порядок такой:\n\n• Участие в регате — от 300 до 500 очков, самый крупный источник.\n• Друг по вашей ссылке — ${BONUS.inviter} очков вам и ${BONUS.invitee} ему.\n• Чек-ины: в городе <b>${c.dest.city}</b> самые «дорогие» точки —\n`
            + top.map(p => `  – ${p.name}: <b>+${p.pts}</b>`).join('\n'),
          cards: top, chips: ['Сколько у меня очков?', 'Календарь регат', 'Собери план на день']
        };
      }
    },
    {
      id: 'price',
      test: q => has(q, ['сколько стоит', 'цен', 'бюджет', 'дорого', 'дешев', 'потрач']),
      run: (q, c) => {
        const d = c.dest;
        const cheap = d.points.filter(p => /бесплатно/i.test(p.price)).slice(0, 3);
        const eat = pick(d, 'eat', ['ужин'], 1)[0];
        const yacht = pick(d, 'yacht', [], 1)[0];
        return {
          text: `Ориентиры по деньгам в городе <b>${d.city}</b>:\n\n`
            + (yacht ? `• Стоянка / сервис: ${yacht.price}\n` : '')
            + (eat ? `• Ужин на человека: ${eat.price}\n` : '')
            + `• Бесплатно: ${cheap.length ? cheap.map(p => p.name).join(', ') : 'смотровые точки и прогулки по берегу'}\n\n`
            + `Совет: дорогие впечатления берите одно за поездку, остальное собирайте из бесплатных точек — по ощущению разницы почти нет.`,
          cards: cheap, chips: ['Что бесплатно?', 'Недорогая еда', 'Одно большое впечатление']
        };
      }
    },
    {
      id: 'city',
      test: q => has(q, ['город', 'куда поехат', 'где это', 'что за место', 'расскажи о город']),
      run: (q, c) => ({
        text: `<b>${c.dest.city}</b>, ${c.dest.region}.\n\n${c.dest.blurb}\n\n• Сезон: ${c.dest.season}\n• Ветер: ${c.dest.wind}\n• Вода: ${c.dest.water}\n• Главная регата: ${c.dest.regatta}\n\nНа карте ${c.dest.points.length} мест: еда, виды, занятия, вечер и яхт-сервис.`,
        chips: ['Собери план на день', 'Где поесть рыбу?', 'Куда на закат?']
      })
    }
  ];

  function answer(query, ctx) {
    const q = norm(query);
    for (const it of INTENTS) {
      if (it.test(q)) return it.run(q, ctx);
    }
    // общий поиск по точкам
    const found = rank(ctx.dest, words(query)).slice(0, 3);
    if (found.length) {
      return {
        text: `Вот что нашёл по запросу в городе <b>${ctx.dest.city}</b>:\n\n`
          + found.map(p => `• <b>${p.name}</b> — ${p.desc.split('.')[0]}. ${p.price}, ${p.time}.`).join('\n'),
        cards: found, chips: ['Собери план на день', 'Где поесть?', 'Гонку отменили — что делать?']
      };
    }
    return {
      text: `Не нашёл точного совпадения — но могу помочь иначе. Я знаю ${ctx.dest.points.length} точек в городе <b>${ctx.dest.city}</b>, календарь регат, ваши очки и бонусы.\n\nПопробуйте: «где поесть рыбу», «что делать в штиль», «куда идти на закат», «где починить парус», «сколько у меня очков».`,
      chips: ['Собери план на день', 'Гонку отменили — что делать?', 'Сколько у меня очков?']
    };
  }

  const WELCOME = dest => ({
    text: `Я гид по городу <b>${dest.city}</b>. ${dest.blurb}\n\nЗнаю здесь ${dest.points.length} точек, цены, часы работы и то, в какое время туда идти. Спрашивайте как местного.`,
    chips: ['Собери план на день', 'Где поесть рыбу?', 'Гонку отменили — что делать?', 'Сколько у меня очков?']
  });

  return { answer, WELCOME };
})();

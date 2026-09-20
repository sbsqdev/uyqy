/* Charter Key — строки интерфейса и переключение языка.
   T(field) достаёт нужный язык из объектов { ru, en } в data.js,
   t('path.to.key', { vars }) — из словаря ниже. */

const I18N = {
  ru: {
    langName: 'Русский',
    brand: { tagline: 'чартер и карта Гёчека' },
    nav: { map: 'Карта', collections: 'Подборки', regattas: 'Регаты', ai: 'ИИ-помощь', profile: 'Профиль' },
    btn: { signup: 'Регистрация', points: 'очков' },
    hero: {
      eyebrow: '{city} · сезон 2026 · {n} проверенных мест',
      h1a: 'Ключ от недели на воде.',
      h1b: 'Лодка, город и всё между ними.',
      lede: 'Charter Key — чартер яхт в Гёчеке и карта города к нему. Ассистент отвечает за поездку: лодки, документы, экипаж, провизия. Гид — за берег: где поесть рыбу после перехода, куда идти в штиль, где смотреть закат. Аккаунт превращает поездки в очки, очки — в бонусы на следующий чартер.',
      ctaSignup: 'Завести аккаунт · +{n} очков',
      ctaMap: 'Открыть карту',
      statPlaces: 'мест на карте', statRegattas: 'регаты в сезоне', statCheckins: 'ваших чек-инов'
    },
    hc: {
      label: 'Ближайшая регата', wind: 'Ветер', water: 'Вода', fleet: 'Флот',
      join: 'Я иду · +{n} очков', joined: '✓ Вы в списке экипажей', calendar: 'Весь календарь'
    },
    map: {
      kicker: 'Карта мест · {city}',
      h2: 'Что поделать, что поесть, что увидеть',
      note: 'Двенадцать мест, отобранных вручную: цена, часы и совет, который знает местный. Чек-ин начисляет очки в аккаунт.',
      search: 'Рыба, закат, SUP, ремонт парусов…',
      metaCity: 'Город', metaSeason: 'Сезон', metaWind: 'Ветер', metaWater: 'Вода', metaPlaces: 'Мест на карте',
      empty: 'Ничего не нашлось. Попробуйте «рыба», «закат», «SUP» или сбросьте фильтр.'
    },
    poi: {
      close: 'Закрыть ✕', price: 'Цена', hours: 'Часы', perCheckin: 'За чек-ин', pts: '+{n} очков',
      tip: 'Совет:', checkin: 'Чек-ин · +{n} очков', done: '✓ Чек-ин сделан', ask: 'Спросить гида об этом месте'
    },
    coll: {
      kicker: 'Подборки', h2: 'Чем себя занять — по ситуации',
      note: 'Собраны под реальные сценарии недели на воде, а не по рубрикам справочника.',
      open: 'Открыть на карте →'
    },
    reg: {
      kicker: 'Календарь', h2: 'Регаты сезона',
      note: 'Отметьтесь в регате — очки упадут в аккаунт. Лодку на эти даты бронируйте заранее.',
      fleet: 'Флот', join: 'Я иду · +{n}', joined: '✓ Вы в списке', nearby: 'Места рядом'
    },
    ai: {
      kicker: 'Два ИИ', h2: 'Ассистент по чартеру и гид по городу',
      note: 'Ассистент — про поездку: лодки, документы, экипаж, отмены, бонусы. Гид — про берег: места, цены, часы и время суток. Оба видят ваш аккаунт.',
      tabAssistant: 'Ассистент Charter Key', tabAssistantSub: 'чартер, документы, бонусы',
      tabGuide: 'Гид по городу', tabGuideSub: '{city} · места, еда, маршруты',
      clear: 'Очистить', placeholder: 'Например: что входит в чартер?', send: 'Спросить',
      cardGo: 'на карте →',
      sideAssistant: 'Что знает ассистент', sideGuide: 'Что знает гид',
      sideAssistantItems: [
        'Лодки и цены по сезону, что входит в чартер',
        'Документы: права, радиолицензия, депозит и страховка',
        'Экипаж, провизия, трансфер из Даламана',
        'Отмены и переносы — сроки и суммы',
        'Ваши очки, бонусы и реферальная программа'
      ],
      sideGuideItems: [
        '{n} мест города — с ценами и часами',
        'В какое время суток куда идти',
        'Сценарии недели: штиль, вечер после перехода, день с детьми',
        'Ваш уровень, очки и уже сделанные чек-ины'
      ],
      cityNow: 'Город сейчас', season: 'Сезон', wind: 'Ветер', water: 'Вода', regatta: 'Регата'
    },
    profile: {
      kicker: 'Профиль', h2: 'Ваш аккаунт Charter Key',
      note: 'Очки, уровень, заявки на регаты, бонусы и приглашения — в одном месте. Всё считается от чек-инов и друзей по ссылке.',
      guest: 'Гость · без аккаунта', points: 'очков',
      toLevel: 'до уровня «{name}» — {n} очков', maxLevel: 'максимальный уровень',
      checkins: 'чек-инов', regattas: 'регат', friends: 'друзей', bonuses: 'бонусов'
    },
    gate: {
      title: 'Вы смотрите как гость.',
      text: 'Карта и оба ИИ работают полностью. Но чек-ины не сохраняются, очки не копятся и бонусы забрать нельзя — для этого нужен аккаунт. Регистрация сразу даёт {n} очков.',
      cta: 'Создать аккаунт · +{n} очков'
    },
    ref: {
      title: 'Рефералы',
      text: 'Друг регистрируется по ссылке и бронирует чартер — вам {a} очков, ему {b} на старте.',
      copy: 'Скопировать', invite: 'Пригласить друга (демо)',
      placeholder: 'Появится после регистрации',
      hint: '{n} из 5 · приглашено {n} {word}', hintFull: 'Все пятеро на борту — сутки чартера ваши.',
      friendsWord: ['друг', 'друга', 'друзей'],
      tierWord: ['друг', 'друга', 'друзей']
    },
    rewards: { title: 'Бонусы за очки', claim: 'Забрать', claimed: 'получено', promo: 'Промокод:', cost: '{n} очк.' },
    log: { title: 'История', empty: 'Пока пусто. Заведите аккаунт и сделайте первый чек-ин на карте.', reset: 'Сбросить прогресс' },
    modal: {
      kicker: 'Аккаунт Charter Key', title: 'Регистрация за минуту',
      perk1: '<b>+{n} очков</b> сразу на счёт — это уже почти первый бонус',
      perk2: 'Чек-ины на карте копятся и превращаются в скидку на чартер',
      perk3: 'Личная ссылка: друг регистрируется — вам {a} очков, ему {b}',
      name: 'Имя и фамилия', namePh: 'Алина Турсунова',
      email: 'Почта', emailPh: 'alina@example.com',
      promo: 'Промокод друга', promoOpt: 'необязательно', promoPh: 'CK-ALINA-2631',
      submit: 'Создать аккаунт · +{n} очков',
      note: 'Демо-версия: аккаунт хранится в этом браузере, ничего никуда не отправляется.',
      errName: 'Напишите имя — оно будет на карточке экипажа.',
      errEmail: 'Проверьте почту: нужен формат name@domain.com'
    },
    toast: {
      gateCheckin: 'Чек-ины копятся в аккаунте — заведите его за минуту',
      gateRegatta: 'Заявка на регату сохраняется в аккаунте',
      gateReward: 'Бонусы привязаны к аккаунту',
      gateRef: 'Ссылка появится сразу после регистрации',
      gateInvite: 'Приглашать можно из аккаунта',
      copied: 'Ссылка скопирована — отправьте экипажу',
      invitesDone: 'Все пять приглашений уже использованы',
      tier: 'Порог {n}: <b>{title}</b> открыт',
      reward: 'Бонус ваш · промокод <b>{code}</b>',
      notEnough: 'Не хватает <b>{n}</b> очков до «{title}»',
      cleared: 'Аккаунт очищен',
      points: '<b>+{n}</b> очков · {label}'
    },
    logLabel: {
      signup: 'Регистрация в Charter Key',
      promo: 'Промокод друга {code}',
      checkin: 'Чек-ин: {name}',
      regatta: 'Заявка на регату: {name}',
      referral: 'Друг по ссылке ({n}/5)',
      reward: 'Бонус: {title}'
    },
    confirmReset: 'Выйти из аккаунта и стереть очки, чек-ины и бонусы?',
    footer: {
      text: 'Демо-проект: чартер в Гёчеке, карта мест города, ИИ-ассистент и ИИ-гид, аккаунт с очками, бонусами и реферальной программой. Названия заведений и цены вымышлены, аккаунт хранится локально в браузере.'
    }
  },

  en: {
    langName: 'English',
    brand: { tagline: 'charter and city map of Göcek' },
    nav: { map: 'Map', collections: 'Collections', regattas: 'Regattas', ai: 'AI help', profile: 'Account' },
    btn: { signup: 'Sign up', points: 'points' },
    hero: {
      eyebrow: '{city} · season 2026 · {n} hand-picked places',
      h1a: 'The key to your week afloat.',
      h1b: 'Boat, town, everything between.',
      lede: 'Charter Key is yacht charter in Göcek with the city mapped around it. The assistant handles the trip: boats, paperwork, crew, provisioning. The guide handles the shore: where to eat fish after a passage, what to do when the wind dies, where to watch the sunset. Your account turns trips into points, and points into credit on the next charter.',
      ctaSignup: 'Create an account · +{n} points',
      ctaMap: 'Open the map',
      statPlaces: 'places on the map', statRegattas: 'regattas this season', statCheckins: 'your check-ins'
    },
    hc: {
      label: 'Next regatta', wind: 'Wind', water: 'Water', fleet: 'Fleet',
      join: "I'm in · +{n} points", joined: '✓ You are on the crew list', calendar: 'Full calendar'
    },
    map: {
      kicker: 'City map · {city}',
      h2: 'What to do, where to eat, what to see',
      note: 'Twelve places picked by hand: price, opening hours and the tip a local would give you. Every check-in adds points to your account.',
      search: 'Fish, sunset, SUP, sail repair…',
      metaCity: 'City', metaSeason: 'Season', metaWind: 'Wind', metaWater: 'Water', metaPlaces: 'Places',
      empty: 'Nothing found. Try “fish”, “sunset”, “SUP” or clear the filter.'
    },
    poi: {
      close: 'Close ✕', price: 'Price', hours: 'Hours', perCheckin: 'Check-in', pts: '+{n} points',
      tip: 'Tip:', checkin: 'Check in · +{n} points', done: '✓ Checked in', ask: 'Ask the guide about this place'
    },
    coll: {
      kicker: 'Collections', h2: 'What to do, by situation',
      note: 'Built around real moments of a week afloat, not around directory categories.',
      open: 'Show on the map →'
    },
    reg: {
      kicker: 'Calendar', h2: 'Regattas this season',
      note: 'Put your name down and the points land in your account. Book the boat for those dates well ahead.',
      fleet: 'Fleet', join: "I'm in · +{n}", joined: '✓ You are in', nearby: 'Places nearby'
    },
    ai: {
      kicker: 'Two assistants', h2: 'A charter assistant and a city guide',
      note: 'The assistant covers the trip: boats, paperwork, crew, cancellations, points. The guide covers the shore: places, prices, hours and time of day. Both can see your account.',
      tabAssistant: 'Charter Key assistant', tabAssistantSub: 'charter, paperwork, points',
      tabGuide: 'City guide', tabGuideSub: '{city} · places, food, routes',
      clear: 'Clear', placeholder: 'For example: what is included in the charter?', send: 'Ask',
      cardGo: 'on the map →',
      sideAssistant: 'What the assistant knows', sideGuide: 'What the guide knows',
      sideAssistantItems: [
        'Boats and seasonal pricing, what the charter includes',
        'Paperwork: licences, VHF certificate, deposit and insurance',
        'Crew, provisioning, transfer from Dalaman',
        'Cancellations and date changes — deadlines and amounts',
        'Your points, rewards and referral programme'
      ],
      sideGuideItems: [
        '{n} places in town — with prices and hours',
        'Which place suits which time of day',
        'Real scenarios: flat calm, evening after a passage, a day with kids',
        'Your level, points and check-ins so far'
      ],
      cityNow: 'The town right now', season: 'Season', wind: 'Wind', water: 'Water', regatta: 'Regatta'
    },
    profile: {
      kicker: 'Account', h2: 'Your Charter Key account',
      note: 'Points, level, regatta entries, rewards and invitations in one place. All of it driven by check-ins and friends you bring in.',
      guest: 'Guest · no account', points: 'points',
      toLevel: '{n} points to “{name}”', maxLevel: 'top level reached',
      checkins: 'check-ins', regattas: 'regattas', friends: 'friends', bonuses: 'rewards'
    },
    gate: {
      title: 'You are browsing as a guest.',
      text: 'The map and both AIs work in full. But check-ins are not saved, points do not accumulate and rewards cannot be claimed — that needs an account. Signing up gives you {n} points straight away.',
      cta: 'Create an account · +{n} points'
    },
    ref: {
      title: 'Referrals',
      text: 'A friend signs up through your link and books a charter — you get {a} points, they start with {b}.',
      copy: 'Copy', invite: 'Invite a friend (demo)',
      placeholder: 'Appears once you sign up',
      hint: '{n} of 5 · {n} {word} invited', hintFull: 'All five aboard — the free charter day is yours.',
      friendsWord: ['friend', 'friends', 'friends'],
      tierWord: ['friend', 'friends', 'friends']
    },
    rewards: { title: 'Rewards for points', claim: 'Claim', claimed: 'claimed', promo: 'Promo code:', cost: '{n} pts' },
    log: { title: 'History', empty: 'Empty so far. Create an account and make your first check-in on the map.', reset: 'Reset progress' },
    modal: {
      kicker: 'Charter Key account', title: 'Sign up in a minute',
      perk1: '<b>+{n} points</b> straight away — almost the first reward already',
      perk2: 'Check-ins on the map add up and turn into charter credit',
      perk3: 'Your own link: a friend signs up — {a} points for you, {b} for them',
      name: 'Full name', namePh: 'Alina Tursunova',
      email: 'Email', emailPh: 'alina@example.com',
      promo: "Friend's code", promoOpt: 'optional', promoPh: 'CK-ALINA-2631',
      submit: 'Create account · +{n} points',
      note: 'Demo version: the account stays in this browser, nothing is sent anywhere.',
      errName: 'Add your name — it goes on the crew card.',
      errEmail: 'Check the email: it should look like name@domain.com'
    },
    toast: {
      gateCheckin: 'Check-ins live in your account — it takes a minute to create',
      gateRegatta: 'Regatta entries are saved to your account',
      gateReward: 'Rewards are tied to your account',
      gateRef: 'Your link appears as soon as you sign up',
      gateInvite: 'Invitations are sent from your account',
      copied: 'Link copied — send it to your crew',
      invitesDone: 'All five invitations are already used',
      tier: 'Tier {n}: <b>{title}</b> unlocked',
      reward: 'Reward claimed · promo code <b>{code}</b>',
      notEnough: '<b>{n}</b> points short of “{title}”',
      cleared: 'Account cleared',
      points: '<b>+{n}</b> points · {label}'
    },
    logLabel: {
      signup: 'Signed up with Charter Key',
      promo: "Friend's code {code}",
      checkin: 'Check-in: {name}',
      regatta: 'Regatta entry: {name}',
      referral: 'Friend joined via link ({n}/5)',
      reward: 'Reward: {title}'
    },
    confirmReset: 'Sign out and erase points, check-ins and rewards?',
    footer: {
      text: 'Demo project: charter in Göcek, a map of the town, an AI assistant and an AI city guide, an account with points, rewards and referrals. Venue names and prices are invented, the account is stored locally in your browser.'
    }
  }
};

const Lang = (() => {
  const KEY = 'charterkey.lang';
  let lang = 'ru';
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'ru' || saved === 'en') lang = saved;
    else if (!/^ru|uz|kk|ky|be|tg/i.test(navigator.language || '')) lang = 'en';
  } catch {}

  const get = () => lang;
  const set = v => {
    lang = (v === 'en') ? 'en' : 'ru';
    try { localStorage.setItem(KEY, lang); } catch {}
    document.documentElement.lang = lang;
  };

  /* значение из объекта { ru, en } — или сама строка */
  const T = f => (f && typeof f === 'object' && !Array.isArray(f)) ? (f[lang] ?? f.ru) : f;

  /* строка из словаря: t('hero.ctaMap'), t('poi.pts', { n: 40 }) */
  const t = (path, vars) => {
    let v = path.split('.').reduce((o, k) => (o ? o[k] : undefined), I18N[lang]);
    if (v === undefined) v = path.split('.').reduce((o, k) => (o ? o[k] : undefined), I18N.ru);
    if (typeof v !== 'string') return v;
    return vars ? v.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m)) : v;
  };

  /* склонение: ru — 1 друг / 2 друга / 5 друзей, en — friend / friends */
  const plural = (n, words) => {
    if (lang === 'en') return n === 1 ? words[0] : words[1];
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return words[0];
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return words[1];
    return words[2];
  };

  return { get, set, T, t, plural };
})();

const T = Lang.T;
const t = Lang.t;

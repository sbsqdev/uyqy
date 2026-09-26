/* Charter Key — UI strings (en/ru) and the language switch.
   Content strings live in data.js as { en, ru } and are read with T(). */

const I18N = {
  en: {
    brand: { tagline: 'crew platform · any venue' },
    nav: { berths: 'Berths', calendar: 'Calendar', academy: 'Academy', map: 'The town', ai: 'AI help', account: 'Account' },
    btn: { signup: 'Sign up', points: 'points' },
    hero: {
      eyebrow: '{city} · season 2027 · {n} berths left',
      h1a: 'Race a 36-foot offshore boat.',
      h1b: 'No experience required on day one.',
      lede: 'Five venues, one class of boat, the same coaching standard. You fly in on Saturday; by Wednesday you are trimming a spinnaker in 20 knots and arguing about the start line over dinner. A properly prepared race boat, a coach beside you, the logistics handled and the town on a map.',
      ctaQuiz: 'Find my berth', ctaQuizNote: '60 sec', ctaCal: 'See the calendar',
      statTiers: 'crew tiers', statEvents: 'events in 2027', statCheckins: 'your check-ins'
    },
    hc: { label: 'Next event', fleet: 'Fleet', wind: 'Wind', spots: 'Berths left',
          join: 'Hold a berth · +{n} points', held: '✓ Berth held', calendar: 'Full calendar' },
    venue: { kicker: 'Venues', h2: 'Pick where you want to race',
             note: 'Same class of boat, same coaching standard, five very different weeks of sailing. Crews fly in from anywhere — the map, the calendar and both assistants follow whichever venue you pick.' },
    berths: { kicker: 'Berths', h2: 'Same boat, three ways to sail her',
              note: 'Every tier races the full event. What changes is how much of the boat is yours: the rail, one position, or the wheel.',
              choose: 'Choose {name}', chosen: '✓ Your tier', left: '{n} left this season' },
    magnet: { free: 'Free', unlock: 'Unlock it free', open: 'Open the checklist',
              noteLocked: 'Free with an account. No card, no call, one minute.',
              noteOpen: 'Unlocked on your account. We email the printable version before your first event.' },
    quiz: { kicker: 'Crew match', h2: 'Which berth is actually yours',
            note: 'Three questions. The wrong tier is the most common way to have a bad week — too easy and you are bored, too hard and you spend six days apologising.',
            step: 'Question {i} of {n}', match: 'Your match', take: 'Take the {name} berth', again: 'Start again', why: 'Ask the assistant why' },
    cal: { kicker: 'Calendar 2027', h2: 'Where the boats are this season',
           note: 'Hold a berth and it is yours for 48 hours before we release it. Members see every event two days before everyone else.',
           fleet: 'Fleet', left: '{n} berths left', left1: '1 berth left',
           hold: 'Hold a berth · +{n}', held: '✓ Berth held', tiers: 'Tiers', at: 'at {city}' },
    academy: { kicker: 'Academy', h2: 'Learn it before you step aboard',
               note: 'Filmed on the boat, not on a whiteboard. Crew who arrive having done the theory spend day one racing instead of catching up.',
               buy: 'Buy {price}', orPoints: 'or {n} points', owned: '✓ In your library',
               club: 'The Club', membership: 'Membership', perYear: 'or {price} a year',
               join: 'Join the club', member: '✓ Member' },
    map: { kicker: 'The town · {city}', h2: 'What to do when you are not racing',
           note: 'Places picked by hand: price, opening hours and the tip a local would give you. Every check-in adds points to your account.',
           search: 'Fish, sunset, coffee, sail repair…',
           season: 'Season', wind: 'Wind', water: 'Water', airport: 'Airport', places: 'Places',
           empty: 'Nothing found. Try “fish”, “sunset”, “coffee” or clear the filter.' },
    poi: { close: 'Close ✕', price: 'Price', hours: 'Hours', checkin: 'Check-in', pts: '+{n} points',
           tip: 'Tip:', check: 'Check in · +{n} points', done: '✓ Checked in', ask: 'Ask the guide about this place',
           show: 'Show on the map →' },
    ai: { kicker: 'Two assistants', h2: 'One for the boat, one for the shore',
          note: 'The crew assistant answers what you would otherwise email us at midnight: tiers, kit, safety, flights, money. The town guide handles everything ashore.',
          tabCrew: 'Crew assistant', tabCrewSub: 'berths, kit, safety, logistics',
          tabTown: 'Town guide', tabTownSub: '{city} · places, food, routes',
          clear: 'Clear', placeholder: 'For example: I have never raced — which tier?', send: 'Ask',
          cardGo: 'on the map →', boat: 'The boat', boatClass: 'Class',
          sideCrew: 'What the crew assistant knows', sideTown: 'What the town guide knows',
          sideCrewItems: [
            'The three tiers and what each one actually includes',
            'Experience needed, and when we will say no',
            'Category 3 safety inventory aboard',
            'Flights, transfers, money and packing for each venue',
            'Cancellations, the Academy, the Club, your points'
          ],
          sideTownItems: [
            '{n} places in {city} — with prices and hours',
            'Which place suits which time of day',
            'Lay days, evenings after racing, days with the shore crew',
            'Your level, points and check-ins so far'
          ] },
    platform: {
      kicker: 'For race programmes',
      h2: 'This whole page is the product',
      note: 'Charter Key is the platform a club or a team runs its crew side on, in any country and any language. The venues, boats and prices here are demo data — swap them for yours and the funnel, the assistants and the account all follow.',
      c1t: 'Sell berths, not seats',
      c1l: 'Three tiers on the same boat, real scarcity per event, and a three-question quiz that routes people to the tier they will actually enjoy. Fewer refunds, higher average booking.',
      c2t: 'Answer the midnight email once',
      c2l: 'Two assistants trained on your boat, your safety inventory and your venues. They cover licences, kit, transfers and money so your shore team does not repeat it forty times a season.',
      c3t: 'Keep them for next season',
      c3l: 'Points for berths, check-ins and referrals, converting into helm hours and tier upgrades. Plus membership: early access that makes the off-season a revenue month.',
      cta: 'Book a walkthrough',
      ctaNote: 'Fifteen minutes, your calendar, your boats. No integration project.',
      toast: 'Demo button — in production this opens your booking calendar'
    },
    faq: { kicker: 'Before you book', h2: 'The questions everyone asks',
           note: 'If your question is not here, the crew assistant above has the same answers and a few hundred more.' },
    account: { kicker: 'Account', h2: 'Your crew account',
               note: 'Points from events, check-ins and friends you bring in. They convert into helm hours, courses and tier upgrades — not into a plastic loyalty card.',
               guest: 'Guest · no account', points: 'points',
               toLevel: '{n} points to {name}', maxLevel: 'top level reached',
               checkins: 'check-ins', events: 'berths held', friends: 'friends', rewards: 'rewards' },
    gate: { title: 'You are browsing as a guest.',
            text: 'The map, both assistants and the quiz work in full. But check-ins are not saved, points do not accumulate and the prep checklist stays locked. Signing up takes a minute and gives you {n} points.',
            cta: 'Create an account · +{n} points' },
    ref: { title: 'Bring your crew',
           text: 'A friend signs up through your link and books a berth — you get {a} points, they start with {b}. Five friends and your next race week is free.',
           copy: 'Copy', invite: 'Invite a friend (demo)', placeholder: 'Appears once you sign up',
           hint: '{n} of 5 invited', hintFull: 'All five aboard — your next race week is on us.',
           friend: 'friend', friends: 'friends' },
    rewards: { title: 'Spend your points', claim: 'Claim', claimed: 'claimed', code: 'Code:', cost: '{n} pts' },
    log: { title: 'History', empty: 'Empty so far. Create an account and hold your first berth.', reset: 'Reset progress' },
    modal: { kicker: 'Crew account', title: 'Sign up in a minute',
             perk1: '<b>{title}</b>, unlocked immediately',
             perk2: '<b>+{n} points</b> on the account — most of the way to your first reward',
             perk3: 'Your own link: a friend signs up, you get {a} points, they get {b}',
             name: 'Full name', namePh: 'Sam Whitfield', email: 'Email', emailPh: 'sam@example.com',
             promo: "Friend's code", promoOpt: 'optional', promoPh: 'CK-SAM-2631',
             submit: 'Create account · +{n} points',
             note: 'Demo version: the account stays in this browser, nothing is sent anywhere.',
             errName: 'Add your name — it goes on the crew list.',
             errEmail: 'Check the email: it should look like name@domain.com' },
    toast: {
      gateCheckin: 'Check-ins are saved to an account', gateEvent: 'Berths are held on an account — it takes a minute',
      gateReward: 'Rewards are tied to an account', gateCourse: 'Courses are attached to an account',
      gateClub: 'Membership sits on an account', gateRef: 'Your link appears as soon as you sign up',
      gateInvite: 'Invitations are sent from your account',
      copied: 'Link copied — send it to your crew', invitesDone: 'All five invitations are already used',
      tier: 'Tier {n}: <b>{title}</b> unlocked', reward: 'Reward claimed · code <b>{code}</b>',
      short: '<b>{n}</b> points short of “{title}”', cleared: 'Account cleared',
      points: '<b>+{n}</b> points · {label}', tierPicked: '<b>{name}</b> selected · pick your event below',
      venue: 'Switched to <b>{city}</b>', coursePoints: '<b>{title}</b> unlocked with points',
      courseBuy: 'Demo checkout: <b>{title}</b> added to your library',
      clubJoined: 'Demo checkout: you are in the Club — 48h early access is on'
    },
    logLabel: { signup: 'Signed up', promo: "Friend's code {code}", checkin: 'Check-in: {name}',
                event: 'Berth held: {name}', referral: 'Friend joined ({n}/5)', reward: 'Reward: {title}',
                course: 'Course: {title}' },
    confirmReset: 'Sign out and erase points, check-ins, berths and rewards?',
    footer: { text: 'Demo project: crew berths on offshore race boats in four venues, city maps, two AI assistants and an account with points, rewards and referrals. Prices, availability and venue names are illustrative; the account is stored locally in your browser.' }
  },

  ru: {
    brand: { tagline: 'платформа для экипажей · любая акватория' },
    nav: { berths: 'Тарифы', calendar: 'Календарь', academy: 'Академия', map: 'Город', ai: 'ИИ-помощь', account: 'Аккаунт' },
    btn: { signup: 'Регистрация', points: 'очков' },
    hero: {
      eyebrow: '{city} · сезон 2027 · свободных мест: {n}',
      h1a: 'Гоночная яхта 36 футов.',
      h1b: 'Опыт в первый день не нужен.',
      lede: 'Пять акваторий, один класс лодки, один стандарт тренерской работы. Вы прилетаете в субботу, а к среде уже работаете со спинакером в 20 узлов и спорите про линию старта за ужином. Подготовленная гоночная яхта, тренер рядом, логистика на нас и город картой.',
      ctaQuiz: 'Подобрать место', ctaQuizNote: '60 сек', ctaCal: 'Смотреть календарь',
      statTiers: 'тарифа в экипаже', statEvents: 'события в 2027', statCheckins: 'ваших чек-инов'
    },
    hc: { label: 'Ближайшее событие', fleet: 'Флот', wind: 'Ветер', spots: 'Свободно мест',
          join: 'Забронировать · +{n} очков', held: '✓ Место забронировано', calendar: 'Весь календарь' },
    venue: { kicker: 'Акватории', h2: 'Выберите, где гоняться',
             note: 'Один класс лодки и один стандарт тренерской работы — но пять совершенно разных недель. Экипажи прилетают откуда угодно, а карта, календарь и оба ИИ переключаются вместе с выбором акватории.' },
    berths: { kicker: 'Тарифы', h2: 'Одна лодка, три способа на ней ходить',
              note: 'Все тарифы гоняют полное событие. Разница в том, какая часть лодки ваша: перила, одна позиция или штурвал.',
              choose: 'Выбрать {name}', chosen: '✓ Ваш тариф', left: 'осталось мест: {n}' },
    magnet: { free: 'Бесплатно', unlock: 'Забрать бесплатно', open: 'Открыть чек-лист',
              noteLocked: 'Бесплатно с аккаунтом. Без карты, без звонка, одна минута.',
              noteOpen: 'Открыт на вашем аккаунте. Версию для печати пришлём на почту перед первым событием.' },
    quiz: { kicker: 'Подбор', h2: 'Какое место на самом деле ваше',
            note: 'Три вопроса. Неверный тариф — самый частый способ испортить себе неделю: слишком просто — скучно, слишком сложно — шесть дней извиняетесь.',
            step: 'Вопрос {i} из {n}', match: 'Ваш вариант', take: 'Взять тариф {name}', again: 'Пройти заново', why: 'Спросить ассистента почему' },
    cal: { kicker: 'Календарь 2027', h2: 'Где лодки в этом сезоне',
           note: 'Забронированное место держится за вами 48 часов. Члены клуба видят события на двое суток раньше остальных.',
           fleet: 'Флот', left: 'свободно мест: {n}', left1: 'осталось 1 место',
           hold: 'Забронировать · +{n}', held: '✓ Забронировано', tiers: 'Тарифы', at: '{city}' },
    academy: { kicker: 'Академия', h2: 'Разобраться до выхода на воду',
               note: 'Снято на лодке, а не у доски. Экипаж, который приехал с теорией, в первый день гоняется, а не догоняет.',
               buy: 'Купить {price}', orPoints: 'или {n} очков', owned: '✓ В вашей библиотеке',
               club: 'Клуб', membership: 'Подписка', perYear: 'или {price} в год',
               join: 'Вступить в клуб', member: '✓ Вы в клубе' },
    map: { kicker: 'Город · {city}', h2: 'Чем заняться, когда нет гонок',
           note: 'Места, отобранные вручную: цена, часы и совет, который знает местный. Каждый чек-ин начисляет очки в аккаунт.',
           search: 'Рыба, закат, кофе, ремонт парусов…',
           season: 'Сезон', wind: 'Ветер', water: 'Вода', airport: 'Аэропорт', places: 'Мест',
           empty: 'Ничего не нашлось. Попробуйте «рыба», «закат», «кофе» или сбросьте фильтр.' },
    poi: { close: 'Закрыть ✕', price: 'Цена', hours: 'Часы', checkin: 'За чек-ин', pts: '+{n} очков',
           tip: 'Совет:', check: 'Чек-ин · +{n} очков', done: '✓ Чек-ин сделан', ask: 'Спросить гида об этом месте',
           show: 'Открыть на карте →' },
    ai: { kicker: 'Два ИИ', h2: 'Один про лодку, второй про берег',
          note: 'Ассистент отвечает на то, что вы иначе написали бы нам в полночь: тарифы, снаряжение, безопасность, перелёты, деньги. Гид отвечает за всё на берегу.',
          tabCrew: 'Ассистент экипажа', tabCrewSub: 'тарифы, снаряжение, безопасность, логистика',
          tabTown: 'Гид по городу', tabTownSub: '{city} · места, еда, маршруты',
          clear: 'Очистить', placeholder: 'Например: я никогда не гонялся — какой тариф?', send: 'Спросить',
          cardGo: 'на карте →', boat: 'Лодка', boatClass: 'Класс',
          sideCrew: 'Что знает ассистент', sideTown: 'Что знает гид',
          sideCrewItems: [
            'Три тарифа и что в каждый реально входит',
            'Какой опыт нужен и когда мы честно откажем',
            'Снаряжение по категории 3 на борту',
            'Перелёты, трансферы, деньги и сборы по каждой акватории',
            'Отмены, академия, клуб, ваши очки'
          ],
          sideTownItems: [
            '{n} мест в городе {city} — с ценами и часами',
            'В какое время суток куда идти',
            'Дни без гонок, вечер после финиша, день с командой поддержки',
            'Ваш уровень, очки и уже сделанные чек-ины'
          ] },
    platform: {
      kicker: 'Для гоночных программ',
      h2: 'Эта страница и есть продукт',
      note: 'Charter Key — платформа, на которой клуб или команда ведёт всё, что касается экипажа, в любой стране и на любом языке. Акватории, лодки и цены здесь демонстрационные: подставьте свои, и воронка, ассистенты и аккаунт поедут следом.',
      c1t: 'Продавать места, а не кресла',
      c1l: 'Три тарифа на одной лодке, настоящий дефицит по каждому событию и квиз из трёх вопросов, который отправляет человека в тариф, где ему будет хорошо. Меньше возвратов, выше средний чек.',
      c2t: 'Ответить на полуночное письмо один раз',
      c2l: 'Два ассистента, обученных на вашей лодке, вашем списке безопасности и ваших акваториях. Документы, снаряжение, трансферы и деньги — чтобы береговая команда не повторяла это сорок раз за сезон.',
      c3t: 'Удержать до следующего сезона',
      c3l: 'Очки за места, чек-ины и приглашения, которые превращаются в часы на руле и апгрейд тарифа. Плюс подписка: ранний доступ делает межсезонье доходным месяцем.',
      cta: 'Запросить демо',
      ctaNote: 'Пятнадцать минут, ваш календарь, ваши лодки. Без интеграционного проекта.',
      toast: 'Демо-кнопка — в проде здесь открывается ваш календарь брони'
    },
    faq: { kicker: 'Перед бронированием', h2: 'Вопросы, которые задают все',
           note: 'Если вашего вопроса здесь нет — у ассистента выше те же ответы и ещё пара сотен сверху.' },
    account: { kicker: 'Аккаунт', h2: 'Ваш аккаунт в экипаже',
               note: 'Очки за события, чек-ины и приглашённых друзей. Они превращаются в часы на руле, курсы и апгрейд тарифа, а не в пластиковую карту лояльности.',
               guest: 'Гость · без аккаунта', points: 'очков',
               toLevel: 'до уровня «{name}» — {n} очков', maxLevel: 'максимальный уровень',
               checkins: 'чек-инов', events: 'броней', friends: 'друзей', rewards: 'наград' },
    gate: { title: 'Вы смотрите как гость.',
            text: 'Карта, оба ИИ и подбор работают полностью. Но чек-ины не сохраняются, очки не копятся, а чек-лист остаётся закрытым. Регистрация занимает минуту и сразу даёт {n} очков.',
            cta: 'Создать аккаунт · +{n} очков' },
    ref: { title: 'Приведите свой экипаж',
           text: 'Друг регистрируется по вашей ссылке и бронирует место — вам {a} очков, ему {b} на старте. Пять друзей — и следующая гоночная неделя бесплатна.',
           copy: 'Скопировать', invite: 'Пригласить друга (демо)', placeholder: 'Появится после регистрации',
           hint: 'приглашено {n} из 5', hintFull: 'Все пятеро на борту — следующая гоночная неделя за нами.',
           friend: 'друг', friends: 'друзей' },
    rewards: { title: 'Потратить очки', claim: 'Забрать', claimed: 'получено', code: 'Промокод:', cost: '{n} очк.' },
    log: { title: 'История', empty: 'Пока пусто. Заведите аккаунт и забронируйте первое место.', reset: 'Сбросить прогресс' },
    modal: { kicker: 'Аккаунт экипажа', title: 'Регистрация за минуту',
             perk1: '<b>{title}</b> — открывается сразу',
             perk2: '<b>+{n} очков</b> на счёт — это уже почти первая награда',
             perk3: 'Личная ссылка: друг регистрируется — вам {a} очков, ему {b}',
             name: 'Имя и фамилия', namePh: 'Алина Турсунова', email: 'Почта', emailPh: 'alina@example.com',
             promo: 'Промокод друга', promoOpt: 'необязательно', promoPh: 'CK-ALINA-2631',
             submit: 'Создать аккаунт · +{n} очков',
             note: 'Демо-версия: аккаунт хранится в этом браузере, ничего никуда не отправляется.',
             errName: 'Напишите имя — оно попадёт в список экипажа.',
             errEmail: 'Проверьте почту: нужен формат name@domain.com' },
    toast: {
      gateCheckin: 'Чек-ины сохраняются в аккаунте', gateEvent: 'Места бронируются в аккаунте — это минута',
      gateReward: 'Награды привязаны к аккаунту', gateCourse: 'Курсы привязаны к аккаунту',
      gateClub: 'Подписка живёт в аккаунте', gateRef: 'Ссылка появится сразу после регистрации',
      gateInvite: 'Приглашать можно из аккаунта',
      copied: 'Ссылка скопирована — отправьте экипажу', invitesDone: 'Все пять приглашений уже использованы',
      tier: 'Порог {n}: <b>{title}</b> открыт', reward: 'Награда ваша · промокод <b>{code}</b>',
      short: 'Не хватает <b>{n}</b> очков до «{title}»', cleared: 'Аккаунт очищен',
      points: '<b>+{n}</b> очков · {label}', tierPicked: 'Тариф <b>{name}</b> выбран · теперь событие ниже',
      venue: 'Переключили на <b>{city}</b>', coursePoints: '<b>{title}</b> открыт за очки',
      courseBuy: 'Демо-оплата: <b>{title}</b> добавлен в библиотеку',
      clubJoined: 'Демо-оплата: вы в клубе — ранний доступ на 48 часов включён'
    },
    logLabel: { signup: 'Регистрация', promo: 'Промокод друга {code}', checkin: 'Чек-ин: {name}',
                event: 'Бронь места: {name}', referral: 'Друг по ссылке ({n}/5)', reward: 'Награда: {title}',
                course: 'Курс: {title}' },
    confirmReset: 'Выйти из аккаунта и стереть очки, чек-ины, брони и награды?',
    footer: { text: 'Демо-проект: места в экипаже гоночных яхт в четырёх акваториях, карты городов, два ИИ-помощника и аккаунт с очками, наградами и реферальной программой. Цены, наличие мест и названия заведений вымышлены, аккаунт хранится локально в браузере.' }
  }
};

const Lang = (() => {
  const KEY = 'charterkey.lang';
  /* Английский — точка входа для всех. Русский включается только вручную
     и запоминается на этом устройстве. */
  let lang = 'en';
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'ru') lang = saved;
  } catch {}

  const get = () => lang;
  const set = v => {
    lang = (v === 'ru') ? 'ru' : 'en';
    try { localStorage.setItem(KEY, lang); } catch {}
    document.documentElement.lang = lang;
  };

  const T = f => (f && typeof f === 'object' && !Array.isArray(f)) ? (f[lang] ?? f.en) : f;

  const t = (path, vars) => {
    let v = path.split('.').reduce((o, k) => (o ? o[k] : undefined), I18N[lang]);
    if (v === undefined) v = path.split('.').reduce((o, k) => (o ? o[k] : undefined), I18N.en);
    if (typeof v !== 'string') return v;
    return vars ? v.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m)) : v;
  };

  const plural = (n, one, few, many) => {
    if (lang === 'en') return n === 1 ? one : few;
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  };

  return { get, set, T, t, plural };
})();

const T = Lang.T;
const t = Lang.t;

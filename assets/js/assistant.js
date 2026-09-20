/* Charter Key — ИИ-ассистент по сервису (ru/en): чартер, документы, аккаунт, бонусы. */

const Assistant = (() => {
  const L = (ru, en) => (Lang.get() === 'en' ? en : ru);
  const norm = s => s.toLowerCase().replace(/ё/g, 'е');
  const has = (q, list) => list.some(k => norm(q).includes(k));
  const M = '€';

  const TOPICS = [
    {
      id: 'greet',
      test: q => has(q, ['привет', 'здравствуй', 'добрый', 'hello', 'hi ', 'hey']),
      run: () => ({
        text: L(`Здравствуйте! Я ассистент <b>Charter Key</b> — отвечаю за поездку: лодки, брони, документы, бонусы и приглашения.\n\nПро город, еду и места спросите гида на соседней вкладке.`,
                `Hello! I am the <b>Charter Key</b> assistant — I handle the trip itself: boats, bookings, paperwork, rewards and invitations.\n\nFor the town, food and places, ask the guide on the next tab.`),
        chips: L(['Что входит в чартер?', 'Нужны ли права?', 'Как работают очки?'],
                 ['What is included?', 'Do I need a licence?', 'How do points work?'])
      })
    },
    {
      id: 'booking',
      test: q => has(q, ['заброниров', 'бронь', 'аренд', 'снять лодк', 'чартер', 'оформ', 'book', 'booking', 'rent', 'charter', 'reserve'])
        && !has(q, ['что входит', 'включ', 'в цену', 'доплат', 'отмен', 'перенос', 'included', 'include', 'cancel', 'change date']),
      run: () => ({
        text: L(
          `Бронирование занимает три шага:\n\n<b>1.</b> Выбираете неделю и лодку — стандартная смена суббота-суббота, короткие брони от 3 суток вне высокого сезона.\n<b>2.</b> Вносите 50% предоплаты, вторая половина — за 30 дней до старта.\n<b>3.</b> За неделю до выхода присылаем чек-лист: документы, список экипажа, провизия, трансфер.\n\nЧек-ин в марине с 17:00 в субботу, чек-аут до 9:00. Поздний чек-аут можно забрать за очки в аккаунте.`,
          `Booking takes three steps:\n\n<b>1.</b> Pick the week and the boat — the standard turnaround is Saturday to Saturday, with short bookings from 3 nights outside high season.\n<b>2.</b> Pay 50% up front; the rest is due 30 days before the start.\n<b>3.</b> A week before departure we send a checklist: paperwork, crew list, provisioning, transfer.\n\nCheck-in at the marina from 5pm on Saturday, check-out by 9am. A late check-out can be claimed with points from your account.`),
        chips: L(['Что входит в цену?', 'Когда бронировать?', 'Нужны ли права?'],
                 ['What is included?', 'When should I book?', 'Do I need a licence?'])
      })
    },
    {
      id: 'included',
      test: q => has(q, ['что входит', 'включ', 'в цену', 'что оплачива', 'доплат', 'сверх', 'included', 'include', 'extras', 'what do i pay']),
      run: () => ({
        text: L(
          `<b>В стоимость входит:</b> яхта с полной комплектацией, стоянка в базовой марине, страховка корпуса, постельное бельё и полотенца, дингy с мотором, навигация и связь на борту.\n\n<b>Оплачивается отдельно:</b> топливо по факту, стоянки в чужих маринах (${M}40–120 за ночь по сезону), финальная уборка (${M}150–250), провизия, шкипер и хостес, если берёте.\n\n<b>Депозит:</b> ${M}1500–3000 замораживается на карте и возвращается после сдачи лодки. Можно заменить на страховку невозврата депозита — ${M}150–250 за неделю.`,
          `<b>Included:</b> a fully equipped yacht, the berth at the home marina, hull insurance, bed linen and towels, a dinghy with outboard, navigation and comms on board.\n\n<b>Paid separately:</b> fuel as used, berths in other marinas (${M}40–120 a night depending on season), final cleaning (${M}150–250), provisioning, and a skipper or hostess if you take one.\n\n<b>Deposit:</b> ${M}1,500–3,000 is held on your card and released after the handover. It can be replaced with damage waiver insurance — ${M}150–250 per week.`),
        chips: L(['Нужны ли права?', 'Сколько стоит шкипер?', 'Как забронировать?'],
                 ['Do I need a licence?', 'How much is a skipper?', 'How do I book?'])
      })
    },
    {
      id: 'licence',
      test: q => has(q, ['прав', 'лиценз', 'сертификат', 'шкипер', 'капитан', 'без опыта', 'новичок', 'bareboat',
                         'licence', 'license', 'certificate', 'skipper', 'captain', 'beginner', 'experience']),
      run: () => ({
        text: L(
          `Для бэрбоута (лодка без экипажа) нужны два документа: международные права на управление яхтой (IYT, RYA Day Skipper, ISSA или национальные) и радиооператорская лицензия хотя бы у одного члена экипажа. Второго документа формально требуют не всегда, но в турецких маринах спрашивают.\n\nНет прав или нет уверенности после зимы — берите шкипера: ${M}180–220 в сутки плюс его питание. Через два-три дня большинство экипажей ходит само, а шкипер остаётся на подстраховке.\n\nЕсли опыт есть, но давно — скажите об этом при брони, дадим лодку попроще в управлении.`,
          `For a bareboat charter you need two documents: an international sailing licence (IYT, RYA Day Skipper, ISSA or a national equivalent) and a VHF radio operator certificate held by at least one crew member. The second is not always demanded on paper, but Turkish marinas do ask for it.\n\nNo licence, or no confidence after the winter? Take a skipper: ${M}180–220 a day plus their food. After two or three days most crews sail the boat themselves and the skipper becomes a safety net.\n\nIf you have experience but it is a few years old, say so when booking and we will give you a boat that is easier to handle.`),
        chips: L(['Сколько стоит шкипер?', 'Что входит в чартер?', 'Когда лучше идти?'],
                 ['How much is a skipper?', 'What is included?', 'When is the best time?'])
      })
    },
    {
      id: 'crew',
      test: q => has(q, ['экипаж', 'хостес', 'кок', 'повар', 'сколько человек', 'кают',
                         'crew', 'hostess', 'cook', 'chef', 'how many people', 'cabin', 'sleep']),
      run: () => ({
        text: L(
          `По людям считайте так: одна каюта — двое, лодка 45 футов комфортно держит 6–8 человек на неделю, формально сертифицирована на 10–12. На борту с восемью взрослыми тесно на третий день — берите на одну каюту меньше, чем кажется.\n\n<b>Шкипер</b> — ${M}180–220 в сутки, спит в носовой каюте или в салоне.\n<b>Хостес / кок</b> — ${M}150–180 в сутки: завтраки, обеды на ходу, уборка, швартовые концы.\n\nДетей до 12 лет обычно считают за полчеловека по спальным местам, но спасжилеты нужны на каждого — предупредите заранее, привезём нужные размеры.`,
          `Count people like this: one cabin sleeps two, a 45-footer is comfortable with 6–8 for a week and is formally certified for 10–12. With eight adults aboard it feels tight by day three — take one cabin more than you think you need.\n\n<b>Skipper</b> — ${M}180–220 a day, sleeping in the forepeak or the saloon.\n<b>Hostess / cook</b> — ${M}150–180 a day: breakfasts, lunches under way, cleaning, mooring lines.\n\nChildren under 12 usually count as half a berth, but every one of them needs a life jacket — tell us in advance and we will have the right sizes aboard.`),
        chips: L(['Что входит в чартер?', 'Что взять с собой?', 'Как забронировать?'],
                 ['What is included?', 'What should I pack?', 'How do I book?'])
      })
    },
    {
      id: 'when',
      test: q => has(q, ['когда', 'сезон', 'лучшее время', 'погод', 'ветер', 'жарко',
                         'when', 'season', 'best time', 'weather', 'wind', 'hot']),
      run: () => ({
        text: L(
          `<b>Май — начало июня:</b> +24 в воде, мало лодок, цены на 30–40% ниже пика. Лучшее соотношение всего.\n<b>Июль — август:</b> жара под +38, мелтеми к полудню разгоняется до 20 узлов, марины переполнены, пик цен.\n<b>Сентябрь — октябрь:</b> вода ещё тёплая, ветер ровный, туристов меньше. Göcek Race Week идёт в середине октября.\n\nБронировать высокий сезон стоит за 5–6 месяцев, май и октябрь спокойно ловятся за 2–3 месяца.`,
          `<b>May to early June:</b> 24 °C water, few boats, prices 30–40% below peak. The best overall balance.\n<b>July and August:</b> heat up to 38 °C, meltemi building to 20 knots by midday, marinas packed, prices at their highest.\n<b>September and October:</b> the water is still warm, the wind is steady, the crowds are gone. Göcek Race Week runs in mid-October.\n\nBook high season 5–6 months ahead; May and October are usually available 2–3 months out.`),
        chips: L(['Как забронировать?', 'Что входит в цену?', 'Календарь регат'],
                 ['How do I book?', 'What is included?', 'Regatta calendar'])
      })
    },
    {
      id: 'pack',
      test: q => has(q, ['взять с собой', 'что брать', 'вещи', 'чемодан', 'сумк', 'одежд', 'обув',
                         'pack', 'bring', 'luggage', 'suitcase', 'bag', 'clothes', 'shoes']),
      run: () => ({
        text: L(
          `Главное правило — <b>мягкая сумка, не чемодан</b>: жёсткий кофр некуда убрать, его придётся держать в каюте.\n\nЧто действительно нужно: обувь со светлой нескользящей подошвой, ветровка (ночью на переходе +16), крем 50+, шляпа с завязкой, очки на шнурке, лекарства от укачивания, пауэрбанк, полотенце для пляжа.\n\nЧто можно не везти: постельное, полотенца для душа, посуду, фен — всё на борту.`,
          `The main rule: <b>a soft bag, not a suitcase</b>. A hard case has nowhere to go and ends up living in your cabin.\n\nWhat you actually need: non-marking deck shoes, a windproof jacket (nights on passage drop to 16 °C), factor 50 sunscreen, a hat with a strap, sunglasses on a cord, seasickness tablets, a power bank, a beach towel.\n\nWhat to leave at home: bed linen, bath towels, kitchenware, a hairdryer — all of it is on board.`),
        chips: L(['Что входит в чартер?', 'Нужны ли права?', 'Провизия на борт'],
                 ['What is included?', 'Do I need a licence?', 'Provisioning'])
      })
    },
    {
      id: 'provision',
      test: q => has(q, ['провиз', 'еда на борт', 'продукт', 'закуп', 'вода на борт', 'питание',
                         'provision', 'groceries', 'food on board', 'shopping', 'water on board']),
      run: () => ({
        text: L(
          `Три варианта:\n\n<b>Сами</b> — супермаркет в десяти минутах от марины, закупка на неделю для шестерых выходит в ${M}300–450. Берите воду ящиками.\n<b>Список заранее</b> — присылаете перечень, к приходу экипажа всё загружено в лодку. Сервисный сбор ${M}30.\n<b>Стартовый набор</b> — завтраки, вода, фрукты, базовые специи на первые сутки. Его можно забрать за 700 очков в аккаунте.\n\nОбедать в море дешевле, чем в тавернах, а ужинать всё равно будете на берегу — на неделю закладывайте 4–5 завтраков и 3 обеда, не больше.`,
          `Three options:\n\n<b>Do it yourself</b> — the supermarket is ten minutes from the marina; a week for six costs ${M}300–450. Buy water by the case.\n<b>Send a list</b> — you send the list, everything is loaded before the crew arrives. Service fee ${M}30.\n<b>Starter pack</b> — breakfast, water, fruit and basic spices for the first day. You can claim it for 700 points from your account.\n\nLunches under way are cheaper than tavernas and you will eat dinner ashore anyway — plan for 4–5 breakfasts and 3 lunches a week, no more.`),
        chips: L(['Где ужинать в Гёчеке?', 'Что взять с собой?', 'Какие бонусы есть?'],
                 ['Where to eat in Göcek?', 'What should I pack?', 'What rewards are there?'])
      })
    },
    {
      id: 'cancel',
      test: q => has(q, ['отмен', 'перенос', 'вернуть деньг', 'возврат', 'заболел', 'не смогу',
                         'cancel', 'refund', 'reschedule', 'change date', 'illness', 'postpone']),
      run: () => ({
        text: L(
          `<b>Отмена:</b> более чем за 60 дней — возвращаем предоплату полностью за вычетом ${M}100 сбора. За 30–60 дней — половину. Менее 30 дней — средства остаются в депозите брони на год.\n\n<b>Перенос:</b> один раз бесплатно, если до старта больше 45 дней и новая дата в пределах сезона. Разница в цене по сезону доплачивается.\n\n<b>Погода:</b> если марина закрывает выход официальным запретом, потерянные сутки компенсируем днём чартера, а не деньгами.\n\nСтраховка отмены покупается отдельно при брони — около 4% стоимости.`,
          `<b>Cancellation:</b> more than 60 days out — the deposit is refunded in full minus a ${M}100 fee. Between 30 and 60 days — half. Under 30 days — the money stays as booking credit for a year.\n\n<b>Date change:</b> free once, if you are more than 45 days out and the new date is within the season. Any seasonal price difference is payable.\n\n<b>Weather:</b> if the marina issues an official no-sail order, lost days are compensated with charter days, not cash.\n\nCancellation insurance is bought separately at booking — around 4% of the charter price.`),
        chips: L(['Как забронировать?', 'Что входит в цену?', 'Когда лучше идти?'],
                 ['How do I book?', 'What is included?', 'When is the best time?'])
      })
    },
    {
      id: 'transfer',
      test: q => has(q, ['трансфер', 'аэропорт', 'даламан', 'добрат', 'как доехат', 'такси', 'виз',
                         'transfer', 'airport', 'dalaman', 'get there', 'taxi', 'visa']),
      run: () => ({
        text: L(
          `Ближайший аэропорт — <b>Даламан</b>, 25 минут до марины. Трансфер на 6 человек с багажом — ${M}60–80 в одну сторону, заказывается при брони.\n\nИз Стамбула и Антальи тоже летают, но это 3–4 часа дороги — для экипажа с сумками плохая идея.\n\nПривели трёх друзей по своей ссылке — трансфер становится бесплатным.`,
          `The nearest airport is <b>Dalaman</b>, 25 minutes from the marina. A transfer for six with luggage costs ${M}60–80 one way and is booked together with the charter.\n\nIstanbul and Antalya also work, but that is 3–4 hours on the road — a poor idea for a crew with bags.\n\nBring three friends through your link and the transfer becomes free.`),
        chips: L(['Реферальная программа', 'Как забронировать?', 'Что взять с собой?'],
                 ['Referral programme', 'How do I book?', 'What should I pack?'])
      })
    },
    {
      id: 'rewards',
      test: q => has(q, ['какие бонус', 'каталог', 'что можно получ', 'на что потрат', 'что дают',
                         'what rewards', 'reward catalogue', 'rewards are there', 'spend points']),
      run: (q, c) => ({
        text: L(
          `Каталог бонусов:\n\n` + REWARDS.map(r => `• <b>${T(r.title)}</b> — ${r.cost} очков. ${T(r.sub)}`).join('\n')
          + (c.state.registered ? `\n\nУ вас сейчас ${c.state.points} очков.` : `\n\nЧтобы копить и забирать — нужен аккаунт.`),
          `Reward catalogue:\n\n` + REWARDS.map(r => `• <b>${T(r.title)}</b> — ${r.cost} points. ${T(r.sub)}`).join('\n')
          + (c.state.registered ? `\n\nYou currently have ${c.state.points} points.` : `\n\nYou need an account to collect and claim them.`)),
        chips: c.state.registered
          ? L(['Как работают очки?', 'Реферальная программа'], ['How do points work?', 'Referral programme'])
          : L(['Зарегистрироваться', 'Как работают очки?'], ['Sign up', 'How do points work?'])
      })
    },
    {
      id: 'points',
      test: q => has(q, ['очк', 'балл', 'бонус', 'уровен', 'награ', 'промокод', 'скидк',
                         'point', 'reward', 'level', 'promo', 'discount']),
      run: (q, c) => {
        const s = c.state;
        if (!s.registered) {
          return {
            text: L(
              `Очки начисляются в аккаунт, поэтому первым шагом нужна регистрация — она же даёт стартовые <b>${BONUS.signup} очков</b>.\n\nДальше копятся так:\n• Чек-ин в месте на карте — 30–70 очков\n• Заявка на регату — 300–500\n• Друг по вашей ссылке — ${BONUS.inviter} вам и ${BONUS.invitee} ему\n\nТратятся на поздний чек-аут, провизию, SUP на неделю, скидку на чартер и сутки в подарок.`,
              `Points live in an account, so the first step is signing up — which itself gives you <b>${BONUS.signup} points</b>.\n\nAfter that they add up like this:\n• A check-in on the map — 30–70 points\n• A regatta entry — 300–500\n• A friend through your link — ${BONUS.inviter} for you, ${BONUS.invitee} for them\n\nThey are spent on late check-out, provisioning, SUP boards for the week, charter discounts and a free day.`),
            chips: L(['Зарегистрироваться', 'Реферальная программа', 'Что входит в чартер?'],
                     ['Sign up', 'Referral programme', 'What is included?'])
          };
        }
        const next = REWARDS.find(r => r.cost > s.points);
        return {
          text: L(
            `На вашем счету <b>${s.points}</b> очков, уровень «${T(c.level.name)}».\n\n`
            + (next ? `До бонуса «${T(next.title)}» не хватает <b>${next.cost - s.points}</b> очков.\n\n` : `Вам доступны все бонусы каталога.\n\n`)
            + `Быстрее всего: заявка на регату — до 500 за раз, приглашённый друг — ${BONUS.inviter}, чек-ины — 30–70 за место.`,
            `You have <b>${s.points}</b> points, level “${T(c.level.name)}”.\n\n`
            + (next ? `You are <b>${next.cost - s.points}</b> points short of “${T(next.title)}”.\n\n` : `Every reward in the catalogue is within reach.\n\n`)
            + `Fastest routes: a regatta entry gives up to 500 at once, an invited friend ${BONUS.inviter}, a check-in 30–70.`),
          chips: L(['Реферальная программа', 'Календарь регат', 'Какие бонусы есть?'],
                   ['Referral programme', 'Regatta calendar', 'What rewards are there?'])
        };
      }
    },
    {
      id: 'referral',
      test: q => has(q, ['реферал', 'пригласит', 'друз', 'ссылк', 'привест', 'referral', 'invite', 'friend', 'link', 'refer']),
      run: (q, c) => {
        const tiers = REF_TIERS.map(x => L(
          `• <b>${x.n} ${x.n === 1 ? 'друг' : x.n < 5 ? 'друга' : 'друзей'}</b> — ${T(x.title)}: ${T(x.sub)}`,
          `• <b>${x.n} ${x.n === 1 ? 'friend' : 'friends'}</b> — ${T(x.title)}: ${T(x.sub)}`)).join('\n');
        return {
          text: L(
            `Реферальная программа устроена просто: вы отправляете свою ссылку, друг регистрируется по ней и бронирует чартер. Вам — <b>${BONUS.inviter}</b> очков, ему — <b>${BONUS.invitee}</b> сразу на старте.\n\nДальше идут пороги:\n${tiers}`
            + (c.state.registered ? `\n\nВаша ссылка лежит в аккаунте, приглашено: <b>${c.state.referrals} из 5</b>.` : `\n\nСсылка появится в аккаунте сразу после регистрации.`),
            `The referral programme is simple: you send your link, a friend signs up through it and books a charter. You get <b>${BONUS.inviter}</b> points, they start with <b>${BONUS.invitee}</b>.\n\nThen come the tiers:\n${tiers}`
            + (c.state.registered ? `\n\nYour link is in your account; invited so far: <b>${c.state.referrals} of 5</b>.` : `\n\nThe link appears in your account as soon as you sign up.`)),
          chips: c.state.registered
            ? L(['Как работают очки?', 'Какие бонусы есть?', 'Как забронировать?'], ['How do points work?', 'What rewards are there?', 'How do I book?'])
            : L(['Зарегистрироваться', 'Как работают очки?'], ['Sign up', 'How do points work?'])
        };
      }
    },
    {
      id: 'account',
      test: q => has(q, ['регистрац', 'зарегистр', 'аккаунт', 'профил', 'войти', 'логин',
                         'sign up', 'register', 'account', 'profile', 'log in', 'login']),
      run: (q, c) => ({
        text: c.state.registered
          ? L(`Вы в аккаунте: <b>${c.state.name}</b>, уровень «${T(c.level.name)}», ${c.state.points} очков.\n\nВ аккаунте лежат чек-ины, заявки на регаты, бонусы с промокодами и реферальная ссылка. Данные хранятся локально в этом браузере — это демо-версия, без сервера.`,
              `You are signed in: <b>${c.state.name}</b>, level “${T(c.level.name)}”, ${c.state.points} points.\n\nYour account holds check-ins, regatta entries, rewards with promo codes and your referral link. Everything is stored locally in this browser — this is a demo, there is no server.`)
          : L(`Регистрация занимает минуту: имя, почта и, если есть, промокод друга. Сразу после неё на счёт падает <b>${BONUS.signup} очков</b>.\n\nБез аккаунта карта и оба ИИ работают полностью, но очки за чек-ины не сохраняются и бонусы забрать нельзя.`,
              `Signing up takes a minute: name, email and a friend's promo code if you have one. Straight after that <b>${BONUS.signup} points</b> land in your account.\n\nWithout an account the map and both AIs work in full, but check-ins are not saved and rewards cannot be claimed.`),
        chips: c.state.registered
          ? L(['Какие бонусы есть?', 'Реферальная программа'], ['What rewards are there?', 'Referral programme'])
          : L(['Зарегистрироваться', 'Как работают очки?'], ['Sign up', 'How do points work?'])
      })
    },
    {
      id: 'regatta',
      test: q => has(q, ['регат', 'гонк', 'календар', 'соревнован', 'race week', 'regatta', 'race', 'calendar']),
      run: () => ({
        text: L(
          `Регаты сезона в Гёчеке:\n\n` + REGATTAS.map(r => `• <b>${T(r.name)}</b> — ${T(r.date)}. ${T(r.fleet)}. ${T(r.slots)}. Заявка даёт <b>+${r.pts}</b> очков.`).join('\n')
          + `\n\nЛодку на неделю регаты бронируйте заранее — в эти даты флот разбирают за несколько месяцев.`,
          `Regattas in Göcek this season:\n\n` + REGATTAS.map(r => `• <b>${T(r.name)}</b> — ${T(r.date)}. ${T(r.fleet)}. ${T(r.slots)}. Entry is worth <b>+${r.pts}</b> points.`).join('\n')
          + `\n\nBook the boat for race week well ahead — the fleet goes months in advance on those dates.`),
        chips: L(['Как забронировать?', 'Нужны ли права?', 'Как работают очки?'],
                 ['How do I book?', 'Do I need a licence?', 'How do points work?'])
      })
    },
    {
      id: 'boats',
      test: q => has(q, ['лодк', 'яхт', 'катамаран', 'флот', 'модел', 'bavaria', 'lagoon',
                         'boat', 'yacht', 'catamaran', 'fleet', 'monohull', 'model']),
      run: () => ({
        text: L(
          `Что стоит в базе:\n\n<b>Монохалы 40–46 ft</b> (Bavaria, Jeanneau, Dufour) — 3–4 каюты, ${M}2 800–5 500 в неделю по сезону. Универсальный вариант.\n<b>Катамараны 42–46 ft</b> (Lagoon, Fountaine Pajot) — вдвое устойчивее, каюты разнесены по поплавкам, но дороже: ${M}6 000–11 000 и стоянка по двойному тарифу.\n<b>Монохалы 50+ ft</b> — под большой экипаж, требуют опыта или шкипера.\n\nЕсли в экипаже есть те, кого укачивает, или маленькие дети — берите катамаран, разница в комфорте больше, чем в цене.`,
          `What sits in the base:\n\n<b>Monohulls 40–46 ft</b> (Bavaria, Jeanneau, Dufour) — 3–4 cabins, ${M}2,800–5,500 a week by season. The all-round choice.\n<b>Catamarans 42–46 ft</b> (Lagoon, Fountaine Pajot) — twice as stable, cabins split between the hulls, but pricier: ${M}6,000–11,000 plus double marina rates.\n<b>Monohulls 50+ ft</b> — for a big crew, and they need real experience or a skipper.\n\nIf anyone in the crew gets seasick, or there are small children aboard, take the catamaran: the comfort gap is wider than the price gap.`),
        chips: L(['Что входит в цену?', 'Сколько человек на борту?', 'Как забронировать?'],
                 ['What is included?', 'How many people fit?', 'How do I book?'])
      })
    }
  ];

  function answer(query, c) {
    const q = norm(query);
    for (const topic of TOPICS) if (topic.test(q)) return topic.run(q, c);
    return {
      text: L(`Не нашёл точного ответа. Я отвечаю за поездку: лодки и брони, документы и права, экипаж, провизия, отмены, трансфер, очки, бонусы и приглашения.\n\nПро места в городе — еду, закаты, что поделать в штиль — спросите гида на соседней вкладке.`,
              `No exact answer for that one. I cover the trip: boats and bookings, paperwork and licences, crew, provisioning, cancellations, transfers, points, rewards and invitations.\n\nFor places in town — food, sunsets, what to do in flat calm — ask the guide on the next tab.`),
      chips: L(['Что входит в чартер?', 'Нужны ли права?', 'Реферальная программа'],
               ['What is included?', 'Do I need a licence?', 'Referral programme'])
    };
  }

  const WELCOME = state => ({
    text: L(
      `Я ассистент <b>Charter Key</b>. Отвечаю за всё, что вокруг лодки: брони, документы, экипаж, провизия, отмены, очки и приглашения.\n\n`
      + (state.registered ? `Вы в аккаунте — спрашивайте и про бонусы, они считаются по вашему балансу.`
                          : `Без регистрации отвечу на всё, но очки копиться не будут — аккаунт заводится за минуту и сразу даёт ${BONUS.signup} очков.`),
      `I am the <b>Charter Key</b> assistant. I handle everything around the boat: bookings, paperwork, crew, provisioning, cancellations, points and invitations.\n\n`
      + (state.registered ? `You are signed in — ask about rewards too, I count them against your balance.`
                          : `I will answer everything without an account, but points will not accumulate — signing up takes a minute and gives you ${BONUS.signup} points.`)),
    chips: state.registered
      ? L(['Что входит в чартер?', 'Нужны ли права?', 'Какие бонусы есть?'],
          ['What is included?', 'Do I need a licence?', 'What rewards are there?'])
      : L(['Зарегистрироваться', 'Что входит в чартер?', 'Нужны ли права?'],
          ['Sign up', 'What is included?', 'Do I need a licence?'])
  });

  return { answer, WELCOME };
})();

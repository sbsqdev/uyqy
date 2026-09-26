/* Charter Key — crew assistant (en/ru): berths, tiers, safety, logistics, academy, club, account. */

const Assistant = (() => {
  const L = (en, ru) => (Lang.get() === 'ru' ? ru : en);
  const norm = s => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9\s+-]/gi, ' ');
  const has = (q, list) => list.some(k => norm(q).includes(k));
  const tier = id => TIERS.find(t => t.id === id);
  const money = n => '$' + n.toLocaleString('en-US');
  const evAt = city => REGATTAS.filter(r => r.city === city);

  const tierLine = t => `• <b>${T(t.name)}</b> — ${money(t.price)} ${T(t.unit)}. ${T(t.line)}`;

  const TOPICS = [
    {
      id: 'greet',
      test: q => has(q, ['hello', 'hi ', 'hey', 'привет', 'здравствуй', 'добрый']),
      run: () => ({
        text: L(`Hello. I am the crew assistant — berths and tiers, what is included, safety kit, flights, money, courses and your account.\n\nFor restaurants, sunsets and lay days ashore, switch to the town guide.`,
                `Здравствуйте. Я ассистент экипажа: тарифы и что в них входит, снаряжение и безопасность, перелёты, деньги, курсы и ваш аккаунт.\n\nПро рестораны, закаты и дни без гонок — к гиду по городу на соседней вкладке.`),
        chips: L(['Which tier fits me?', 'What is included?', 'Do I need experience?'],
                 ['Какой тариф мне подходит?', 'Что входит в цену?', 'Нужен ли опыт?'])
      })
    },
    {
      id: 'venues',
      test: q => has(q, ['venue', 'where do you sail', 'which cities', 'locations', 'newport', 'san francisco', 'miami', 'annapolis', 'chesapeake', 'new haven', 'newhaven', 'connecticut',
                         'акватор', 'где вы ходите', 'какие города', 'ньюпорт', 'сан-франциско', 'майами', 'аннаполис', 'нью-хейвен'])
        && !has(q, ['easiest', 'hardest', 'beginner', 'first time', 'проще', 'сложнее', 'для новичка', 'первый раз']),
      run: () => ({
        text: L(`Five venues, the same class of boat and the same coaching in each:\n\n`
                + DESTINATIONS.map(d => `• <b>${T(d.city)}</b> ${d.flag} — ${T(d.region)}. ${T(d.wind)}. ${T(d.season)}.`).join('\n')
                + `\n\nAnnapolis is the tactical one, New Haven the cheapest week and a college fleet to train against, Newport the classic New England programme, San Francisco the hardest water on the list, Miami the warm winter option. Crews fly in from anywhere; switch venue with the tabs above the map and the calendar follows.`,
                `Пять акваторий, один класс лодки и один стандарт тренерской работы:\n\n`
                + DESTINATIONS.map(d => `• <b>${T(d.city)}</b> ${d.flag} — ${T(d.region)}. ${T(d.wind)}. ${T(d.season)}.`).join('\n')
                + `\n\nАннаполис — самая тактическая вода, Нью-Хейвен — самая недорогая неделя и студенческий флот рядом для сравнения, Ньюпорт — классическая Новая Англия, Сан-Франциско — самая сложная в списке, Майами — тёплая зима. Экипажи прилетают откуда угодно; переключить можно вкладками над картой, календарь поедет следом.`),
        chips: L(['Which tier fits me?', 'Show the calendar', 'Which venue is easiest?'],
                 ['Какой тариф мне подходит?', 'Покажи календарь', 'Какая акватория проще?'])
      })
    },
    {
      id: 'easiest',
      test: q => has(q, ['easiest', 'hardest', 'best for beginners', 'first time where', 'which venue',
                         'проще', 'сложнее', 'для новичка', 'куда первый раз', 'какая акватория']),
      run: () => ({
        text: L(`Ranked by how hard the water is:\n\n<b>Miami</b> — warm, flat inside the bay, 12–20 knots. The easiest first week by some distance.\n<b>New Haven</b> — short courses, moderate thermal breeze, a college fleet training next to you. The cheapest way to find out whether you like racing.\n<b>Annapolis</b> — light and shifty, shallow water. Physically the kindest; tactically the most demanding.\n<b>Newport</b> — colder water, proper tide, fog days. A real step up but forgiving.\n<b>San Francisco</b> — 25 knots and five knots of current. Come here second, not first.`,
                `По сложности воды:\n\n<b>Майами</b> — тепло, гладкая вода внутри залива, 12–20 узлов. Самая простая первая неделя с большим отрывом.\n<b>Нью-Хейвен</b> — короткие дистанции, умеренный термический бриз и студенческий флот рядом. Самый недорогой способ понять, нравятся ли вам гонки.\n<b>Аннаполис</b> — слабый и переменчивый ветер, мелко. Физически самая щадящая вода и самая требовательная тактически.\n<b>Ньюпорт</b> — холоднее, настоящее течение, туманные дни. Шаг вверх, но щадящий.\n<b>Сан-Франциско</b> — 25 узлов и пять узлов течения. Сюда стоит ехать вторым заходом, а не первым.`),
        chips: L(['Show the calendar', 'Which tier fits me?', 'Do I need experience?'],
                 ['Покажи календарь', 'Какой тариф мне подходит?', 'Нужен ли опыт?'])
      })
    },
    {
      id: 'tier',
      test: q => has(q, ['tier', 'which berth', 'rail', 'trim', 'helm', 'package', 'difference between',
                         'тариф', 'какое место', 'перила', 'шкотов', 'руль', 'пакет', 'разница между']),
      run: q => {
        if (has(q, ['helm', 'wheel', 'steer', 'drive', 'руль', 'штурвал', 'рулит'])) {
          const t = tier('helm');
          return {
            text: `<b>${T(t.name)}</b> — ${money(t.price)} ${T(t.unit)}. ${T(t.line)}\n\n`
              + T(t.includes).map(i => `• ${i}`).join('\n')
              + L(`\n\nIt is the only tier where wheel time is written into the week rather than shared out when the breeze is kind. ${t.spots} berths left this season.`,
                  `\n\nЭто единственный тариф, где время на руле записано в неделю, а не раздаётся, когда ветер добрый. Осталось мест в сезоне: ${t.spots}.`),
            chips: L(['How much helm time exactly?', 'What is included?', 'Show the calendar'],
                     ['Сколько именно часов на руле?', 'Что входит в цену?', 'Покажи календарь'])
          };
        }
        if (has(q, ['rail', 'first time', 'beginner', 'cheapest', 'never raced', 'no experience',
                    'перила', 'первый раз', 'новичок', 'дешев', 'не гонялся', 'без опыта'])) {
          const t = tier('rail');
          return {
            text: `<b>${T(t.name)}</b> — ${money(t.price)} ${T(t.unit)}. ${T(t.line)}\n\n`
              + T(t.includes).map(i => `• ${i}`).join('\n')
              + L(`\n\nThis is where most people start. You will hike, grind, trim the main under instruction and understand the boat by Wednesday.`,
                  `\n\nЗдесь начинает большинство. Будете откренивать, крутить лебёдки, работать с гика-шкотом под руководством тренера — и к среде поймёте лодку.`),
            chips: L(['Do I need experience?', 'What do I pack?', 'Show the calendar'],
                     ['Нужен ли опыт?', 'Что брать с собой?', 'Покажи календарь'])
          };
        }
        return {
          text: L(`Three tiers on the same boat, all racing the full event:\n\n${TIERS.map(tierLine).join('\n\n')}\n\nThe honest rule: Rail if you have never raced, Trim if you have and want to stop rotating, Helm if you want the wheel written into the contract.`,
                  `Три тарифа на одной лодке, все гоняют полное событие:\n\n${TIERS.map(tierLine).join('\n\n')}\n\nЧестное правило: «Перила» — если не гонялись, «Шкотовый» — если гонялись и надоела ротация, «Руль» — если хотите штурвал, записанный в договор.`),
          chips: L(['Which one fits me?', 'What is included?', 'Show the calendar'],
                   ['Какой мне подходит?', 'Что входит в цену?', 'Покажи календарь'])
        };
      }
    },
    {
      id: 'included',
      test: q => has(q, ['included', 'include', 'what do i pay', 'extras', 'hidden', 'on top', 'total cost',
                         'что входит', 'включ', 'в цену', 'доплат', 'сверх', 'итого']),
      run: () => ({
        text: L(`<b>In the berth price:</b> your bunk for the whole event, race entry, coaching, safety brief and drill, foul weather gear and a life jacket, fuel, the home berth and insurance for the boat.\n\n<b>On top:</b> flights, travel insurance, your share of food aboard and ashore ($250–400 for the week), the airport transfer, and hotel nights either side.\n\n<b>Never on top:</b> race entry fees, cleaning, fuel surcharges or equipment hire invented at the dock.`,
                `<b>В стоимость места входит:</b> койка на всё событие, стартовый взнос, работа тренера, брифинг и отработка аварийных действий, непромоканец и спасжилет, топливо, домашняя стоянка и страховка лодки.\n\n<b>Сверху:</b> перелёт, страховка поездки, ваша доля еды на борту и на берегу ($250–400 за неделю), трансфер из аэропорта и отель до или после.\n\n<b>Никогда не добавляется:</b> стартовый взнос, уборка, топливные сборы и «аренда снаряжения», придуманная на причале.`),
        chips: L(['Which tier fits me?', 'How do I get there?', 'Cancellation terms'],
                 ['Какой тариф мне подходит?', 'Как добираться?', 'Условия отмены'])
      })
    },
    {
      id: 'experience',
      test: q => has(q, ['experience', 'licence', 'license', 'certificate', 'beginner', 'qualified', 'fit enough', 'age',
                         'опыт', 'права', 'лиценз', 'сертификат', 'новичок', 'форма', 'возраст']),
      run: () => ({
        text: L(`No certificate is needed to race as crew — that only matters if you want to skipper your own boat later.\n\nWhat you do need: swim, move around a heeling boat, and take an instruction first and discuss it after. If you can climb a ladder with a bag in one hand, you can do the Rail tier.\n\nTrim assumes you have raced before. Helm & Tactics assumes real hours on the wheel — we will ask what you have done, and we will say so if the fit is wrong.`,
                `Сертификат для участия в экипаже не нужен — он важен, только если вы сами хотите быть шкипером.\n\nЧто нужно: уметь плавать, двигаться по кренящейся лодке и сначала выполнять команду, а обсуждать потом. Если поднимаетесь по трапу с сумкой в одной руке — тариф «Перила» ваш.\n\n«Шкотовый» предполагает, что вы гонялись. «Руль и тактика» — что у вас есть реальные часы за штурвалом. Мы спросим про опыт и честно скажем, если не сходится.`),
        chips: L(['Which tier fits me?', 'Is it safe?', 'What do I pack?'],
                 ['Какой тариф мне подходит?', 'Насколько безопасно?', 'Что брать с собой?'])
      })
    },
    {
      id: 'safety',
      test: q => has(q, ['safe', 'safety', 'liferaft', 'life raft', 'jacket', 'harness', 'storm', 'emergency', 'insurance',
                         'безопасн', 'плот', 'жилет', 'страховочн', 'шторм', 'аварий', 'страховк']),
      run: () => ({
        text: L(`Every boat is equipped to Offshore Special Regulations category 3 — category 2 for the ocean races:\n\n• Liferaft, EPIRB and AIS\n• Harness and tether for every crew member, jackstays fore and aft\n• Storm jib and trysail, two independent bilge pumps\n• Flares, fire extinguishers, full offshore first aid kit\n• Two VHF sets — fixed and handheld — plus a backup GPS\n\nEvery event opens with a safety brief and a man-overboard drill before the first race.`,
                `Каждая лодка укомплектована по офшорным правилам категории 3, для океанских гонок — категории 2:\n\n• Спасательный плот, аварийный буй и AIS\n• Страховочная система на каждого члена экипажа, леера в нос и корму\n• Штормовой стаксель и трисель, две независимые помпы\n• Пиротехника, огнетушители, полная офшорная аптечка\n• Две рации — стационарная и носимая — и резервный GPS\n\nКаждое событие начинается с брифинга и отработки «человек за бортом» до первой гонки.`),
        chips: L(['What if I get seasick?', 'Do I need experience?', 'What do I pack?'],
                 ['А если укачает?', 'Нужен ли опыт?', 'Что брать с собой?'])
      })
    },
    {
      id: 'seasick',
      test: q => has(q, ['seasick', 'sea sick', 'nausea', 'motion', 'укачает', 'укачива', 'тошн']),
      run: () => ({
        text: L(`Most people feel it at some point — it is not a character flaw and nobody aboard will make it one.\n\nWhat works, in order: take the tablets before you leave the dock rather than after you feel it; stay on deck; keep your eyes on the horizon; steer if you can, because the person driving is almost never sick; eat something dry every couple of hours.\n\nInshore racing is finished by mid-afternoon, so there is always an end in sight. Offshore, the watch system means you are never on deck more than four hours at a stretch.`,
                `Укачивает почти каждого хотя бы раз — это не недостаток характера, и на борту никто из этого истории не сделает.\n\nЧто работает, по порядку: таблетки до отхода от причала, а не когда началось; оставаться на палубе; смотреть на горизонт; сесть на руль, если можно, — рулевого почти никогда не укачивает; есть что-то сухое каждые пару часов.\n\nПрибрежные гонки заканчиваются к середине дня, так что финал близко. В офшоре вахтенная система не даёт быть на палубе больше четырёх часов подряд.`),
        chips: L(['Is it safe?', 'What do I pack?', 'Which venue is easiest?'],
                 ['Насколько безопасно?', 'Что брать с собой?', 'Какая акватория проще?'])
      })
    },
    {
      id: 'travel',
      test: q => has(q, ['fly', 'flight', 'airport', 'get there', 'get to', 'transfer', 'taxi', 'visa', 'arrive', 'travel', 'how far',
                         'перелёт', 'перелет', 'рейс', 'аэропорт', 'добрат', 'как доехат', 'трансфер', 'такси', 'виз', 'приеха']),
      run: (q, c) => ({
        text: L(`<b>${T(c.dest.city)}</b> — ${T(c.dest.airport)}.\n\n${T(c.dest.travel)}\n\nTwo rules wherever you are flying from: arrive the day before the first briefing rather than the morning of it, and check your own visa and entry requirements before you book. A delayed bag has ruined more first days than bad weather; a missing visa has ruined whole weeks.`,
                `<b>${T(c.dest.city)}</b> — ${T(c.dest.airport)}.\n\n${T(c.dest.travel)}\n\nДва правила, откуда бы вы ни летели: прилетайте за день до первого брифинга, а не утром в день брифинга, и заранее проверяйте свои визовые требования. Задержанный багаж испортил больше первых дней, чем погода, а несделанная виза — целые недели.`),
        chips: L(['Money and cards?', 'What do I pack?', 'What is included?'],
                 ['Деньги и карты?', 'Что брать с собой?', 'Что входит в цену?'])
      })
    },
    {
      id: 'money',
      test: q => has(q, ['money', 'card', 'cash', 'atm', 'currency', 'tip', 'exchange', 'payment',
                         'деньги', 'карт', 'наличн', 'банкомат', 'валют', 'чаевы', 'обмен', 'оплат']),
      run: (q, c) => ({
        text: L(`Berths are priced in US dollars wherever you book from, and cards work at every venue. Keep about $50 in local notes for tips, a taxi and the crew kitty.\n\nAt the venues in this demo, tipping runs 15–20% in restaurants and a few dollars a bag on the transfer. Tell your bank you are travelling, or the first dockside payment will be the one it declines.\n\nBudget $250–400 for the week ashore: food aboard, dinners in town, the transfer.`,
                `Места считаются в долларах, из какой бы страны вы ни бронировали, и карты принимают во всех акваториях. Держите наличными около пятидесяти долларов на чаевые, такси и общую кассу экипажа.\n\nВ акваториях этого демо чаевые — 15–20% в ресторанах и пара долларов за сумку на трансфере. Предупредите банк о поездке, иначе первый же платёж на причале он и отклонит.\n\nНа неделю на берегу заложите $250–400: еда на борту, ужины в городе, трансфер.`),
        chips: L(['How do I get there?', 'What is included?', 'Where to eat?'],
                 ['Как добираться?', 'Что входит в цену?', 'Где поесть?'])
      })
    },
    {
      id: 'pack',
      test: q => has(q, ['pack', 'bring', 'luggage', 'suitcase', 'bag', 'clothes', 'shoes', 'kit', 'wear',
                         'брать с собой', 'что взять', 'вещи', 'чемодан', 'сумк', 'одежд', 'обув']),
      run: () => ({
        text: L(`The main rule: <b>a soft bag, never a hard suitcase</b>. There is nowhere to stow a hard case and it will live in your bunk.\n\nBring: non-marking deck shoes, two layers you can race in, a warm mid-layer for night sailing, sunglasses on a cord, factor 50, a hat with a strap, a head torch, a power bank and seasickness tablets if you are unsure.\n\nLeave at home: bed linen, towels, kitchenware, anything white you care about. Foul weather gear and a life jacket are aboard for you.`,
                `Главное правило: <b>мягкая сумка, а не чемодан</b>. Жёсткий кофр некуда убрать, он будет жить на вашей койке.\n\nБерите: обувь со светлой нескользящей подошвой, два слоя для гонки, тёплый средний слой на ночь, очки на шнурке, крем 50+, шляпу с завязкой, налобный фонарь, пауэрбанк и таблетки от укачивания, если не уверены.\n\nОставьте дома: постельное, полотенца, посуду и всё белое, что вам дорого. Непромоканец и спасжилет уже на борту.`),
        chips: L(['Is it safe?', 'What if I get seasick?', 'How do I get there?'],
                 ['Насколько безопасно?', 'А если укачает?', 'Как добираться?'])
      })
    },
    {
      id: 'cancel',
      test: q => has(q, ['cancel', 'refund', 'reschedule', 'change date', 'postpone', 'illness',
                         'отмен', 'возврат', 'перенос', 'вернуть деньг', 'заболел', 'не смогу']),
      run: () => ({
        text: L(`<b>Cancellation:</b> more than 60 days out, the deposit is refunded in full minus a $100 admin fee. Between 30 and 60 days, half. Under 30 days the money stays as credit against any event for twelve months.\n\n<b>Moving dates:</b> free once, if you are more than 45 days out and the new date is in the same season.\n\n<b>Weather:</b> if the race committee abandons a day, you still have the boat, the coach and the town — but we do not refund a race that nature cancelled. If the port closes entirely, lost days come back as sailing days.\n\nTrip insurance is worth the 4% it costs; buy it when you book.`,
                `<b>Отмена:</b> больше чем за 60 дней — возвращаем предоплату полностью за вычетом $100 сбора. За 30–60 дней — половину. Меньше 30 дней — деньги остаются депозитом на любое событие в течение года.\n\n<b>Перенос даты:</b> бесплатно один раз, если до старта больше 45 дней и новая дата в том же сезоне.\n\n<b>Погода:</b> если гоночный комитет отменил день, у вас остаются лодка, тренер и город, но гонку, отменённую природой, мы не возвращаем деньгами. Если порт закрывают целиком — потерянные дни возвращаем днями на воде.\n\nСтраховка поездки стоит своих 4%; покупайте при бронировании.`),
        chips: L(['What is included?', 'Show the calendar', 'Which tier fits me?'],
                 ['Что входит в цену?', 'Покажи календарь', 'Какой тариф мне подходит?'])
      })
    },
    {
      id: 'calendar',
      test: q => has(q, ['calendar', 'dates', 'when', 'event', 'race week', 'regatta', 'offshore', 'availability', 'spots', 'berths left',
                         'календар', 'даты', 'когда', 'событи', 'регат', 'офшор', 'свободн', 'мест остал']),
      run: (q, c) => {
        const here = evAt(c.dest.id);
        const other = REGATTAS.filter(r => r.city !== c.dest.id);
        const row = r => {
          const city = DESTINATIONS.find(d => d.id === r.city);
          return `• <b>${T(r.name)}</b> — ${T(r.date)}, ${T(city.city)}. <b>${r.spots}</b> ${L(r.spots === 1 ? 'berth' : 'berths', 'мест')} ${L('left', 'свободно')}. +${r.pts} ${L('points', 'очков')}.`;
        };
        return {
          text: L(`In <b>${T(c.dest.city)}</b>:\n\n${here.map(row).join('\n')}\n\nElsewhere this season:\n${other.map(row).join('\n')}\n\nThe offshore races and the October week go first — usually six months out. Members see new dates 48 hours before anyone else.`,
                  `В городе <b>${T(c.dest.city)}</b>:\n\n${here.map(row).join('\n')}\n\nОстальное в сезоне:\n${other.map(row).join('\n')}\n\nОфшоры и октябрьскую неделю разбирают первыми — обычно за полгода. Члены клуба видят даты на 48 часов раньше.`),
          chips: L(['Which tier fits me?', 'Tell me about the club', 'Which venue is easiest?'],
                   ['Какой тариф мне подходит?', 'Расскажи про клуб', 'Какая акватория проще?'])
        };
      }
    },
    {
      id: 'club',
      test: q => has(q, ['club', 'membership', 'member', 'subscription', 'early access',
                         'клуб', 'подписк', 'членств', 'ранний доступ'])
        && !has(q, ['platform', 'white label', 'for clubs', 'own programme', 'own program', 'платформ', 'для клуб', 'своя программ']),
      run: () => ({
        text: L(`Membership is ${money(CLUB.price)} ${T(CLUB.unit)} (${money(CLUB.annual)} a year) and exists for one reason: the events people want sell out before they are announced publicly.\n\n`
                + T(CLUB.perks).map(p => `• ${p}`).join('\n')
                + `\n\nIf you sail with us once a year it pays for itself on the berth discount alone. Twice, and it is not a close call.`,
                `Подписка стоит ${money(CLUB.price)} ${T(CLUB.unit)} (${money(CLUB.annual)} в год) и существует по одной причине: события, которые людям нужны, разбирают до публичного анонса.\n\n`
                + T(CLUB.perks).map(p => `• ${p}`).join('\n')
                + `\n\nЕсли ходите с нами раз в год — окупается одной скидкой на место. Если дважды — вопрос даже не близкий.`),
        chips: L(['Show the calendar', 'What rewards are there?', 'Which tier fits me?'],
                 ['Покажи календарь', 'Какие награды есть?', 'Какой тариф мне подходит?'])
      })
    },
    {
      id: 'courses',
      test: q => has(q, ['course', 'academy', 'theory', 'rules', 'learn', 'study', 'video',
                         'курс', 'академи', 'теори', 'правил', 'учит', 'обучен', 'видео']),
      run: () => ({
        text: L(`The Academy is theory filmed on the boat, so you arrive having already seen the manoeuvre go wrong once:\n\n`
                + COURSES.map(c => `• <b>${T(c.title)}</b> — ${money(c.price)} or ${c.pts} points. ${T(c.time)}, ${T(c.level)}. ${T(c.line)}`).join('\n')
                + `\n\nRacing Rules Essentials comes free with the Trim tier; Helm & Tactics includes all four.`,
                `Академия — это теория, снятая на лодке: вы приезжаете, уже увидев, как манёвр идёт не так:\n\n`
                + COURSES.map(c => `• <b>${T(c.title)}</b> — ${money(c.price)} или ${c.pts} очков. ${T(c.time)}, ${T(c.level)}. ${T(c.line)}`).join('\n')
                + `\n\nКурс «Правила гонок» включён в тариф «Шкотовый», а «Руль и тактика» включает все четыре.`),
        chips: L(['Which tier fits me?', 'What rewards are there?', 'Tell me about the club'],
                 ['Какой тариф мне подходит?', 'Какие награды есть?', 'Расскажи про клуб'])
      })
    },
    {
      id: 'boat',
      test: q => has(q, ['boat', 'yacht', 'specification', 'spec', 'how big', 'sails', 'rig', 'cabin', 'sleep', 'shower',
                         'лодк', 'яхт', 'характеристик', 'какой размер', 'парус', 'кают', 'спать', 'душ на борту']),
      run: () => ({
        text: L(`<b>${BOAT.name}</b> — ${T(BOAT.type)}. ${T(BOAT.line)}\n\n`
                + BOAT.specs.map(s => `• ${T(s.label)}: ${T(s.value)}`).join('\n')
                + `\n\nEight race aboard, six for offshore legs so everyone gets a bunk on the off-watch.`,
                `<b>${BOAT.name}</b> — ${T(BOAT.type)}. ${T(BOAT.line)}\n\n`
                + BOAT.specs.map(s => `• ${T(s.label)}: ${T(s.value)}`).join('\n')
                + `\n\nВ гонке на борту восемь человек, в офшоре шесть — чтобы у каждого была койка на подвахте.`),
        chips: L(['Is it safe?', 'Which tier fits me?', 'Show the calendar'],
                 ['Насколько безопасно?', 'Какой тариф мне подходит?', 'Покажи календарь'])
      })
    },
    {
      id: 'rewards',
      test: q => has(q, ['what rewards', 'spend points', 'redeem', 'what can i get',
                         'какие награ', 'на что потрат', 'что можно получ', 'каталог']),
      run: (q, c) => ({
        text: L(`Points convert into sailing, not merchandise:\n\n`
                + REWARDS.map(r => `• <b>${T(r.title)}</b> — ${r.cost} points. ${T(r.sub)}`).join('\n')
                + (c.state.registered ? `\n\nYou have ${c.state.points} points.` : `\n\nYou need an account to collect and spend them.`),
                `Очки превращаются в хождение под парусом, а не в мерч:\n\n`
                + REWARDS.map(r => `• <b>${T(r.title)}</b> — ${r.cost} очков. ${T(r.sub)}`).join('\n')
                + (c.state.registered ? `\n\nУ вас ${c.state.points} очков.` : `\n\nЧтобы копить и тратить, нужен аккаунт.`)),
        chips: c.state.registered
          ? L(['How do points work?', 'Bring a friend'], ['Как работают очки?', 'Привести друга'])
          : L(['Sign up', 'How do points work?'], ['Зарегистрироваться', 'Как работают очки?'])
      })
    },
    {
      id: 'points',
      test: q => has(q, ['point', 'reward', 'loyalty', 'level', 'discount', 'promo',
                         'очк', 'балл', 'награ', 'уровен', 'скидк', 'промокод']),
      run: (q, c) => {
        const s = c.state;
        if (!s.registered) {
          return {
            text: L(`Points sit on an account, so the first step is signing up — which itself gives you <b>${BONUS.signup} points</b> and the prep checklist.\n\nThen they build up:\n• Holding a berth — 400 to 700 points\n• A friend through your link — ${BONUS.inviter} for you, ${BONUS.invitee} for them\n• A check-in at a place on the town map — 30 to 70\n\nThey are spent on helm hours, Academy courses and tier upgrades.`,
                    `Очки живут в аккаунте, поэтому первый шаг — регистрация: она сама по себе даёт <b>${BONUS.signup} очков</b> и чек-лист подготовки.\n\nДальше копятся так:\n• Бронь места — 400–700 очков\n• Друг по вашей ссылке — ${BONUS.inviter} вам и ${BONUS.invitee} ему\n• Чек-ин в месте на карте города — 30–70\n\nТратятся на часы за рулём, курсы академии и апгрейд тарифа.`),
            chips: L(['Sign up', 'What rewards are there?', 'Which tier fits me?'],
                     ['Зарегистрироваться', 'Какие награды есть?', 'Какой тариф мне подходит?'])
          };
        }
        const next = REWARDS.find(r => r.cost > s.points);
        return {
          text: L(`You have <b>${s.points}</b> points, level “${T(c.level.name)}”.\n\n`
                  + (next ? `You are <b>${next.cost - s.points}</b> short of “${T(next.title)}”.\n\n` : `Everything in the catalogue is within reach.\n\n`)
                  + `Fastest routes: hold a berth (400–700 at once), bring a friend (${BONUS.inviter}), check in ashore (30–70 each).`,
                  `У вас <b>${s.points}</b> очков, уровень «${T(c.level.name)}».\n\n`
                  + (next ? `До награды «${T(next.title)}» не хватает <b>${next.cost - s.points}</b>.\n\n` : `Весь каталог вам доступен.\n\n`)
                  + `Быстрее всего: бронь места (400–700 за раз), приглашённый друг (${BONUS.inviter}), чек-ины на берегу (30–70 за место).`),
          chips: L(['What rewards are there?', 'Bring a friend', 'Show the calendar'],
                   ['Какие награды есть?', 'Привести друга', 'Покажи календарь'])
        };
      }
    },
    {
      id: 'referral',
      test: q => has(q, ['referral', 'invite', 'friend', 'link', 'refer',
                         'реферал', 'пригласит', 'друз', 'ссылк', 'привест']),
      run: (q, c) => ({
        text: L(`You send your link, a friend signs up through it and books a berth. You get <b>${BONUS.inviter}</b> points, they start with <b>${BONUS.invitee}</b>.\n\n`
                + REF_TIERS.map(x => `• <b>${x.n} ${x.n === 1 ? 'friend' : 'friends'}</b> — ${T(x.title)}: ${T(x.sub)}`).join('\n')
                + (c.state.registered ? `\n\nYour link is in your account; ${c.state.referrals} of 5 so far.` : `\n\nThe link appears in your account the moment you sign up.`),
                `Вы отправляете ссылку, друг регистрируется по ней и бронирует место. Вам <b>${BONUS.inviter}</b> очков, ему <b>${BONUS.invitee}</b> на старте.\n\n`
                + REF_TIERS.map(x => `• <b>${x.n} ${Lang.plural(x.n, 'друг', 'друга', 'друзей')}</b> — ${T(x.title)}: ${T(x.sub)}`).join('\n')
                + (c.state.registered ? `\n\nСсылка в вашем аккаунте, приглашено ${c.state.referrals} из 5.` : `\n\nСсылка появится в аккаунте сразу после регистрации.`)),
        chips: c.state.registered
          ? L(['What rewards are there?', 'Show the calendar'], ['Какие награды есть?', 'Покажи календарь'])
          : L(['Sign up', 'How do points work?'], ['Зарегистрироваться', 'Как работают очки?'])
      })
    },
    {
      id: 'account',
      test: q => has(q, ['sign up', 'register', 'account', 'profile', 'log in', 'login', 'checklist',
                         'регистрац', 'зарегистр', 'аккаунт', 'профил', 'войти', 'чек-лист']),
      run: (q, c) => ({
        text: c.state.registered
          ? L(`You are signed in: <b>${c.state.name}</b>, ${T(c.level.name)}, ${c.state.points} points.\n\nThe account holds your check-ins, the berths you are holding, rewards with their codes, the prep checklist and your referral link. It is stored locally in this browser — this is a demo, there is no server behind it.`,
              `Вы в аккаунте: <b>${c.state.name}</b>, ${T(c.level.name)}, ${c.state.points} очков.\n\nВ аккаунте лежат чек-ины, забронированные места, награды с промокодами, чек-лист подготовки и реферальная ссылка. Всё хранится локально в браузере — это демо, сервера за ним нет.`)
          : L(`Signing up takes a minute: name, email, and a friend's code if you have one. It unlocks <b>${T(LEAD_MAGNET.title)}</b> and puts <b>${BONUS.signup} points</b> on the account.\n\nWithout it the map, the quiz and both assistants work in full — but nothing is saved.`,
              `Регистрация занимает минуту: имя, почта и промокод друга, если есть. Она открывает <b>${T(LEAD_MAGNET.title)}</b> и кладёт на счёт <b>${BONUS.signup} очков</b>.\n\nБез неё карта, подбор и оба ИИ работают полностью — но ничего не сохраняется.`),
        chips: c.state.registered
          ? L(['What rewards are there?', 'Bring a friend'], ['Какие награды есть?', 'Привести друга'])
          : L(['Sign up', 'Which tier fits me?'], ['Зарегистрироваться', 'Какой тариф мне подходит?'])
      })
    },
    {
      id: 'platform',
      test: q => has(q, ['what is charter key', 'who are you', 'how does this work', 'is this a platform', 'white label', 'for clubs',
                         'run our own', 'run this', 'my own program', 'our own program', 'our boats', 'our club', 'our team',
                         'что такое charter key', 'кто вы', 'как это работает', 'это платформа', 'для клуб', 'для команд',
                         'своя программ', 'наши лодки', 'наш клуб']),
      run: () => ({
        text: L(`Charter Key is the crew platform behind a race programme, not a travel agency. A club or a team runs its calendar, berth tiers, academy and membership on it; crew get the booking flow, the two assistants, the city map and a points account.\n\nThe four venues here are what the demo ships with — the platform is not tied to a country, a fleet or a class. If you run a programme and want it on your own boats and your own dates, that is a fifteen-minute conversation, not an integration project.`,
                `Charter Key — это платформа для гоночной программы, а не турагентство. Клуб или команда ведёт на ней календарь, тарифы мест, академию и подписку; экипаж получает бронирование, двух ассистентов, карту города и аккаунт с очками.\n\nЧетыре акватории здесь — то, с чем едет демо. Платформа не привязана к стране, флоту или классу. Если у вас своя программа и вы хотите её на своих лодках и датах — это разговор на пятнадцать минут, а не интеграционный проект.`),
        chips: L(['Show the calendar', 'Which tier fits me?', 'What is included?'],
                 ['Покажи календарь', 'Какой тариф мне подходит?', 'Что входит в цену?'])
      })
    },
    {
      id: 'solo',
      test: q => has(q, ['alone', 'solo', 'by myself', 'know anyone', 'who else', 'crew like',
                         'один', 'одному', 'в одиночку', 'кто ещё', 'какой экипаж']),
      run: () => ({
        text: L(`Most people come alone. A typical crew is eight people who did not know each other on Saturday and have a group chat by Wednesday.\n\nAges run from late twenties to sixties, usually half first-timers and half returning. If you are coming as a pair we keep you in the same watch unless you ask otherwise.`,
                `Большинство приезжает в одиночку. Обычный экипаж — восемь человек, которые в субботу не были знакомы, а к среде завели общий чат.\n\nВозраст от двадцати с небольшим до шестидесяти, обычно половина впервые, половина возвращается. Если едете вдвоём — ставим в одну вахту, если не попросите иначе.`),
        chips: L(['Which tier fits me?', 'What do I pack?', 'Show the calendar'],
                 ['Какой тариф мне подходит?', 'Что брать с собой?', 'Покажи календарь'])
      })
    }
  ];

  function answer(query, c) {
    const q = norm(query);
    for (const topic of TOPICS) if (topic.test(q)) return topic.run(q, c);
    return {
      text: L(`I do not have an exact answer for that. I cover the boat and the trip: venues, tiers and what each includes, experience needed, safety kit, flights and transfers, money, packing, cancellations, the Academy, the Club, points and referrals.\n\nAnything ashore — food, sunsets, lay days — is the town guide on the other tab.`,
              `Точного ответа у меня нет. Я отвечаю за лодку и поездку: акватории, тарифы и что в них входит, нужный опыт, снаряжение и безопасность, перелёты и трансферы, деньги, сборы, отмены, академия, клуб, очки и приглашения.\n\nВсё, что на берегу — еда, закаты, дни без гонок — у гида по городу на соседней вкладке.`),
      chips: L(['Which tier fits me?', 'What is included?', 'Is it safe?'],
               ['Какой тариф мне подходит?', 'Что входит в цену?', 'Насколько безопасно?'])
    };
  }

  const WELCOME = state => ({
    text: L(`I am the crew assistant. Venues, berths and tiers, what is included, safety, flights, money, packing, courses and your account — ask in plain words.\n\n`
            + (state.registered ? `You are signed in, so I can answer about your points and rewards too.`
                                : `Without an account I will still answer everything — but points and the prep checklist need one, and it takes a minute.`),
            `Я ассистент экипажа. Акватории, места и тарифы, что входит в цену, безопасность, перелёты, деньги, сборы, курсы и ваш аккаунт — спрашивайте обычными словами.\n\n`
            + (state.registered ? `Вы в аккаунте, поэтому могу отвечать и про ваши очки с наградами.`
                                : `Без аккаунта отвечу на всё, но очки и чек-лист требуют регистрации — это минута.`)),
    chips: state.registered
      ? L(['Which tier fits me?', 'What is included?', 'Show the calendar'],
          ['Какой тариф мне подходит?', 'Что входит в цену?', 'Покажи календарь'])
      : L(['Which tier fits me?', 'Do I need experience?', 'Which venue is easiest?'],
          ['Какой тариф мне подходит?', 'Нужен ли опыт?', 'Какая акватория проще?'])
  });

  return { answer, WELCOME };
})();

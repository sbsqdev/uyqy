/* Charter Key — двуязычный контент (ru/en).
   Текстовые поля хранятся как { ru, en }; выбор языка — в i18n.js.
   Содержимое демонстрационное: названия заведений и условия вымышлены. */

const DESTINATIONS = [
  {
    id: 'gocek',
    city:   { ru: 'Гёчек', en: 'Göcek' },
    region: { ru: 'Турция · залив Фетхие', en: 'Türkiye · Gulf of Fethiye' },
    blurb:  { ru: 'Двенадцать островов, сосны до самой воды и марина, где швартуется половина Эгейского флота.',
              en: 'Twelve islands, pines running down to the water and a marina where half the Aegean fleet ties up.' },
    season: { ru: 'Май — октябрь', en: 'May — October' },
    wind:   { ru: 'Мелтеми, 8–14 узлов после полудня', en: 'Meltemi, 8–14 kn after midday' },
    water:  { ru: '+24 °C', en: '24 °C / 75 °F' },
    regatta:{ ru: 'Göcek Race Week · 12–18 октября', en: 'Göcek Race Week · 12–18 October' },
    accent: '#3ddad7',
    map: {
      viewBox: '0 0 1000 620',
      land: [
        'M0,0 H1000 V96 C930,132 902,196 826,214 C742,234 712,288 624,290 C548,292 512,246 428,240 C336,234 300,178 214,186 C142,192 96,150 40,150 C22,150 8,120 0,104 Z',
        'M0,392 C58,372 96,404 150,426 C206,449 214,512 178,556 C146,596 62,606 0,592 Z',
        'M868,620 C848,552 886,498 946,472 C976,459 1000,452 1000,452 V620 Z'
      ],
      islands: [
        'M556,432 C596,414 654,428 662,460 C670,492 626,516 586,508 C544,500 522,448 556,432 Z',
        'M712,352 C744,338 786,352 788,378 C790,404 754,420 724,410 C694,400 686,364 712,352 Z',
        'M392,472 C420,460 452,472 452,494 C452,516 420,528 396,518 C372,508 368,482 392,472 Z',
        'M268,368 C288,360 310,370 308,386 C306,402 282,410 266,400 C250,390 252,374 268,368 Z'
      ],
      route: 'M470,340 C560,300 660,318 742,262 C800,222 852,248 878,300',
      labels: [
        { x: 12, y: 8,  text: { ru: 'п-ов Гёчек',        en: 'Göcek peninsula' } },
        { x: 60, y: 76, text: { ru: 'о. Яссыджа',         en: 'Yassıca isl.' } },
        { x: 75, y: 60, text: { ru: 'о. Терсане',         en: 'Tersane isl.' } },
        { x: 34, y: 86, text: { ru: 'бухта Бедри Рахми',  en: 'Bedri Rahmi bay' } }
      ]
    },
    points: [
      { id: 'gc-marina', cat: 'yacht', x: 30, y: 33, pts: 40,
        name:  { ru: 'Марина «Гёчек Харбор»', en: 'Göcek Harbour Marina' },
        price: { ru: '€55–90 / ночь', en: '€55–90 / night' },
        time:  { ru: '24/7', en: '24/7' },
        desc:  { ru: 'Гостевые места на 180 лодок, вода и электричество на пирсе, душевые и прачечная — база на время чартера.',
                 en: 'Berths for 180 visiting boats, water and power on the pier, showers and laundry — your base for the week.' },
        tip:   { ru: 'Брони на неделю регаты закрываются за два месяца. Пирс D — ближе всего к судейской.',
                 en: 'Race-week berths sell out two months ahead. Pier D sits closest to the race office.' },
        tags:   ['яхта','марина','швартовка','сервис','база','душ','заправка'],
        tagsEn: ['yacht','marina','berth','service','base','shower','fuel'] },

      { id: 'gc-bedri', cat: 'see', x: 37, y: 80, pts: 60,
        name:  { ru: 'Бухта Бедри Рахми', en: 'Bedri Rahmi Bay' },
        price: { ru: 'бесплатно', en: 'free' },
        time:  { ru: 'весь день', en: 'all day' },
        desc:  { ru: 'Тихая бухта с рыбой, написанной на скале художником Бедри Рахми в 1974-м. Глубина у берега — можно подойти на тузике.',
                 en: 'A quiet bay with a fish painted on the rock by artist Bedri Rahmi in 1974. Deep enough by the shore to come in on the dinghy.' },
        tip:   { ru: 'Приходите до 10:00 — днём здесь якорится десяток гулетов.',
                 en: 'Arrive before 10am — a dozen gulets anchor here by midday.' },
        tags:   ['закат','фото','природа','тихо','история','снорклинг','романтика'],
        tagsEn: ['sunset','photo','nature','quiet','history','snorkelling','romantic'] },

      { id: 'gc-yassica', cat: 'do', x: 61, y: 75, pts: 70,
        name:  { ru: 'Острова Яссыджа', en: 'Yassıca Islands' },
        price: { ru: '€25 с человека', en: '€25 per person' },
        time:  { ru: '09:00–18:00', en: '09:00–18:00' },
        desc:  { ru: 'Плоские островки с песчаной отмелью между ними. Прозрачная вода, снорклинг и ленивые перебежки вброд с острова на остров.',
                 en: 'Flat islets with a sandbar between them. Clear water, snorkelling and lazy wades from one island to the next.' },
        tip:   { ru: 'Возьмите маску: под южным мысом — поле морской травы с каракатицами.',
                 en: 'Bring a mask: there is a seagrass field with cuttlefish off the southern point.' },
        tags:   ['снорклинг','вода','sup','дети','команда','день','активность','штиль'],
        tagsEn: ['snorkelling','water','sup','kids','crew','day','activity','calm'] },

      { id: 'gc-tersane', cat: 'eat', x: 74, y: 57, pts: 50,
        name:  { ru: 'Таверна «Терсане»', en: 'Tersane Taverna' },
        price: { ru: '₺900–1600', en: '₺900–1600' },
        time:  { ru: '12:00–23:00', en: '12:00–23:00' },
        desc:  { ru: 'Рыба дня на углях, мезе из шести тарелок и столы прямо на понтоне. Швартовка гостевая — подходите с воды.',
                 en: 'Catch of the day over charcoal, six-plate meze and tables right on the pontoon. Guest mooring — come in from the water.' },
        tip:   { ru: 'Просите лаврак на соли и салат из дикой руколы — это местная кухня, а не туристическая витрина.',
                 en: 'Ask for salt-baked sea bass and the wild rocket salad — that is the local kitchen, not the tourist menu.' },
        tags:   ['рыба','ужин','вода','дорого','вечер','после гонки','команда','мезе'],
        tagsEn: ['fish','dinner','waterfront','pricey','evening','after racing','crew','meze'] },

      { id: 'gc-kliver', cat: 'eat', x: 24, y: 25, pts: 30,
        name:  { ru: 'Кофейня «Кливер»', en: 'Jib Coffee' },
        price: { ru: '₺180–400', en: '₺180–400' },
        time:  { ru: '07:00–15:00', en: '07:00–15:00' },
        desc:  { ru: 'Завтраки с менеменом и симитом в семь утра — то есть за час до брифинга. Кофе навынос в стаканах, которые держатся в подстаканнике рубки.',
                 en: 'Menemen and simit breakfasts from seven — an hour before the briefing. Takeaway cups that actually fit the cockpit holder.' },
        tip:   { ru: 'Заказ на команду можно оставить с вечера, соберут к назначенному времени.',
                 en: 'Order for the whole crew the night before and it will be packed for your time.' },
        tags:   ['завтрак','кофе','утро','дёшево','быстро','перед гонкой'],
        tagsEn: ['breakfast','coffee','morning','cheap','quick','before racing'] },

      { id: 'gc-goat', cat: 'see', x: 16, y: 20, pts: 55,
        name:  { ru: 'Смотровая «Козий мыс»', en: 'Goat Cape Viewpoint' },
        price: { ru: 'бесплатно', en: 'free' },
        time:  { ru: 'круглосуточно', en: 'open 24h' },
        desc:  { ru: 'Двадцать минут вверх по сосновой тропе — и весь залив с островами лежит под вами. Лучшая точка на закат во всём районе.',
                 en: 'Twenty minutes up a pine trail and the whole gulf lies below you. The best sunset spot in the area.' },
        tip:   { ru: 'Выходите за 50 минут до заката, фонарик на обратную дорогу обязателен.',
                 en: 'Set off 50 minutes before sunset and bring a torch for the way back.' },
        tags:   ['закат','вид','фото','прогулка','бесплатно','романтика','вечер'],
        tagsEn: ['sunset','view','photo','walk','free','romantic','evening'] },

      { id: 'gc-school', cat: 'do', x: 33, y: 40, pts: 65,
        name:  { ru: 'Школа яхтинга «Галс»', en: 'Tack Sailing School' },
        price: { ru: '€60 / занятие', en: '€60 / session' },
        time:  { ru: '09:00–19:00', en: '09:00–19:00' },
        desc:  { ru: 'Двухчасовые тренировки на швертботах: старты, повороты оверштаг, работа с гиком. Берут и новичков из команды поддержки.',
                 en: 'Two-hour dinghy sessions: starts, tacking, boom handling. They take complete beginners from the shore crew too.' },
        tip:   { ru: 'Тренировка стартовой процедуры перед регатой снимает половину нервов на первой гонке.',
                 en: 'Practising the start sequence before the regatta removes half the nerves in race one.' },
        tags:   ['обучение','яхта','активность','команда','спорт','день'],
        tagsEn: ['lesson','sailing','activity','crew','sport','day'] },

      { id: 'gc-sup', cat: 'do', x: 44, y: 44, pts: 45,
        name:  { ru: 'SUP-станция «Рассвет»', en: 'Dawn SUP Station' },
        price: { ru: '€20 / час', en: '€20 / hour' },
        time:  { ru: '06:30–11:00', en: '06:30–11:00' },
        desc:  { ru: 'Доски выдают с 6:30, пока залив похож на стекло. Круг вдоль сосен до дальнего мыса — примерно час спокойным ходом.',
                 en: 'Boards from 6:30, while the bay is still glass. A loop along the pines to the far cape takes about an hour at an easy pace.' },
        tip:   { ru: 'Идеальный вариант для дня без ветра, когда гонки отменили.',
                 en: 'The right call for a windless day when racing is cancelled.' },
        tags:   ['sup','утро','штиль','активность','вода','спокойно','дёшево'],
        tagsEn: ['sup','morning','calm','activity','water','quiet','cheap'] },

      { id: 'gc-stag', cat: 'night', x: 25, y: 51, pts: 40,
        name:  { ru: 'Бар «Штаг»', en: 'The Stay Bar' },
        price: { ru: '₺250–600', en: '₺250–600' },
        time:  { ru: '18:00–02:00', en: '18:00–02:00' },
        desc:  { ru: 'Терраса над пирсом, живая гитара по четвергам и доска, куда экипажи вешают вымпелы. После финала здесь собирается весь флот.',
                 en: 'A terrace over the pier, live guitar on Thursdays and a board where crews pin their burgees. After the final race the whole fleet ends up here.' },
        tip:   { ru: 'Столы у перил занимают к 19:00 — бронируйте днём.',
                 en: 'Rail tables are gone by 7pm — book during the day.' },
        tags:   ['ночь','бар','вечеринка','команда','после гонки','музыка'],
        tagsEn: ['night','bar','party','crew','after racing','music'] },

      { id: 'gc-bazaar', cat: 'see', x: 12, y: 10, pts: 35,
        name:  { ru: 'Субботний базар', en: 'Saturday Market' },
        price: { ru: 'от ₺100', en: 'from ₺100' },
        time:  { ru: 'сб 08:00–16:00', en: 'Sat 08:00–16:00' },
        desc:  { ru: 'Ряды с оливками, сыром из горных деревень и специями на развес. Половина команд закупает сюда провизию на неделю.',
                 en: 'Rows of olives, mountain-village cheese and loose spices. Half the crews do their week of provisioning here.' },
        tip:   { ru: 'Торгуйтесь на второй половине дня — цены падают к закрытию.',
                 en: 'Bargain in the afternoon — prices drop towards closing.' },
        tags:   ['рынок','продукты','дёшево','утро','провизия','колорит'],
        tagsEn: ['market','groceries','cheap','morning','provisioning','local'] },

      { id: 'gc-hamam', cat: 'do', x: 15, y: 40, pts: 50,
        name:  { ru: 'Хамам «Дениз»', en: 'Deniz Hammam' },
        price: { ru: '₺700', en: '₺700' },
        time:  { ru: '10:00–22:00', en: '10:00–22:00' },
        desc:  { ru: 'Классический хамам с пенным массажем. После трёх дней на руле спине это нужно сильнее, чем ещё один ужин.',
                 en: 'A classic hammam with foam massage. After three days on the helm your back needs this more than another dinner.' },
        tip:   { ru: 'Идите вечером после перехода — утром мышцы работают хуже.',
                 en: 'Go in the evening after a passage — muscles respond worse in the morning.' },
        tags:   ['восстановление','спа','вечер','расслабиться','после гонки','спина'],
        tagsEn: ['recovery','spa','evening','relax','after racing','back'] },

      { id: 'gc-rig', cat: 'yacht', x: 32, y: 17, pts: 35,
        name:  { ru: 'Сервис «Такелаж 24»', en: 'Rigging 24 Service' },
        price: { ru: 'по работам', en: 'by the job' },
        time:  { ru: '08:00–20:00', en: '08:00–20:00' },
        desc:  { ru: 'Паруса, стоячий такелаж, мелкий ремонт корпуса. В дни регаты работают до последнего клиента.',
                 en: 'Sails, standing rigging, small hull repairs. During race week they stay open until the last customer.' },
        tip:   { ru: 'Порванную шкаторину берут в работу день в день, если привезти до 14:00.',
                 en: 'A torn luff gets same-day service if you bring it in before 2pm.' },
        tags:   ['ремонт','яхта','паруса','сервис','срочно'],
        tagsEn: ['repair','yacht','sails','service','urgent'] }
    ]
  }
];

const CATEGORIES = [
  { id: 'all',   icon: '◎', label: { ru: 'Всё',          en: 'All' } },
  { id: 'eat',   icon: '🍽', label: { ru: 'Что поесть',   en: 'Where to eat' } },
  { id: 'see',   icon: '👁', label: { ru: 'Что увидеть',  en: 'What to see' } },
  { id: 'do',    icon: '⛵', label: { ru: 'Что поделать', en: 'What to do' } },
  { id: 'night', icon: '🌙', label: { ru: 'Вечер и ночь', en: 'Evening' } },
  { id: 'yacht', icon: '⚓', label: { ru: 'Яхт-сервис',   en: 'Yacht services' } }
];

const CAT_META = {
  eat:   { color: '#ff8a5c', label: { ru: 'Еда',        en: 'Food' } },
  see:   { color: '#7c9cff', label: { ru: 'Посмотреть', en: 'Sights' } },
  do:    { color: '#3ddad7', label: { ru: 'Занятие',    en: 'Activity' } },
  night: { color: '#c78bff', label: { ru: 'Ночь',       en: 'Night' } },
  yacht: { color: '#ffd166', label: { ru: 'Яхтинг',     en: 'Yachting' } }
};

const COLLECTIONS = [
  { id: 'calm',   match: ['штиль','sup','активность','природа','день без ветра'],
    title: { ru: 'Штиль: ветра нет',        en: 'Flat calm, no wind' },
    sub:   { ru: 'Четыре часа, которые не жалко', en: 'Four hours worth spending' } },
  { id: 'after',  match: ['после гонки','ужин','команда','рыба'],
    title: { ru: 'Ужин после перехода',     en: 'Dinner after the passage' },
    sub:   { ru: 'Где собирается весь флот', en: 'Where the fleet gathers' } },
  { id: 'dawn',   match: ['утро','штиль','завтрак','кофе'],
    title: { ru: 'Рассветный режим',        en: 'The dawn routine' },
    sub:   { ru: 'С 6 до 9 утра',           en: 'From 6 to 9am' } },
  { id: 'family', match: ['дети','семья','пляж','отдых'],
    title: { ru: 'С командой поддержки',    en: 'With the shore crew' },
    sub:   { ru: 'Дети, родители, нелюбители качки', en: 'Kids, parents, non-sailors' } },
  { id: 'body',   match: ['восстановление','спа','баня','расслабиться'],
    title: { ru: 'Восстановить спину',      en: 'Fix your back' },
    sub:   { ru: 'После трёх дней на руле', en: 'After three days on the helm' } },
  { id: 'wow',    match: ['впечатление','закат','вид','панорама'],
    title: { ru: 'Одно большое впечатление', en: 'One big moment' },
    sub:   { ru: 'То, ради чего стоит остаться на день', en: 'Worth staying an extra day for' } }
];

const REGATTAS = [
  { id: 'r1', name: 'Göcek Race Week', pts: 400,
    date:  { ru: '12–18 октября 2026', en: '12–18 October 2026' },
    fleet: { ru: 'ORC, Bavaria 46 one-design', en: 'ORC, Bavaria 46 one-design' },
    slots: { ru: 'мест: 14 из 60', en: '14 of 60 slots left' },
    level: { ru: 'Открытая', en: 'Open' } },
  { id: 'r2', name: { ru: 'Весенний кубок залива', en: 'Spring Gulf Cup' }, pts: 300,
    date:  { ru: '8–10 мая 2026', en: '8–10 May 2026' },
    fleet: { ru: 'Круизные яхты 40+ ft', en: 'Cruising yachts 40+ ft' },
    slots: { ru: 'мест: 26 из 40', en: '26 of 40 slots left' },
    level: { ru: 'Любительская', en: 'Amateur' } },
  { id: 'r3', name: { ru: 'Переход Гёчек — Бодрум', en: 'Göcek — Bodrum Passage' }, pts: 500,
    date:  { ru: '2–6 ноября 2026', en: '2–6 November 2026' },
    fleet: { ru: 'Круизные яхты 40+ ft', en: 'Cruising yachts 40+ ft' },
    slots: { ru: 'мест: 30 из 40', en: '30 of 40 slots left' },
    level: { ru: 'Переход', en: 'Passage' } }
];

const REWARDS = [
  { id: 'b1', cost: 400,  code: 'CK-LATE-18',
    title: { ru: 'Поздний чек-аут с лодки', en: 'Late check-out' },
    sub:   { ru: 'Сдать яхту в 18:00 вместо 9:00', en: 'Hand the yacht back at 6pm instead of 9am' } },
  { id: 'b2', cost: 700,  code: 'CK-PROV-01',
    title: { ru: 'Провизия на первый день', en: 'First-day provisioning' },
    sub:   { ru: 'Стартовый набор на борт к приходу экипажа', en: 'Starter pack loaded before the crew arrives' } },
  { id: 'b3', cost: 1200, code: 'CK-SUP-7D',
    title: { ru: 'SUP на всю неделю', en: 'SUP boards for the week' },
    sub:   { ru: 'Две доски на борт, без доплаты', en: 'Two boards on board, no extra charge' } },
  { id: 'b4', cost: 2000, code: 'CK-CHR-15',
    title: { ru: 'Скидка 15% на чартер', en: '15% off your charter' },
    sub:   { ru: 'На следующее бронирование, любая лодка', en: 'On your next booking, any boat' } },
  { id: 'b5', cost: 3500, code: 'CK-DAY-01',
    title: { ru: 'Сутки чартера в подарок', en: 'A free charter day' },
    sub:   { ru: 'Плюс день к брони от 7 суток', en: 'Added to any booking of 7 nights or more' } }
];

const BONUS = { signup: 300, inviter: 250, invitee: 150 };

const REF_TIERS = [
  { n: 1, title: { ru: 'SUP на неделю', en: 'SUP for the week' },
          sub:   { ru: 'Как только первый друг забронирует чартер', en: 'As soon as your first friend books a charter' } },
  { n: 3, title: { ru: 'Трансфер из Даламана', en: 'Dalaman transfer' },
          sub:   { ru: 'Встреча экипажа в аэропорту, туда и обратно', en: 'Crew pick-up at the airport, both ways' } },
  { n: 5, title: { ru: 'Сутки чартера в подарок', en: 'A free charter day' },
          sub:   { ru: 'Плюс день к вашей следующей броне', en: 'Added to your next booking' } }
];

const LEVELS = [
  { id: 'l1', from: 0,    name: { ru: 'Юнга',    en: 'Deckhand' } },
  { id: 'l2', from: 500,  name: { ru: 'Матрос',  en: 'Crew' } },
  { id: 'l3', from: 1500, name: { ru: 'Шкипер',  en: 'Skipper' } },
  { id: 'l4', from: 3500, name: { ru: 'Капитан', en: 'Captain' } },
  { id: 'l5', from: 7000, name: { ru: 'Адмирал', en: 'Admiral' } }
];

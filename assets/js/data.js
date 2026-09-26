/* Charter Key — content. Demo data: venue names, prices and availability are illustrative. */

const BOAT = {
  name: 'Looping',
  type: '36 ft offshore one-design',
  designer: 'Farr-designed hull, fractional rig',
  specs: [
    { label: 'Length', value: '36 ft / 11.0 m' },
    { label: 'Crew aboard', value: '8 racing, 6 offshore' },
    { label: 'Sails', value: 'Carbon laminate inventory, 2 spinnakers' },
    { label: 'Offshore kit', value: 'Liferaft, AIS, EPIRB, storm jib, trysail' },
    { label: 'Comfort', value: 'Diesel cabin heater, hot water, 3 cabins' },
    { label: 'Rating', value: 'IRC endorsed certificate' }
  ]
};

const DESTINATION = {
  id: 'gocek',
  city: 'Göcek',
  region: 'Türkiye · Gulf of Fethiye',
  blurb: 'Twelve islands, pines running down to the water and a marina where half the Aegean fleet ties up.',
  season: 'March — November',
  wind: 'Meltemi, 8–14 kn after midday',
  water: '24 °C / 75 °F in season',
  airport: 'Dalaman (DLM) — 25 min by road',
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
      { x: 12, y: 8,  text: 'Göcek peninsula' },
      { x: 60, y: 76, text: 'Yassıca isl.' },
      { x: 75, y: 60, text: 'Tersane isl.' },
      { x: 34, y: 86, text: 'Bedri Rahmi bay' }
    ]
  },
  points: [
    { id: 'gc-marina', cat: 'yacht', x: 30, y: 33, pts: 40,
      name: 'Göcek Harbour Marina', price: '€55–90 / night', time: '24/7',
      desc: 'Berths for 180 visiting boats, water and power on the pier, showers and laundry — the base for every race week.',
      tip: 'Race-week berths sell out two months ahead. Pier D is closest to the race office.',
      tags: ['yacht','marina','berth','service','base','shower','fuel'] },

    { id: 'gc-bedri', cat: 'see', x: 37, y: 80, pts: 60,
      name: 'Bedri Rahmi Bay', price: 'free', time: 'all day',
      desc: 'A quiet bay with a fish painted on the rock by a Turkish artist in 1974. Deep enough by the shore to come in on the dinghy.',
      tip: 'Arrive before 10am — a dozen gulets anchor here by midday.',
      tags: ['sunset','photo','nature','quiet','history','snorkelling','romantic'] },

    { id: 'gc-yassica', cat: 'do', x: 61, y: 75, pts: 70,
      name: 'Yassıca Islands', price: '€25 per person', time: '09:00–18:00',
      desc: 'Flat islets with a sandbar between them. Clear water, snorkelling and lazy wades from one island to the next.',
      tip: 'Bring a mask: there is a seagrass field with cuttlefish off the southern point.',
      tags: ['snorkelling','water','sup','kids','crew','day','activity','calm'] },

    { id: 'gc-tersane', cat: 'eat', x: 74, y: 57, pts: 50,
      name: 'Tersane Taverna', price: '₺900–1600 (~$25–45)', time: '12:00–23:00',
      desc: 'Catch of the day over charcoal, six-plate meze and tables right on the pontoon. Guest mooring — come in from the water.',
      tip: 'Ask for salt-baked sea bass and the wild rocket salad — that is the local kitchen, not the tourist menu.',
      tags: ['fish','dinner','waterfront','pricey','evening','after racing','crew','meze'] },

    { id: 'gc-kliver', cat: 'eat', x: 24, y: 25, pts: 30,
      name: 'Jib Coffee', price: '₺180–400 (~$5–11)', time: '07:00–15:00',
      desc: 'Menemen and simit breakfasts from seven — an hour before the skippers briefing. Takeaway cups that fit the cockpit holder.',
      tip: 'Order for the whole crew the night before and it will be packed for your time.',
      tags: ['breakfast','coffee','morning','cheap','quick','before racing'] },

    { id: 'gc-goat', cat: 'see', x: 16, y: 20, pts: 55,
      name: 'Goat Cape Viewpoint', price: 'free', time: 'open 24h',
      desc: 'Twenty minutes up a pine trail and the whole gulf lies below you. The best sunset spot in the area.',
      tip: 'Set off 50 minutes before sunset and bring a torch for the way back.',
      tags: ['sunset','view','photo','walk','free','romantic','evening'] },

    { id: 'gc-school', cat: 'do', x: 33, y: 40, pts: 65,
      name: 'Dinghy Training Centre', price: '€60 / session', time: '09:00–19:00',
      desc: 'Two-hour dinghy sessions: starts, tacking, boom handling. Useful the day before your first race week.',
      tip: 'Practising the start sequence in a dinghy removes half the nerves in race one.',
      tags: ['lesson','sailing','activity','crew','sport','day','training'] },

    { id: 'gc-sup', cat: 'do', x: 44, y: 44, pts: 45,
      name: 'Dawn SUP Station', price: '€20 / hour', time: '06:30–11:00',
      desc: 'Boards from 6:30, while the bay is still glass. A loop along the pines to the far cape takes about an hour at an easy pace.',
      tip: 'The right call on a lay day when racing is abandoned for lack of wind.',
      tags: ['sup','morning','calm','activity','water','quiet','cheap','lay day'] },

    { id: 'gc-stag', cat: 'night', x: 25, y: 51, pts: 40,
      name: 'The Stay Bar', price: '₺250–600 (~$7–17)', time: '18:00–02:00',
      desc: 'A terrace over the pier, live guitar on Thursdays and a board where crews pin their burgees. After the last race the whole fleet ends up here.',
      tip: 'Rail tables are gone by 7pm — book during the day.',
      tags: ['night','bar','party','crew','after racing','music'] },

    { id: 'gc-bazaar', cat: 'see', x: 12, y: 10, pts: 35,
      name: 'Saturday Market', price: 'from ₺100', time: 'Sat 08:00–16:00',
      desc: 'Rows of olives, mountain-village cheese and loose spices. Half the crews do their week of provisioning here.',
      tip: 'Bargain in the afternoon — prices drop towards closing.',
      tags: ['market','groceries','cheap','morning','provisioning','local'] },

    { id: 'gc-hamam', cat: 'do', x: 15, y: 40, pts: 50,
      name: 'Deniz Hammam', price: '₺700 (~$20)', time: '10:00–22:00',
      desc: 'A classic hammam with foam massage. After three days of hiking the rail your back needs this more than another dinner.',
      tip: 'Go in the evening after racing — muscles respond worse in the morning.',
      tags: ['recovery','spa','evening','relax','after racing','back'] },

    { id: 'gc-rig', cat: 'yacht', x: 32, y: 17, pts: 35,
      name: 'Rigging 24 Service', price: 'by the job', time: '08:00–20:00',
      desc: 'Sails, standing rigging, small hull repairs. During race week they stay open until the last customer.',
      tip: 'A torn luff gets same-day service if you bring it in before 2pm.',
      tags: ['repair','yacht','sails','service','urgent'] }
  ]
};

const DESTINATIONS = [DESTINATION];

const CATEGORIES = [
  { id: 'all',   icon: '◎', label: 'All' },
  { id: 'eat',   icon: '🍽', label: 'Where to eat' },
  { id: 'see',   icon: '👁', label: 'What to see' },
  { id: 'do',    icon: '⛵', label: 'What to do' },
  { id: 'night', icon: '🌙', label: 'Evening' },
  { id: 'yacht', icon: '⚓', label: 'Yacht services' }
];

const CAT_META = {
  eat:   { color: '#ff8a5c', label: 'Food' },
  see:   { color: '#7c9cff', label: 'Sights' },
  do:    { color: '#3ddad7', label: 'Activity' },
  night: { color: '#c78bff', label: 'Night' },
  yacht: { color: '#ffd166', label: 'Yachting' }
};

const COLLECTIONS = [
  { id: 'calm',   title: 'Lay day, no wind',        sub: 'Four hours worth spending',        match: ['lay day','calm','sup','activity','nature'] },
  { id: 'after',  title: 'Dinner after racing',     sub: 'Where the fleet gathers',          match: ['after racing','dinner','crew','fish'] },
  { id: 'dawn',   title: 'The dawn routine',        sub: 'From 6 to 9am',                    match: ['morning','calm','breakfast','coffee'] },
  { id: 'family', title: 'With the shore crew',     sub: 'Partners, kids, non-sailors',      match: ['kids','crew','water','snorkelling'] },
  { id: 'body',   title: 'Fix your back',           sub: 'After three days on the rail',     match: ['recovery','spa','relax'] },
  { id: 'wow',    title: 'One big moment',          sub: 'Worth staying an extra day for',   match: ['sunset','view','photo','nature'] }
];

/* ── Berths: three tiers on the same boat ── */
const TIERS = [
  {
    id: 'rail', name: 'Rail', tag: 'First time on a race boat',
    price: 890, unit: '/ race week', pts: 300,
    line: 'You sail the whole regatta as active crew — hiking, grinding, learning the boat from the inside.',
    includes: [
      'Berth aboard for the full event, 6 nights',
      'Pre-race briefing and safety drill',
      'Rail, grinding and mainsheet trim under instruction',
      'Daily debrief with the tactician',
      'Foul weather gear and life jacket provided'
    ],
    spots: 4
  },
  {
    id: 'trim', name: 'Trim', tag: 'You have raced before', featured: true,
    price: 1490, unit: '/ race week', pts: 500,
    line: 'A defined position for the week — trim, pit or bow — with the coaching to actually own it.',
    includes: [
      'Everything in Rail',
      'One position for the whole week, not a rotation',
      'Two coached training days before the first gun',
      'Video review of your manoeuvres',
      'Racing Rules Essentials course included ($149)'
    ],
    spots: 3
  },
  {
    id: 'helm', name: 'Helm & Tactics', tag: 'You want the wheel',
    price: 2690, unit: '/ race week', pts: 900,
    line: 'Guaranteed time steering the boat and calling the beat, with a professional beside you, not instead of you.',
    includes: [
      'Everything in Trim',
      '6+ hours on the helm across training days',
      'You drive at least one scored race',
      'One-to-one tactics sessions, start to finish',
      'Support with your own IRC endorsed certificate',
      'All Academy courses included ($596)'
    ],
    spots: 2
  }
];

/* ── Events ── */
const REGATTAS = [
  { id: 'r1', name: 'Winter Trophy Series', date: '14–19 February 2027', level: 'Open',
    fleet: 'IRC mixed fleet, 40+ boats', spots: 3, pts: 400,
    line: 'Five races in flat water and steady breeze. The friendliest event of the year for a first regatta.' },
  { id: 'r2', name: 'Spring Cup', date: '8–10 May 2027', level: 'Amateur',
    fleet: 'IRC cruising and racing divisions', spots: 6, pts: 300,
    line: 'Three days, short courses, long evenings. Half the fleet is on its first or second event.' },
  { id: 'r3', name: 'Race Week', date: '11–17 October 2027', level: 'Rated',
    fleet: 'IRC and one-design, 60+ boats', spots: 2, pts: 500,
    line: 'The main event of the season. Coastal and windward-leeward races, full race village ashore.' },
  { id: 'r4', name: 'Offshore Passage — 400 nm', date: '2–6 November 2027', level: 'Offshore',
    fleet: 'Offshore category 3, night sailing', spots: 4, pts: 700,
    line: 'Four days and three nights at sea, watch system, spinnaker under the stars. The one people come back for.' }
];

/* ── Academy: theory before you step aboard ── */
const COURSES = [
  { id: 'c1', title: 'Racing Rules Essentials', price: 149, pts: 1200, time: '2h 40m', level: 'All levels',
    line: 'The twelve rules that decide 90% of protests, explained on the water instead of on a whiteboard.' },
  { id: 'c2', title: 'Spinnaker in 25+ Knots', price: 189, pts: 1500, time: '1h 50m', level: 'Intermediate',
    line: 'Hoist, gybe and drop when it is genuinely windy — filmed on board, mistakes included.' },
  { id: 'c3', title: 'Starts and the First Beat', price: 149, pts: 1200, time: '2h 10m', level: 'Intermediate',
    line: 'Line bias, time-on-distance, and what to do when you are buried ten seconds after the gun.' },
  { id: 'c4', title: 'Sail Trim and Rig Setup', price: 109, pts: 900, time: '1h 30m', level: 'All levels',
    line: 'Headstay tension, backstay, jib cars: what each control actually does to boat speed.' }
];

/* ── Membership: the reason to stay in touch off-season ── */
const CLUB = {
  price: 39, unit: '/ month', annual: 390,
  perks: [
    'Berths open to members 48 hours before anyone else — the popular events sell out in that window',
    '10% off every berth and every Academy course',
    'Monthly live race debrief with the coaching team',
    'Crew list access: find a boat for events we do not run',
    'Two guest passes a year for a training day'
  ]
};

/* ── Crew match quiz ── */
const QUIZ = [
  {
    id: 'exp', q: 'How much racing have you actually done?',
    options: [
      { id: 'none', label: 'None — I have sailed, but never raced', score: { rail: 3, trim: 0, helm: 0 } },
      { id: 'some', label: 'A few club races or one regatta',        score: { rail: 2, trim: 2, helm: 0 } },
      { id: 'lots', label: 'Several seasons, I know my position',    score: { rail: 0, trim: 3, helm: 2 } },
      { id: 'own',  label: 'I own or skipper a boat',                score: { rail: 0, trim: 1, helm: 3 } }
    ]
  },
  {
    id: 'want', q: 'What do you want out of the week?',
    options: [
      { id: 'fun',   label: 'Sun, speed and good company',       score: { rail: 3, trim: 1, helm: 0 } },
      { id: 'skill', label: 'To finally own one position',       score: { rail: 1, trim: 3, helm: 1 } },
      { id: 'helm',  label: 'Time on the wheel',                 score: { rail: 0, trim: 1, helm: 3 } },
      { id: 'cert',  label: 'Miles and paperwork for my ticket', score: { rail: 1, trim: 2, helm: 2 } }
    ]
  },
  {
    id: 'pace', q: 'Which week sounds better?',
    options: [
      { id: 'social',  label: 'Racing by day, long dinners ashore', score: { rail: 3, trim: 1, helm: 0 } },
      { id: 'serious', label: 'Debrief until we find the two seconds', score: { rail: 0, trim: 2, helm: 3 } },
      { id: 'mix',     label: 'Both — hard racing, proper evenings', score: { rail: 1, trim: 3, helm: 1 } }
    ]
  }
];

/* ── Logistics: the effort side of the equation ── */
const FAQ = [
  { id: 'f1', q: 'Do I need experience or a licence to join?',
    a: 'For the Rail tier, no — you need to be able to swim, move around a moving boat and follow instructions under pressure. Trim assumes you have raced before. Helm & Tactics assumes real time on the wheel. No certificate is required to race as crew; you only need paperwork if you intend to skipper a boat yourself.' },
  { id: 'f2', q: 'How do I get there?',
    a: 'Fly into Dalaman (DLM), 25 minutes from the marina. From the US that is one stop, usually Istanbul; from Europe there are direct flights all season. We arrange a shared transfer for arriving crew — $20–30 a head, free for members at three referrals. Arrive the day before the first briefing, not the morning of it.' },
  { id: 'f3', q: 'What does it cost beyond the berth?',
    a: 'Budget $250–400 for the week: your share of food aboard, marina dinners ashore, and the transfer. Flights, travel insurance and any nights in a hotel before or after are yours. Nothing else is added later — no fuel surcharge, no cleaning fee, no race entry on top.' },
  { id: 'f4', q: 'What do I pack?',
    a: 'A soft bag, never a hard suitcase — there is nowhere to stow one. Non-marking deck shoes, two layers you can race in, a warm mid-layer for night sailing, sunglasses on a cord, factor 50, a hat with a strap and seasickness tablets if you are unsure. Foul weather gear and a life jacket are aboard for you.' },
  { id: 'f5', q: 'Is it safe? What is on board?',
    a: 'The boat is equipped to Offshore Special Regulations category 3: liferaft, EPIRB, AIS, harnesses and tethers for every crew member, jackstays, storm jib and trysail, two independent bilge pumps, flares and a full first aid kit. Every event starts with a safety brief and a man-overboard drill before the first race.' },
  { id: 'f6', q: 'Money and cards in Türkiye?',
    a: 'Visa and Mastercard work everywhere in the marina and in most restaurants. ATMs dispense Turkish lira with a per-transaction cap, so draw cash in two goes rather than one. Do not change money at the airport; the rate in town is better. Tipping is 10% and usually in cash.' },
  { id: 'f7', q: 'What if I get seasick?',
    a: 'Most people do at some point. Take the tablets before you leave the dock, not after you feel it, stay on deck, keep your eyes on the horizon and eat something dry. Inshore racing is over by mid-afternoon, so there is an end in sight. On the offshore passage we run a watch system with real rest.' },
  { id: 'f8', q: 'Can I come alone?',
    a: 'Most people do. A typical crew is eight people who did not know each other on Saturday and have a group chat by Wednesday. If you are coming as a pair we keep you in the same watch; if you want opposite watches, say so.' }
];

/* ── Loyalty ── */
const REWARDS = [
  { id: 'b1', cost: 400,  code: 'CK-LATE-18', title: 'Late check-out',           sub: 'Stay aboard until 6pm on the last day' },
  { id: 'b2', cost: 700,  code: 'CK-PROV-01', title: 'First-day provisioning',   sub: 'Starter pack loaded before the crew arrives' },
  { id: 'b3', cost: 900,  code: 'CK-TRIM-04', title: 'Sail Trim course',         sub: 'Any one Academy module, free' },
  { id: 'b4', cost: 2000, code: 'CK-HELM-02', title: 'Two extra helm hours',     sub: 'Added to your next training day' },
  { id: 'b5', cost: 3500, code: 'CK-UPGR-01', title: 'Tier upgrade',             sub: 'Rail to Trim, or Trim to Helm, on your next event' }
];

const BONUS = { signup: 300, inviter: 250, invitee: 150 };

const REF_TIERS = [
  { n: 1, title: 'Academy course',   sub: 'Any module, as soon as your first friend books' },
  { n: 3, title: 'Free transfer',    sub: 'Airport pick-up for you and your crew, both ways' },
  { n: 5, title: 'A free race week', sub: 'Rail berth at any event in the calendar' }
];

const LEVELS = [
  { id: 'l1', from: 0,    name: 'Deckhand' },
  { id: 'l2', from: 500,  name: 'Crew' },
  { id: 'l3', from: 1500, name: 'Trimmer' },
  { id: 'l4', from: 3500, name: 'Watch Leader' },
  { id: 'l5', from: 7000, name: 'Skipper' }
];

const LEAD_MAGNET = {
  title: 'The Offshore Prep Checklist',
  sub: 'Everything that goes in the bag, on the boat and in your head before a first offshore race.',
  items: [
    'Personal kit list by temperature band, with what to leave at home',
    'The category 3 safety inventory, explained item by item',
    'Watch systems that work with six people, and the one that does not',
    'Seasickness: what actually helps, in the order to try it',
    'The twelve rules that decide almost every protest'
  ]
};

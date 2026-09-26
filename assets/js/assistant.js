/* Charter Key — crew assistant: berths, tiers, safety, logistics, academy, club, account. */

const Assistant = (() => {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9\s+-]/gi, ' ');
  const has = (q, list) => list.some(k => norm(q).includes(k));
  const tier = id => TIERS.find(t => t.id === id);
  const money = n => '$' + n.toLocaleString('en-US');

  const tierLine = t => `• <b>${t.name}</b> — ${money(t.price)} ${t.unit}. ${t.line}`;

  const TOPICS = [
    {
      id: 'greet',
      test: q => has(q, ['hello', 'hi ', 'hey', 'good morning']),
      run: () => ({
        text: `Hello. I am the crew assistant — berths and tiers, what is included, safety kit, flights, money, courses and your account.\n\nFor restaurants, sunsets and lay days ashore, switch to the town guide on the other tab.`,
        chips: ['Which tier fits me?', 'What is included?', 'Do I need experience?']
      })
    },
    {
      id: 'tier',
      test: q => has(q, ['tier', 'which berth', 'rail', 'trim', 'helm', 'level', 'package', 'difference between']),
      run: q => {
        if (has(q, ['helm', 'wheel', 'steer', 'drive'])) {
          const t = tier('helm');
          return {
            text: `<b>${t.name}</b> — ${money(t.price)} ${t.unit}. ${t.line}\n\n`
              + t.includes.map(i => `• ${i}`).join('\n')
              + `\n\nIt is the only tier where wheel time is written into the week rather than shared out when the breeze is kind. ${t.spots} berths left this season.`,
            chips: ['How much helm time exactly?', 'What is included?', 'Show the calendar']
          };
        }
        if (has(q, ['rail', 'first time', 'beginner', 'cheapest', 'never raced', 'no experience', 'new to'])) {
          const t = tier('rail');
          return {
            text: `<b>${t.name}</b> — ${money(t.price)} ${t.unit}. ${t.line}\n\n`
              + t.includes.map(i => `• ${i}`).join('\n')
              + `\n\nThis is where most people start. You will hike, grind, trim the main under instruction and understand the boat by Wednesday.`,
            chips: ['Do I need experience?', 'What do I pack?', 'Show the calendar']
          };
        }
        return {
          text: `Three tiers on the same boat, all racing the full event:\n\n${TIERS.map(tierLine).join('\n\n')}\n\nThe honest rule: pick Rail if you have never raced, Trim if you have and want to stop rotating, Helm if you want the wheel written into the contract.`,
          chips: ['Which one fits me?', 'What is included?', 'Show the calendar']
        };
      }
    },
    {
      id: 'included',
      test: q => has(q, ['included', 'include', 'what do i pay', 'extras', 'hidden', 'on top', 'total cost']),
      run: () => ({
        text: `<b>In the berth price:</b> your bunk for the whole event, race entry, coaching, safety brief and drill, foul weather gear and a life jacket, fuel, the home berth, and insurance for the boat.\n\n<b>On top:</b> flights, travel insurance, your share of food aboard and ashore ($250–400 for the week), the airport transfer ($20–30), and any hotel nights either side.\n\n<b>Never on top:</b> race entry fees, cleaning, fuel surcharges or “equipment hire” invented at the dock.`,
        chips: ['Which tier fits me?', 'How do I get there?', 'Cancellation terms']
      })
    },
    {
      id: 'experience',
      test: q => has(q, ['experience', 'licence', 'license', 'certificate', 'beginner', 'never raced', 'qualified', 'fit enough', 'age']),
      run: () => ({
        text: `No certificate is needed to race as crew — that only matters if you want to skipper your own boat later.\n\nWhat you do need: swim, move around a heeling boat, and take an instruction first and discuss it after. If you can climb a ladder with a bag in one hand, you can do the Rail tier.\n\nTrim assumes you have raced before. Helm & Tactics assumes real hours on the wheel — we will ask what you have done, and we will say so if the fit is wrong.`,
        chips: ['Which tier fits me?', 'Is it safe?', 'What do I pack?']
      })
    },
    {
      id: 'safety',
      test: q => has(q, ['safe', 'safety', 'liferaft', 'life raft', 'jacket', 'harness', 'storm', 'emergency', 'insurance', 'rescue']),
      run: () => ({
        text: `The boat is equipped to Offshore Special Regulations category 3:\n\n• Liferaft, EPIRB and AIS\n• Harness and tether for every crew member, jackstays fore and aft\n• Storm jib and trysail, two independent bilge pumps\n• Flares, fire extinguishers, full offshore first aid kit\n• Two VHF sets — fixed and handheld — plus a backup GPS\n\nEvery event opens with a safety brief and a man-overboard drill before the first race. Inshore racing stays within sight of land; the offshore passage runs a proper watch system with rest built in.`,
        chips: ['What if I get seasick?', 'Do I need experience?', 'What do I pack?']
      })
    },
    {
      id: 'seasick',
      test: q => has(q, ['seasick', 'sea sick', 'sick', 'nausea', 'motion']),
      run: () => ({
        text: `Most people feel it at some point — it is not a character flaw and nobody aboard will make it one.\n\nWhat works, in order: take the tablets before you leave the dock rather than after you feel it; stay on deck; keep your eyes on the horizon; steer if you can, because the person driving is almost never sick; eat something dry every couple of hours.\n\nInshore racing is finished by mid-afternoon, so there is always an end in sight. On the offshore passage the watch system means you are never on deck for more than four hours at a stretch.`,
        chips: ['Is it safe?', 'What do I pack?', 'Which tier fits me?']
      })
    },
    {
      id: 'travel',
      test: q => has(q, ['fly', 'flight', 'airport', 'dalaman', 'get there', 'get to', 'getting to', 'transfer', 'taxi', 'visa', 'arrive', 'travel', 'how far']),
      run: () => ({
        text: `Fly into <b>Dalaman (DLM)</b> — 25 minutes from the marina. From the US that is one stop, usually via Istanbul; from Europe there are direct flights all season.\n\nArrive the day before the first briefing, not the morning of it. A delayed bag has ruined more first days than bad weather.\n\nWe run a shared transfer for arriving crew, $20–30 a head, free once you have brought three friends through your link. Check your own visa requirement before booking — for most passports Türkiye is visa-free or an online e-visa, but it is your paperwork, not ours.`,
        chips: ['Money and cards?', 'What do I pack?', 'What is included?']
      })
    },
    {
      id: 'money',
      test: q => has(q, ['money', 'card', 'cash', 'atm', 'lira', 'currency', 'tip', 'exchange', 'payment']),
      run: () => ({
        text: `Visa and Mastercard work across the marina and in most restaurants.\n\nATMs dispense Turkish lira with a per-transaction cap, so draw cash in two goes rather than one and expect a fee each time. Skip the airport exchange desks — the rate in town is better. Tipping runs about 10% and is usually cash.\n\nBudget $250–400 for the week ashore: food aboard, dinners in town, the transfer.`,
        chips: ['How do I get there?', 'What is included?', 'Where to eat in Göcek?']
      })
    },
    {
      id: 'pack',
      test: q => has(q, ['pack', 'bring', 'luggage', 'suitcase', 'bag', 'clothes', 'shoes', 'kit', 'wear']),
      run: () => ({
        text: `The main rule: <b>a soft bag, never a hard suitcase</b>. There is nowhere to stow a hard case and it will live in your bunk.\n\nBring: non-marking deck shoes, two layers you can race in, a warm mid-layer for night sailing, sunglasses on a cord, factor 50, a hat with a strap, a head torch, a power bank and seasickness tablets if you are unsure.\n\nLeave at home: bed linen, towels, kitchenware, anything white you care about. Foul weather gear and a life jacket are aboard for you.`,
        chips: ['Is it safe?', 'What if I get seasick?', 'How do I get there?']
      })
    },
    {
      id: 'cancel',
      test: q => has(q, ['cancel', 'refund', 'reschedule', 'change date', 'postpone', 'illness', 'cannot come', "can't come"]),
      run: () => ({
        text: `<b>Cancellation:</b> more than 60 days out, the deposit is refunded in full minus a $100 admin fee. Between 30 and 60 days, half. Under 30 days the money stays as credit against any event for twelve months.\n\n<b>Moving dates:</b> free once, if you are more than 45 days out and the new date is in the same season.\n\n<b>Weather:</b> if the race committee abandons a day, you still have the boat, the coach and the town — but we do not refund a race that nature cancelled. If the marina closes the port entirely, lost days come back as sailing days.\n\nTrip insurance is worth the 4% it costs; buy it when you book, not later.`,
        chips: ['What is included?', 'Show the calendar', 'Which tier fits me?']
      })
    },
    {
      id: 'calendar',
      test: q => has(q, ['calendar', 'dates', 'when', 'event', 'race week', 'regatta', 'offshore', 'availability', 'spots', 'berths left']),
      run: () => ({
        text: `2027 calendar:\n\n`
          + REGATTAS.map(r => `• <b>${r.name}</b> — ${r.date}. ${r.fleet}. <b>${r.spots}</b> berth${r.spots === 1 ? '' : 's'} left. Holding one is worth +${r.pts} points.`).join('\n')
          + `\n\nThe offshore passage and Race Week go first — usually six months out. Members see new dates 48 hours before anyone else, which in practice is the difference between a berth and a waiting list.`,
        chips: ['Which tier fits me?', 'Tell me about the club', 'What is included?']
      })
    },
    {
      id: 'club',
      test: q => has(q, ['club', 'membership', 'member', 'subscription', 'early access']),
      run: () => ({
        text: `Membership is ${money(CLUB.price)} ${CLUB.unit} (${money(CLUB.annual)} a year) and exists for one reason: the events people want sell out before they are announced publicly.\n\n`
          + CLUB.perks.map(p => `• ${p}`).join('\n')
          + `\n\nIf you sail with us once a year it pays for itself on the berth discount alone. If you sail twice, it is not a close call.`,
        chips: ['Show the calendar', 'What rewards are there?', 'Which tier fits me?']
      })
    },
    {
      id: 'courses',
      test: q => has(q, ['course', 'academy', 'theory', 'rules', 'learn', 'study', 'video', 'training material']),
      run: () => ({
        text: `The Academy is theory filmed on the boat, so you arrive having already seen the manoeuvre go wrong once:\n\n`
          + COURSES.map(c => `• <b>${c.title}</b> — ${money(c.price)} or ${c.pts} points. ${c.time}, ${c.level}. ${c.line}`).join('\n')
          + `\n\nRacing Rules Essentials comes free with the Trim tier; Helm & Tactics includes all four.`,
        chips: ['Which tier fits me?', 'What rewards are there?', 'Tell me about the club']
      })
    },
    {
      id: 'boat',
      test: q => has(q, ['boat', 'yacht', 'looping', 'specification', 'spec', 'how big', 'sails', 'rig', 'cabin', 'sleep', 'shower']),
      run: () => ({
        text: `<b>${BOAT.name}</b> — a ${BOAT.type}, ${BOAT.designer}.\n\n`
          + BOAT.specs.map(s => `• ${s.label}: ${s.value}`).join('\n')
          + `\n\nEight race aboard, six for offshore legs so everyone gets a bunk on the off-watch. Three cabins, hot water, and a diesel heater that matters more than it sounds on a November night.`,
        chips: ['Is it safe?', 'Which tier fits me?', 'Show the calendar']
      })
    },
    {
      id: 'rewards',
      test: q => has(q, ['what rewards', 'spend points', 'reward catalogue', 'redeem', 'what can i get']),
      run: (q, c) => ({
        text: `Points convert into sailing, not merchandise:\n\n`
          + REWARDS.map(r => `• <b>${r.title}</b> — ${r.cost} points. ${r.sub}`).join('\n')
          + (c.state.registered ? `\n\nYou have ${c.state.points} points.` : `\n\nYou need an account to collect and spend them.`),
        chips: c.state.registered ? ['How do points work?', 'Bring a friend'] : ['Sign up', 'How do points work?']
      })
    },
    {
      id: 'points',
      test: q => has(q, ['point', 'reward', 'loyalty', 'level', 'discount', 'promo']),
      run: (q, c) => {
        const s = c.state;
        if (!s.registered) {
          return {
            text: `Points sit on an account, so the first step is signing up — which itself gives you <b>${BONUS.signup} points</b> and the prep checklist.\n\nThen they build up:\n• Holding a berth — 300 to 700 points\n• A friend through your link — ${BONUS.inviter} for you, ${BONUS.invitee} for them\n• A check-in at a place on the town map — 30 to 70\n\nThey are spent on helm hours, Academy courses and tier upgrades.`,
            chips: ['Sign up', 'What rewards are there?', 'Which tier fits me?']
          };
        }
        const next = REWARDS.find(r => r.cost > s.points);
        return {
          text: `You have <b>${s.points}</b> points, level “${c.level.name}”.\n\n`
            + (next ? `You are <b>${next.cost - s.points}</b> short of “${next.title}”.\n\n` : `Everything in the catalogue is within reach.\n\n`)
            + `Fastest routes: hold a berth (300–700 at once), bring a friend (${BONUS.inviter}), check in ashore (30–70 each).`,
          chips: ['What rewards are there?', 'Bring a friend', 'Show the calendar']
        };
      }
    },
    {
      id: 'referral',
      test: q => has(q, ['referral', 'invite', 'friend', 'link', 'refer', 'bring someone']),
      run: (q, c) => ({
        text: `You send your link, a friend signs up through it and books a berth. You get <b>${BONUS.inviter}</b> points, they start with <b>${BONUS.invitee}</b>.\n\n`
          + REF_TIERS.map(x => `• <b>${x.n} ${x.n === 1 ? 'friend' : 'friends'}</b> — ${x.title}: ${x.sub}`).join('\n')
          + (c.state.registered ? `\n\nYour link is in your account; ${c.state.referrals} of 5 so far.` : `\n\nThe link appears in your account the moment you sign up.`),
        chips: c.state.registered ? ['What rewards are there?', 'Show the calendar'] : ['Sign up', 'How do points work?']
      })
    },
    {
      id: 'account',
      test: q => has(q, ['sign up', 'register', 'account', 'profile', 'log in', 'login', 'checklist']),
      run: (q, c) => ({
        text: c.state.registered
          ? `You are signed in: <b>${c.state.name}</b>, ${c.level.name}, ${c.state.points} points.\n\nThe account holds your check-ins, the berths you are holding, rewards with their codes, the prep checklist and your referral link. It is stored locally in this browser — this is a demo, there is no server behind it.`
          : `Signing up takes a minute: name, email, and a friend's code if you have one. It unlocks <b>${LEAD_MAGNET.title}</b> and puts <b>${BONUS.signup} points</b> on the account.\n\nWithout it the map, the quiz and both assistants work in full — but nothing is saved.`,
        chips: c.state.registered ? ['What rewards are there?', 'Bring a friend'] : ['Sign up', 'Which tier fits me?']
      })
    },
    {
      id: 'solo',
      test: q => has(q, ['alone', 'solo', 'by myself', 'know anyone', 'who else', 'crew like']),
      run: () => ({
        text: `Most people come alone. A typical crew is eight people who did not know each other on Saturday and have a group chat by Wednesday.\n\nAges run from late twenties to sixties, usually half first-timers and half returning. If you are coming as a pair we keep you in the same watch unless you ask for the opposite.`,
        chips: ['Which tier fits me?', 'What do I pack?', 'Show the calendar']
      })
    }
  ];

  function answer(query, c) {
    const q = norm(query);
    for (const topic of TOPICS) if (topic.test(q)) return topic.run(q, c);
    return {
      text: `I do not have an exact answer for that. I cover the boat and the trip: tiers and what each includes, experience needed, safety kit, flights and transfers, money, packing, cancellations, the Academy, the club, points and referrals.\n\nAnything ashore — food, sunsets, lay days — is the town guide on the other tab.`,
      chips: ['Which tier fits me?', 'What is included?', 'Is it safe?']
    };
  }

  const WELCOME = state => ({
    text: `I am the crew assistant. Berths and tiers, what is included, safety, flights, money, packing, courses and your account — ask in plain words.\n\n`
      + (state.registered
        ? `You are signed in, so I can answer about your points and rewards too.`
        : `Without an account I will still answer everything — but points and the prep checklist need one, and it takes a minute.`),
    chips: state.registered
      ? ['Which tier fits me?', 'What is included?', 'Show the calendar']
      : ['Which tier fits me?', 'Do I need experience?', 'What is included?']
  });

  return { answer, WELCOME };
})();

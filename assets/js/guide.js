/* Charter Key — town guide. Offline engine: intent matching + tag ranking over the places. */

const Guide = (() => {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9\s-]/gi, ' ');
  const stem = w => w.replace(/(ing|ed|s)$/u, '');
  const words = q => norm(q).split(/\s+/).filter(w => w.length > 2).map(stem);
  const has = (q, list) => list.some(k => norm(q).includes(k));

  const D = () => DESTINATION;

  function rank(terms) {
    return D().points
      .map(p => {
        let s = 0;
        const hay = norm(p.name + ' ' + p.desc + ' ' + p.tip);
        p.tags.forEach(tag => {
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

  const byTags = (tags, cat, n = 3) => D().points
    .map(p => {
      let s = p.tags.filter(x => tags.includes(x)).length * 5;
      if (cat && p.cat === cat) s += 4;
      return { p, s };
    })
    .filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, n).map(r => r.p);

  const pick = (cat, tags = [], n = 3) => D().points
    .filter(p => p.cat === cat)
    .map(p => ({ p, s: p.tags.filter(x => tags.includes(x)).length }))
    .sort((a, b) => b.s - a.s).slice(0, n).map(r => r.p);

  const line = p => `${p.name} — ${p.price}, ${p.time}`;
  const first = p => p.desc.split('.')[0];
  const bullet = list => list.map(p => `• <b>${p.name}</b> — ${first(p)}. ${p.price}, ${p.time}.`).join('\n');

  const INTENTS = [
    {
      id: 'greet',
      test: q => has(q, ['hello', 'hi ', 'hey', 'good morning']),
      run: () => ({
        text: `Hello. I am the town guide for <b>Göcek</b> — ${D().points.length} places, with prices, hours and the right time of day for each.\n\nAsk me the way you would ask a local: “where to eat fish after racing”, “what to do on a lay day”, “where to watch the sunset”.`,
        chips: ['Plan my lay day', 'Where to eat fish?', 'Sunset spot?']
      })
    },
    {
      id: 'plan',
      test: q => has(q, ['plan', 'itinerary', 'schedule', 'lay day', 'day off', 'free day', 'what to do today'])
        && !has(q, ['evening', 'night']),
      run: () => {
        const bf = pick('eat', ['breakfast', 'coffee'], 1)[0];
        const morning = byTags(['morning', 'calm', 'sup'], 'do', 1)[0];
        const day = pick('see', ['view', 'nature', 'history'], 1)[0];
        const dinner = pick('eat', ['dinner', 'fish'], 1)[0];
        const night = pick('night', [], 1)[0];
        const list = [bf, morning, day, dinner, night].filter(Boolean);
        const pts = list.reduce((a, p) => a + p.pts, 0);
        return {
          text: `A lay day in <b>Göcek</b>, arranged so you do not waste it:\n\n`
            + `<b>07:30</b> · ${bf ? line(bf) : '—'}\n<b>09:00</b> · ${morning ? morning.name : '—'} — while the bay is still glass\n<b>13:00</b> · ${day ? day.name : '—'}\n<b>19:30</b> · ${dinner ? line(dinner) : '—'}\n<b>22:00</b> · ${night ? night.name : '—'}\n\n`
            + `Do the whole route and that is <b>+${pts} points</b> on your account.`,
          cards: list,
          chips: ['What if it rains?', 'Where to rent a SUP?', 'Somewhere quieter']
        };
      }
    },
    {
      id: 'calm',
      test: q => has(q, ['no wind', 'calm', 'abandoned', 'cancelled', 'bored', 'nothing to do']),
      run: () => {
        const list = byTags(['lay day', 'calm', 'nature', 'activity', 'sup'], null, 3);
        return {
          text: `No wind is the best excuse to see the place instead of the water. Three options, different energy levels:\n\n`
            + list.map((p, i) => `<b>${i + 1}.</b> ${p.name} — ${first(p)}. ${p.price}, ${p.time}.`).join('\n'),
          cards: list,
          chips: ['One strong thing only', 'With kids?', 'Somewhere to eat nearby']
        };
      }
    },
    {
      id: 'eat',
      test: q => has(q, ['eat', 'food', 'restaurant', 'dinner', 'lunch', 'breakfast', 'fish', 'hungry', 'cafe', 'coffee']),
      run: q => {
        const morning = has(q, ['breakfast', 'morning', 'coffee']);
        const cheap = has(q, ['cheap', 'budget', 'affordable']);
        const tags = morning ? ['breakfast', 'coffee', 'morning'] : ['dinner', 'fish', 'evening', 'after racing'];
        if (cheap) tags.push('cheap');
        const list = pick('eat', tags, 3);
        return {
          text: (morning ? `Breakfast in <b>Göcek</b>, timed for the skippers briefing:\n\n`
                         : `Where to eat in <b>Göcek</b>${cheap ? ', without overspending' : ''}:\n\n`)
            + list.map(p => `• <b>${p.name}</b> — ${first(p)}. ${p.price}, ${p.time}.\n  <i>${p.tip}</i>`).join('\n'),
          cards: list,
          chips: ['Where does the fleet eat?', 'Breakfast before racing', 'Something local']
        };
      }
    },
    {
      id: 'see',
      test: q => has(q, ['see', 'sunset', 'view', 'photo', 'sights', 'scenery', 'beautiful', 'walk']),
      run: () => {
        const list = byTags(['sunset', 'view', 'photo', 'history', 'nature'], 'see', 3);
        return {
          text: `Worth seeing here:\n\n${bullet(list)}\n\nTip for the first one: <i>${list[0] ? list[0].tip : ''}</i>`,
          cards: list,
          chips: ['Where for the sunset?', 'Something for a whole day', 'Anywhere to eat nearby']
        };
      }
    },
    {
      id: 'night',
      test: q => has(q, ['night', 'evening', 'bar', 'party', 'drink', 'music', 'after racing']),
      run: () => {
        const list = [...pick('night', [], 2), ...pick('eat', ['dinner', 'after racing'], 1)];
        return {
          text: `The evening after racing in <b>Göcek</b>:\n\n${bullet(list)}\n\nHouse rule: ${list[0] ? list[0].tip : ''}`,
          cards: list,
          chips: ['Somewhere quieter', 'Recover after racing', 'Breakfast for tomorrow']
        };
      }
    },
    {
      id: 'active',
      test: q => has(q, ['do ', 'activity', 'sport', 'snorkel', 'swim', 'paddle', 'dive', 'sup', 'training']),
      run: () => {
        const list = pick('do', ['activity', 'water', 'sup', 'training'], 3);
        return {
          text: `Things to do with the crew:\n\n`
            + list.map(p => `• <b>${p.name}</b> — ${first(p)}. ${p.price}, ${p.time}. <b>+${p.pts}</b> points for a check-in.`).join('\n'),
          cards: list,
          chips: ['Something calmer', 'With kids?', 'Plan my lay day']
        };
      }
    },
    {
      id: 'family',
      test: q => has(q, ['kids', 'children', 'family', 'wife', 'husband', 'partner', 'parents', 'non-sailor', 'shore crew']),
      run: () => {
        const list = byTags(['kids', 'crew', 'water', 'snorkelling'], null, 3);
        return {
          text: `For the people who came with you but are not racing:\n\n${bullet(list)}\n\nThe logic is simple: mornings for water and snorkelling, and once the meltemi fills in after midday the shore is the nicer place to be.`,
          cards: list,
          chips: ['Where to eat with kids?', 'Something for half a day', 'Where for the sunset?']
        };
      }
    },
    {
      id: 'recover',
      test: q => has(q, ['back', 'recover', 'tired', 'massage', 'spa', 'hammam', 'relax', 'sore', 'ache']),
      run: () => {
        const list = byTags(['recovery', 'spa', 'relax'], null, 2);
        return {
          text: `After three days of hiking the rail your body needs this more than another dinner:\n\n`
            + list.map(p => `• <b>${p.name}</b> — ${first(p)}. ${p.price}, ${p.time}.\n  <i>${p.tip}</i>`).join('\n'),
          cards: list,
          chips: ['A quiet dinner after', 'What about the morning?', 'Plan tomorrow']
        };
      }
    },
    {
      id: 'repair',
      test: q => has(q, ['repair', 'sail', 'rigging', 'broken', 'torn', 'berth', 'marina', 'service', 'laundry', 'shower']),
      run: () => {
        const list = pick('yacht', [], 3);
        return {
          text: `Yacht services in <b>Göcek</b>:\n\n`
            + list.map(p => `• <b>${p.name}</b> — ${first(p)}. ${p.price}, ${p.time}.\n  <i>${p.tip}</i>`).join('\n'),
          cards: list,
          chips: ['Where is the marina?', 'How much is a berth?', 'Plan my lay day']
        };
      }
    },
    {
      id: 'weather',
      test: q => has(q, ['wind', 'weather', 'temperature', 'season', 'forecast', 'when to come', 'hot', 'cold']),
      run: () => ({
        text: `<b>Göcek</b>, ${D().region}\n\n• Season: ${D().season}\n• Wind: ${D().wind}\n• Water: ${D().water}\n• Airport: ${D().airport}\n\n${D().blurb}\n\nIf racing is abandoned for lack of wind, ask me for a lay day plan.`,
        chips: ['Plan my lay day', 'Where to eat fish?', 'Sunset spot?']
      })
    },
    {
      id: 'price',
      test: q => has(q, ['how much', 'price', 'cost', 'budget', 'expensive', 'cheap']),
      run: () => {
        const free = D().points.filter(p => /free/i.test(p.price)).slice(0, 3);
        const eat = pick('eat', ['dinner'], 1)[0];
        const yacht = pick('yacht', [], 1)[0];
        return {
          text: `Money ashore in <b>Göcek</b>:\n\n`
            + (yacht ? `• Berth / service: ${yacht.price}\n` : '')
            + (eat ? `• Dinner per person: ${eat.price}\n` : '')
            + `• Free: ${free.length ? free.map(p => p.name).join(', ') : 'viewpoints and shoreline walks'}\n\n`
            + `Budget $250–400 for a week ashore including food and the transfer. For what the berth itself covers, ask the crew assistant on the other tab.`,
          cards: free,
          chips: ['What is free?', 'Cheap eats', 'One big moment']
        };
      }
    },
    {
      id: 'account',
      test: q => has(q, ['point', 'reward', 'level', 'account', 'referral', 'invite', 'friend', 'check-in', 'checkin']),
      run: (q, c) => {
        if (!c.state.registered) {
          return {
            text: `Points live on an account, and you are browsing as a guest.\n\nSigning up takes a minute and gives you <b>${BONUS.signup} points</b> plus the prep checklist. After that your check-ins here start adding up.`,
            chips: ['Sign up', 'Plan my lay day', 'Where to eat fish?']
          };
        }
        const top = [...D().points].sort((a, b) => b.pts - a.pts).slice(0, 3);
        return {
          text: `<b>${c.state.name}</b> · ${c.level.name}, <b>${c.state.points}</b> points, ${c.state.checkins.length} check-ins ashore.\n\n`
            + `The highest-scoring places in town:\n${top.map(p => `  – ${p.name}: <b>+${p.pts}</b>`).join('\n')}`,
          cards: top,
          chips: ['Plan my lay day', 'What can I spend points on?', 'Sunset spot?']
        };
      }
    }
  ];

  function answer(query, c) {
    const q = norm(query);
    for (const it of INTENTS) if (it.test(q)) return it.run(q, c);

    const found = rank(words(query)).slice(0, 3);
    if (found.length) {
      return {
        text: `Here is what matches in <b>Göcek</b>:\n\n${bullet(found)}`,
        cards: found,
        chips: ['Plan my lay day', 'Where to eat?', 'No wind — what now?']
      };
    }
    return {
      text: `No exact match ashore. I know ${D().points.length} places in Göcek — prices, hours and the right time of day for each.\n\nTry: “where to eat fish”, “what to do on a lay day”, “sunset spot”, “where to fix a sail”. For anything about the boat, the tiers or getting here, switch to the crew assistant.`,
      chips: ['Plan my lay day', 'No wind — what now?', 'Where to eat fish?']
    };
  }

  const WELCOME = () => ({
    text: `I am the town guide for <b>Göcek</b>. ${D().blurb}\n\nI know ${D().points.length} places here — prices, opening hours and the right time of day for each. Ask me like you would ask a local.`,
    chips: ['Plan my lay day', 'Where to eat fish?', 'No wind — what now?', 'Sunset spot?']
  });

  return { answer, WELCOME };
})();

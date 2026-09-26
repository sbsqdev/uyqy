/* Кильватер — отрисовка стилизованной морской карты (SVG без внешних тайлов) */

const MapView = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  function defs(accent) {
    const d = el('defs');

    const water = el('linearGradient', { id: 'gWater', x1: '0', y1: '0', x2: '.3', y2: '1' });
    water.append(
      el('stop', { offset: '0', 'stop-color': '#0a3550' }),
      el('stop', { offset: '.55', 'stop-color': '#062639' }),
      el('stop', { offset: '1', 'stop-color': '#041a2b' })
    );

    const land = el('linearGradient', { id: 'gLand', x1: '0', y1: '0', x2: '0', y2: '1' });
    land.append(
      el('stop', { offset: '0', 'stop-color': '#1d3f4e' }),
      el('stop', { offset: '1', 'stop-color': '#14313f' })
    );

    // штриховка суши — как на бумажной лоции
    const hatch = el('pattern', { id: 'gHatch', width: '8', height: '8', patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
    hatch.append(el('rect', { width: '8', height: '8', fill: 'url(#gLand)' }));
    hatch.append(el('path', { d: 'M0 0 V8', stroke: 'rgba(210,240,255,.05)', 'stroke-width': '2' }));

    const glow = el('radialGradient', { id: 'gGlow' });
    glow.append(
      el('stop', { offset: '0', 'stop-color': accent, 'stop-opacity': '.20' }),
      el('stop', { offset: '1', 'stop-color': accent, 'stop-opacity': '0' })
    );

    const grid = el('pattern', { id: 'gGrid', width: '50', height: '50', patternUnits: 'userSpaceOnUse' });
    grid.append(el('path', {
      d: 'M50 0 H0 V50', fill: 'none',
      stroke: 'rgba(160,210,235,.07)', 'stroke-width': '1'
    }));

    d.append(water, land, hatch, glow, grid);
    return d;
  }

  /* мягкие «волны» на воде */
  function waves(vb) {
    const [, , w, h] = vb.split(' ').map(Number);
    const g = el('g', { class: 'waves', opacity: '.5' });
    for (let i = 0; i < 9; i++) {
      const y = h * 0.22 + i * (h * 0.085);
      const amp = 5 + (i % 3) * 3;
      let d = `M-20 ${y}`;
      for (let x = 0; x <= w + 40; x += 90) {
        d += ` q 45 ${i % 2 ? -amp : amp} 90 0`;
      }
      g.append(el('path', {
        d, fill: 'none', stroke: 'rgba(150,215,235,.10)',
        'stroke-width': i % 2 ? '1' : '1.4', 'stroke-linecap': 'round'
      }));
    }
    return g;
  }

  /* изобаты — концентрические пунктирные кольца глубины */
  function depths(vb, accent) {
    const [, , w, h] = vb.split(' ').map(Number);
    const g = el('g', { opacity: '.5' });
    for (let i = 0; i < 4; i++) {
      g.append(el('ellipse', {
        cx: w * 0.52, cy: h * 0.62, rx: 150 + i * 92, ry: 88 + i * 56,
        fill: 'none', stroke: accent, 'stroke-opacity': String(0.14 - i * 0.025),
        'stroke-width': '1', 'stroke-dasharray': '3 9'
      }));
    }
    return g;
  }

  function render(dest) {
    const svg = document.getElementById('mapSvg');
    svg.setAttribute('viewBox', dest.map.viewBox);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.textContent = '';
    const [, , w, h] = dest.map.viewBox.split(' ').map(Number);
    const accent = dest.accent;

    svg.append(defs(accent));
    svg.append(el('rect', { x: 0, y: 0, width: w, height: h, fill: '#062639' }));
    svg.append(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'url(#gGrid)' }));
    svg.append(depths(dest.map.viewBox, accent));
    svg.append(waves(dest.map.viewBox));
    svg.append(el('ellipse', { cx: w * 0.5, cy: h * 0.55, rx: w * 0.45, ry: h * 0.45, fill: 'url(#gGlow)' }));

    // суша
    const landG = el('g');
    dest.map.land.forEach(d => {
      landG.append(el('path', { d, fill: 'none', stroke: accent, 'stroke-opacity': '.22', 'stroke-width': '9' }));
      landG.append(el('path', { d, fill: 'url(#gHatch)', stroke: 'rgba(225,245,255,.45)', 'stroke-width': '1.6' }));
    });
    svg.append(landG);

    // острова
    dest.map.islands.forEach(d => {
      svg.append(el('path', { d, fill: 'none', stroke: accent, 'stroke-opacity': '.2', 'stroke-width': '7' }));
      svg.append(el('path', { d, fill: 'url(#gHatch)', stroke: 'rgba(225,245,255,.45)', 'stroke-width': '1.4' }));
    });

    // дистанция гонки
    if (dest.map.route) {
      const r = el('path', {
        d: dest.map.route, fill: 'none', stroke: accent, 'stroke-opacity': '.65',
        'stroke-width': '2', 'stroke-dasharray': '10 8', 'stroke-linecap': 'round'
      });
      const anim = el('animate', {
        attributeName: 'stroke-dashoffset', from: '36', to: '0', dur: '2.4s', repeatCount: 'indefinite'
      });
      r.append(anim);
      svg.append(r);

      // знаки дистанции
      [0.02, 0.5, 0.98].forEach(t => {
        const len = r.getTotalLength ? r.getTotalLength() : 0;
        if (!len) return;
        const p = r.getPointAtLength(len * t);
        svg.append(el('circle', { cx: p.x, cy: p.y, r: 5, fill: '#04192a', stroke: accent, 'stroke-width': '2' }));
      });
    }

    // подписи на карте
    (dest.map.labels || []).forEach(l => {
      const t = el('text', {
        x: (l.x / 100) * w, y: (l.y / 100) * h,
        fill: 'rgba(200,230,245,.42)', 'font-size': '15', 'font-family': 'Manrope, sans-serif',
        'font-weight': '600', 'letter-spacing': '1.6'
      });
      t.textContent = (typeof T === 'function' ? T(l.text) : l.text).toUpperCase();
      svg.append(t);
    });
  }

  return { render };
})();

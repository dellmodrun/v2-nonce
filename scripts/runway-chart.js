(function () {
  // A deterministic product illustration. No wallet, price, or live agent data is implied.
  const N = 256;
  const balance = [];
  const net = [];
  const payments = new Float64Array(N);
  let seed = 0x2a6b9f31;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  let budget = 1.55;
  let activeCycles = 0;
  let nextJob = 9;

  for (let i = 0; i < N; i++) {
    if (i === nextJob) {
      const payout = 0.13 + random() * 0.30 + (random() < 0.12 ? 0.12 : 0);
      const duration = 7 + Math.floor(random() * 18);
      const weights = Array.from({ length: duration }, (_, k) =>
        Math.sin(Math.PI * (k + 0.5) / duration) * (0.75 + random() * 0.5));
      const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
      weights.forEach((weight, k) => {
        if (i + k < N) payments[i + k] += payout * weight / weightSum;
      });
      const gap = i < 60 ? 15 + random() * 20
        : i < 120 ? 9 + random() * 17
          : i < 170 ? 23 + random() * 25
            : i < 220 ? 8 + random() * 20
              : 16 + random() * 20;
      nextJob += Math.round(gap);
      activeCycles = Math.max(activeCycles, duration);
    }
    if (activeCycles === 0 && random() < 0.025) activeCycles = 3 + Math.floor(random() * 9);
    const compute = 0.0048 + random() * 0.0025
      + (activeCycles > 0 ? 0.004 + random() * 0.005 : 0);
    if (activeCycles > 0) activeCycles--;
    const revenue = payments[i] + random() * 0.002;
    const change = revenue - compute;
    budget = Math.max(0, budget + change);
    balance.push(budget);
    net.push(change);
  }

  const W = 680, ML = 60, MR = 20;
  const TOP1 = 20, BOT1 = 235, TOP2 = 252, BOT2 = 345;
  const xAt = i => ML + i / (N - 1) * (W - ML - MR);
  const observedMin = Math.min(...balance), observedMax = Math.max(...balance);
  const padding = Math.max(0.12, (observedMax - observedMin) * 0.18);
  const topMin = Math.max(0, observedMin - padding);
  const topMax = observedMax + padding;
  const yBalance = value => TOP1 + (1 - (value - topMin) / (topMax - topMin)) * (BOT1 - TOP1);
  const windowed = net.map((_, i) => {
    const start = Math.max(0, i - 15);
    let total = 0;
    for (let j = start; j <= i; j++) total += net[j];
    return total / (i - start + 1);
  });
  const netMin = Math.min(-0.02, ...windowed) * 1.08;
  const netMax = Math.max(0.025, ...windowed) * 1.08;
  const yNet = value => TOP2 + (1 - (value - netMin) / (netMax - netMin)) * (BOT2 - TOP2);
  const line = (values, y) => values.map((value, i) => `${xAt(i).toFixed(2)},${y(value).toFixed(2)}`).join(' ');
  const baseline = yNet(0);

  let svg = '';
  svg += `<text x="18" y="${(TOP1 + BOT1) / 2}" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" transform="rotate(-90 18 ${(TOP1 + BOT1) / 2})">compute runway</text>`;
  [[topMin, 'low'], [(topMin + topMax) / 2, 'mid'], [topMax, 'high']].forEach(([value, label]) => {
    svg += `<text x="54" y="${yBalance(value) + 3}" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="end">${label}</text>`;
  });
  svg += `<line x1="${ML}" y1="${yBalance((topMin + topMax) / 2)}" x2="${W - MR}" y2="${yBalance((topMin + topMax) / 2)}" stroke="#3d3d3a" stroke-width="1" stroke-dasharray="2 4"/>`;
  svg += `<polyline points="${line(balance, yBalance)}" fill="none" stroke="#b8b5ac" stroke-width="1"/>`;
  svg += `<text x="${W - MR - 2}" y="20" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="end">agent economics</text>`;
  svg += `<text x="${W - MR - 2}" y="34" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="end">work earns / GPU spends</text>`;
  svg += `<text x="${W - MR - 2}" y="48" fill="#ffffff" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="end">runway = balance after costs</text>`;
  svg += `<line x1="${ML}" y1="247.5" x2="${W - MR}" y2="247.5" stroke="#3d3d3a" stroke-width="1"/>`;
  svg += `<text x="18" y="${(TOP2 + BOT2) / 2}" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" transform="rotate(-90 18 ${(TOP2 + BOT2) / 2})">net flow</text>`;
  [[netMin, 'cost'], [0, 'even'], [netMax, 'earn']].forEach(([value, label]) => {
    svg += `<text x="54" y="${yNet(value) + 3}" fill="${value === 0 ? '#ffffff' : '#9b9a95'}" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="end">${label}</text>`;
  });
  svg += `<line x1="${ML}" y1="${baseline}" x2="${W - MR}" y2="${baseline}" stroke="#ffffff" stroke-width="1" opacity="0.4"/>`;
  let area = `M ${ML},${baseline} `;
  windowed.forEach((value, i) => { area += `L ${xAt(i).toFixed(2)},${yNet(value).toFixed(2)} `; });
  area += `L ${xAt(N - 1).toFixed(2)},${baseline} Z`;
  svg += `<path d="${area}" fill="rgba(184,181,172,0.08)"/>`;
  svg += `<polyline points="${line(windowed, yNet)}" fill="none" stroke="#b8b5ac" stroke-width="1"/>`;
  svg += `<line x1="${ML}" y1="${BOT2}" x2="${W - MR}" y2="${BOT2}" stroke="#3d3d3a" stroke-width="1"/>`;
  [0, 64, 128, 192, 256].forEach(k => {
    const x = xAt(k === 256 ? N - 1 : k);
    svg += `<line x1="${x}" y1="${BOT2}" x2="${x}" y2="${BOT2 + 4}" stroke="#3d3d3a" stroke-width="1"/>`;
    svg += `<text x="${x}" y="${BOT2 + 16}" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="middle">${k}</text>`;
  });
  svg += `<text x="${(ML + W - MR) / 2}" y="${BOT2 + 32}" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">agent lifecycle</text>`;
  document.getElementById('chart').innerHTML = svg;
})();

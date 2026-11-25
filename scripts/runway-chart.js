(function () {
  // A deterministic product illustration. No wallet, price, or live agent data is implied.
  const N = 256;
  const balance = [];
  const net = [];
  let budget = 1.48;

  for (let i = 0; i < N; i++) {
    const revenue = (i % 31 === 8 ? 0.23 : 0) + (i % 47 === 28 ? 0.14 : 0);
    const compute = 0.0105 + 0.003 * (1 + Math.sin(i * 0.09));
    const change = revenue - compute;
    budget = Math.max(0, budget + change);
    balance.push(budget);
    net.push(change);
  }

  const W = 680, ML = 60, MR = 20;
  const TOP1 = 20, BOT1 = 235, TOP2 = 252, BOT2 = 345;
  const xAt = i => ML + i / (N - 1) * (W - ML - MR);
  const topMax = Math.max(1.9, ...balance) * 1.08;
  const yBalance = value => TOP1 + (1 - value / topMax) * (BOT1 - TOP1);
  const windowed = net.map((_, i) => {
    const start = Math.max(0, i - 11);
    let total = 0;
    for (let j = start; j <= i; j++) total += net[j];
    return total / (i - start + 1);
  });
  const netMin = -0.025, netMax = 0.04;
  const yNet = value => TOP2 + (1 - (value - netMin) / (netMax - netMin)) * (BOT2 - TOP2);
  const line = (values, y) => values.map((value, i) => `${xAt(i).toFixed(2)},${y(value).toFixed(2)}`).join(' ');
  const baseline = yNet(0);

  let svg = '';
  svg += `<text x="18" y="${(TOP1 + BOT1) / 2}" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" transform="rotate(-90 18 ${(TOP1 + BOT1) / 2})">runway (units)</text>`;
  [[0, '0'], [topMax / 2, (topMax / 2).toFixed(1)], [topMax, topMax.toFixed(1)]].forEach(([value, label]) => {
    svg += `<text x="54" y="${yBalance(value) + 3}" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="end">${label}</text>`;
  });
  svg += `<line x1="${ML}" y1="${yBalance(topMax / 2)}" x2="${W - MR}" y2="${yBalance(topMax / 2)}" stroke="#3d3d3a" stroke-width="1" stroke-dasharray="2 4"/>`;
  svg += `<polyline points="${line(balance, yBalance)}" fill="none" stroke="#b8b5ac" stroke-width="1"/>`;
  svg += `<text x="${W - MR - 2}" y="34" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="end">mode: illustration</text>`;
  svg += `<text x="${W - MR - 2}" y="48" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="end">jobs in / GPU out</text>`;
  svg += `<text x="${W - MR - 2}" y="62" fill="#ffffff" font-family="JetBrains Mono, monospace" font-size="10" text-anchor="end">runway: ${budget.toFixed(2)} units</text>`;
  svg += `<line x1="${ML}" y1="247.5" x2="${W - MR}" y2="247.5" stroke="#3d3d3a" stroke-width="1"/>`;
  svg += `<text x="18" y="${(TOP2 + BOT2) / 2}" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle" transform="rotate(-90 18 ${(TOP2 + BOT2) / 2})">net / cycle</text>`;
  [[netMin, netMin.toFixed(2)], [0, '0.00'], [netMax, netMax.toFixed(2)]].forEach(([value, label]) => {
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
  svg += `<text x="${(ML + W - MR) / 2}" y="${BOT2 + 32}" fill="#9b9a95" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">agent cycle (illustrative)</text>`;
  document.getElementById('chart').innerHTML = svg;
})();

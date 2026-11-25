(() => {
  const display = document.getElementById('live-ca');
  if (!display) return;

  const feed = 'https://raw.githubusercontent.com/dellmodrun/v2-nonce/ca-live/ca.json';
  const freshFeed = 'https://api.github.com/repos/dellmodrun/v2-nonce/contents/ca.json?ref=ca-live';
  const validAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  let currentAddress = null;
  let loading = false;
  let freshLoading = false;
  let latestUpdate = 0;

  function show(address) {
    currentAddress = address;
    display.textContent = address ? `CA: ${address.slice(0, 5)}...${address.slice(-5)}` : 'CA: TBA';
    display.title = address ? 'Copy the full contract address' : 'Contract address to be announced';
    display.setAttribute('aria-label', address ? `Copy contract address ${address}` : 'Contract address to be announced');
    display.disabled = !address;
  }

  function accept(data) {
    const stamp = Date.parse(data && data.updated_at) || 0;
    if (stamp < latestUpdate) return;
    const value = String(data && data.ca != null ? data.ca : '').trim();
    if (/^tba$/i.test(value) || !value) show(null);
    else if (validAddress.test(value)) show(value);
    else return;
    latestUpdate = stamp;
  }

  async function refresh() {
    if (loading || document.hidden) return;
    loading = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${feed}?t=${Date.now()}`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`CA feed HTTP ${response.status}`);
      accept(await response.json());
    } catch (_) {
      // Keep the last known address when the feed is temporarily unavailable.
    } finally {
      clearTimeout(timeout);
      loading = false;
    }
  }


  async function refreshFresh() {
    if (freshLoading || document.hidden) return;
    freshLoading = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${freshFeed}&t=${Date.now()}`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`CA API HTTP ${response.status}`);
      const file = await response.json();
      if (typeof file.content !== 'string') throw new Error('CA API returned no content');
      accept(JSON.parse(atob(file.content.replace(/\s/g, ''))));
    } catch (_) {
      // The raw feed remains available if this request is rate limited or unavailable.
    } finally {
      clearTimeout(timeout);
      freshLoading = false;
    }
  }

  display.addEventListener('click', async () => {
    if (!currentAddress) return;
    try {
      await navigator.clipboard.writeText(currentAddress);
      display.textContent = 'CA: copied';
      setTimeout(() => show(currentAddress), 1200);
    } catch (_) {
      display.textContent = `CA: ${currentAddress}`;
    }
  });

  show(null);
  refresh();
  refreshFresh();
  setInterval(refresh, 2000);
  setInterval(refreshFresh, 90000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { refresh(); refreshFresh(); } });
  window.addEventListener('online', refresh);
  window.addEventListener('focus', refreshFresh);
})();

# v2/nonce

v2/nonce explores a token launch that also starts a bounded AI agent. The agent would take tasks, earn revenue, pay for CUDA GPU compute, and pause when its operating budget runs out. Helius Solana Privacy Rings are being evaluated for confidential treasury payments.

The current site is a narrative and interface prototype. Its agent runtime, compute billing, and Privacy Rings integration are not live. The imported app retains parts of an earlier coin-launch flow; its form is not a working agent launcher.

## Site structure

- `index.html`: landing page and written concept
- `scripts/runway-chart.js`: explicitly illustrative agent runway chart
- `app/`: imported launch app and its current routes
- `dist/index.html`: self-contained landing page bundle
- `bundle.py`: regenerates the bundle from the landing page assets

Run `python bundle.py` after editing the landing page, then push the repository root to GitHub Pages.

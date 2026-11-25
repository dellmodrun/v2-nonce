# v2/nonce

v2/nonce links each launched coin to a bounded AI agent. The token meters requests, completed work earns revenue, CUDA GPU time costs money, and the agent sleeps when its runway runs out. The architecture includes a confidential treasury path using Helius Solana Privacy Rings.

## Site structure

- `index.html`: landing page and project narrative
- `scripts/runway-chart.js`: visual model of agent revenue, compute spend and runway
- `scripts/live-ca.js`: reads the contract address from the independent `ca-live` branch
- `app/`: launch app and its routes
- `dist/index.html`: self-contained landing page bundle
- `bundle.py`: regenerates the bundle from landing page assets

## Contract address updates

`main` is the GitHub Pages source. The live contract address is stored as `ca.json` on the separate `ca-live` branch. To publish an address or return to TBA, update only that JSON file on `ca-live` and push the branch. The landing page polls the raw JSON feed every two seconds while visible and refreshes immediately when a tab becomes active. CA changes therefore do not trigger a GitHub Pages rebuild. GitHub raw-file propagation is external and has no fixed latency guarantee.

Run `python bundle.py` after editing the landing page, then push `main` to publish site changes.

## Operational status

The imported app can prepare a coin launch, but the autonomous agent runtime, compute billing and Privacy Rings integration are separate work. The disabled reservation control must stay disabled until the old fee path is replaced. Site copy and launch actions must not imply these services are live before their on-chain and backend components are deployed and verified.

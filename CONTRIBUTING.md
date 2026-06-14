# Contributing to Agency Agents

Thanks for considering a contribution. This project is small, opinionated, and open. The bar for landing changes is straightforward: match the existing architecture, keep changes focused, and verify them.

## TL;DR

1. Fork the repo and create a topic branch off `main`.
2. Make a focused change.
3. Run the relevant checks.
4. Open a PR with what changed, why, and what you tested.

No CLA. No rights assignment. Contributions remain yours, licensed under [MIT](./LICENSE) to match the project.

## Dev Setup

Prerequisites:

- [Rust](https://rustup.rs/) stable
- [Node.js 22+](https://nodejs.org/) and npm
- Xcode Command Line Tools on macOS
- Full Xcode only if you regenerate the macOS Liquid Glass icon assets

Loop:

```sh
git clone https://github.com/<your-fork>/agency-agents-app
cd agency-agents-app
npm install
npm run tauri dev
npm run check
cargo test --manifest-path src-tauri/Cargo.toml --lib
```

The app uses the `agency-agents` catalog. For local catalog testing, use an existing clone or create one at:

```text
~/Software/AgentLand/agency-agents
```

## Project Structure

```text
agency-agents-app/
├── src/                         Svelte 5 + TypeScript frontend
│   ├── lib/components/          app surfaces and shared UI
│   ├── lib/stores/              Svelte stores
│   ├── lib/styles/              design tokens and global CSS
│   └── routes/                  SvelteKit SPA entry
├── src-tauri/
│   ├── src/
│   │   ├── corpus/              catalog source, refresh, indexing
│   │   ├── render/              deterministic per-tool renderers
│   │   ├── install/             writes, ledger, reconciliation
│   │   ├── commands/            Tauri command groups
│   │   ├── github/              optional GitHub auth/API integration
│   │   └── types.rs             shared DTOs
│   ├── capabilities/
│   └── tauri.conf.json
├── memory-bank/                 living design/context docs
├── docs/                        build, plan, philosophy, icons, release notes
├── tools/                       local build/release/support tooling
└── README.md
```

Read [memory-bank/projectbrief.md](./memory-bank/projectbrief.md), [memory-bank/systemPatterns.md](./memory-bank/systemPatterns.md), and [memory-bank/NEXT-SESSION.md](./memory-bank/NEXT-SESSION.md) before non-trivial changes.

## How To Add Backend Behavior

1. Add or update typed DTOs in `src-tauri/src/types.rs`.
2. Add backend logic in the relevant module.
3. Register new Tauri commands in `src-tauri/src/lib.rs` if needed.
4. Mirror TypeScript types in `src/lib/types.ts`.
5. Add store/API/UI integration in the frontend.
6. Add focused tests.

For install behavior, preserve the existing safety model:

- render deterministically
- write atomically
- record source and rendered hashes
- back up divergent files before destructive changes
- do not modify files outside approved destinations

## How To Add Tool Support

Do not add a tool by only adding a UI label.

Tool support needs:

- verified upstream install path
- renderer format definition
- scope model: user, project, or both
- destination resolution
- detection behavior
- uninstall/reconcile behavior
- unit tests
- parity test where an upstream converter exists

The recommended next architecture is a manifest in the AA repo that both `scripts/install.sh` and this app can consume.

## Tests

Common local checks:

```sh
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml --lib
npm run check
npm run build
```

Phase C batch:

```sh
npm run build:phase-c
```

Renderer parity:

```sh
AGENCY_AGENTS_PARITY_ROOT=/Users/michael/Software/AgentLand/agency-agents \
cargo test --manifest-path src-tauri/Cargo.toml upstream_convert_sh_is_byte_identical_for_transform_tools -- --ignored
```

## Code Style

- Rust: `cargo fmt`.
- Svelte/TypeScript: match the existing Svelte 5 runes style.
- Prefer existing components and stores over new abstractions.
- Keep UI copy direct and operational.
- Avoid new dependencies unless they clearly earn their weight.

## PR Guidance

Include:

- what changed
- why it changed
- screenshots for UI changes
- test commands run
- any residual risk or unavailable platform verification

Easy PRs:

- docs corrections
- tests for existing behavior
- small accessibility fixes
- focused bug fixes with reproduction
- verified tool-path corrections

Discuss first:

- new top-level surfaces
- new production dependencies
- new network hosts
- installer architecture changes
- multi-file renderer support
- signing, updater, or release pipeline changes
- telemetry, accounts, or sync features

## Code Of Conduct

Be direct, kind, and specific. Disagree about the work, not the person.

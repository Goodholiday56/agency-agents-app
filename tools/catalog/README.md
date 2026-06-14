# tools/catalog

## Status

Legacy inherited tooling from the source app. It is not part of the current Agency Agents runtime or release pipeline.

The Agency Agents app does not build a Homebrew formula/cask catalog. Its catalog source is the [`agency-agents`](https://github.com/msitarzewski/agency-agents) repository, handled by `src-tauri/src/corpus/mod.rs`.

## Current Catalog Model

Agency Agents uses:

- a bundled `agency-agents` baseline under `src-tauri/resources/corpus-baseline/`
- an optional managed clone at `~/.agency-agents`
- an optional user-selected clone, for example `/Users/michael/Software/AgentLand/agency-agents`

The app indexes Markdown agent files, discovers categories from upstream tooling, and renders tool-specific install files natively in Rust.

## Action

Do not use `tools/catalog/fetch.py` for Agency Agents work unless this directory is deliberately repurposed. Future catalog tooling should target the AA repo structure, not Homebrew APIs.

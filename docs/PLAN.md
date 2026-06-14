# Agency Agents App Plan

**Product:** Agency Agents  
**Repo:** `github:msitarzewski/agency-agents-app`  
**Catalog:** `github:msitarzewski/agency-agents`  
**Stack:** Tauri 2, Rust, SvelteKit, Svelte 5, TypeScript  
**License:** MIT

## Vision

Ship a native app for browsing, installing, and tracking the `agency-agents` catalog across AI coding tools.

The app should answer three questions clearly:

1. Which agents exist?
2. Where are they installed?
3. Are those installed files current, modified, missing, or foreign?

## Current Architecture

```text
Svelte UI
  Agents workspace
  Tools panel
  Dashboard
  Loadouts
  Settings
      |
      | typed Tauri IPC
      v
Rust backend
  corpus/     catalog source, refresh, indexing
  render/     deterministic tool renderers
  install/    write, uninstall, backups, ledger, reconcile
  github/     optional OAuth + GitHub API features
  settings/   local settings and network gates
      |
      v
Local filesystem
  app state
  agency-agents clone/baseline
  tool-specific agent directories
```

## MVP Scope

In scope:

1. Browse the `agency-agents` catalog by division, search, and detail.
2. Select a bundled, managed, or user-cloned catalog source.
3. Render supported tools natively in Rust.
4. Install and uninstall supported one-file-per-agent targets.
5. Track local install state with a ledger.
6. Reconcile disk state into current, outdated, modified, removed, and foreign.
7. Back up divergent files before removal or overwrite.
8. Show tool coverage and project targets.
9. Build signed macOS artifacts and cross-platform development builds.

Out of scope for the current release:

- executing agents
- arbitrary third-party plugin execution
- telemetry
- cloud sync
- paid tiers
- unverified install paths
- multi-file/aggregate renderers unless explicitly implemented and tested

## Supported Renderer Set

Current app-supported targets:

- Claude Code
- Codex
- Gemini CLI
- GitHub Copilot
- Qwen Code
- Cursor
- opencode

Known AA repo targets that still need app support:

- Antigravity
- Aider
- Windsurf
- OpenClaw
- Kimi

## Near-Term Plan

### Phase A: Core Workspace

Done. Unified Agents/Library workspace with deployment matrix, search, filters, and persistent detail panel.

### Phase B: Dashboard And Tools Console

Done. Coverage charts, health summaries, category distribution, tool list/detail console, and deep links.

### Phase C: Cross-Platform Correctness

Mostly done. macOS retains overlay titlebar and vibrancy. Windows/Linux use opaque native decorated windows. Remaining work is repeatable build automation and native runtime verification on available VMs.

### Phase D: Tool Target Manifest

Next recommended architecture step.

Create a manifest in the AA repo that declares:

- tool ID
- label
- vendor
- support status
- scopes
- default paths
- env overrides
- output format
- renderer kind
- authoritative docs/source links
- verification status

Then:

- update `agency-agents/scripts/install.sh` to consume it for tool metadata and paths
- add an audit script that checks manifest drift
- update this app's Tools panel to consume generated manifest metadata
- keep Rust writes limited to renderers the app can safely implement and test

### Phase E: Multi-File Renderers

Implement special output shapes only after their path semantics are verified:

- Aider `CONVENTIONS.md`
- Windsurf `.windsurfrules`
- OpenClaw workspace directory
- Antigravity skill directories
- Kimi if current docs validate an installable custom-agent format

## Quality Gates

Before release:

```sh
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml --lib
npm run check
npm run build
npm run build:phase-c
```

Renderer parity should be checked against the active AA clone:

```sh
AGENCY_AGENTS_PARITY_ROOT=/Users/michael/Software/AgentLand/agency-agents \
cargo test --manifest-path src-tauri/Cargo.toml upstream_convert_sh_is_byte_identical_for_transform_tools -- --ignored
```

## Definition Of Done For 1.0

- public docs describe Agency Agents, not the inherited source app
- app name, bundle ID, updater host, and release artifacts are consistent
- supported install paths have primary-source verification
- renderer parity passes for supported transform tools
- uninstall is recoverable for modified files
- macOS signed build is verified
- Windows/Linux builds are produced or explicitly marked unavailable
- Memory Bank task docs are updated after human approval

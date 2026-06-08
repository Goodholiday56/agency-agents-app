# NEXT SESSION — resume notes (Agency Agents)

Read this first after a compaction. Then `activeContext.md`, `agentLog.md` (append-only history),
`phases/phase-roadmap.md`, `contracts.md`, `systemPatterns.md`, `decisions.md`.

## ⚠️ A RE-ORG IS COMING (Michael, 2026-06-08)
Before building on catalog assumptions, RE-VERIFY them — the catalog repo and/or app layout is being
reorganized. After it lands, re-check:
- The active catalog source path (currently a **userClone** — see below) and whether it moved.
- Category discovery: we parse `AGENT_DIRS` from `<root>/scripts/convert.sh`. If the re-org changes
  divisions / `convert.sh` / nesting, counts + categories shift.
- Recursive indexing assumptions (nested `<category>/<sub>/<slug>.md`).
- Agent slugs/counts (was 203 flat → ~222 after recursive indexing picked up nested game-dev agents).
Don't trust the numbers below blindly post-re-org; re-run the report (see "Diagnostics" at bottom).

## TL;DR
Native macOS app (Tauri 2 · Svelte 5 runes · Rust) — "app store for AI agents." Browses the
agency-agents catalog and installs/tracks agents across AI tools. The app IS the cross-tool install
registry. **State: the install-management loop is real and working.** Signed + notarized build works.

## How to run / critical env facts
- `npm run tauri dev` (repo root). **DEV PORT = 1430** (HMR 1431).
- Verify green: `cd src-tauri && cargo test --lib` (**247/0**); `npm run build`; `npm run check`
  (0 errors; the only warning is a benign tsconfig `node` note).
- **Active catalog source = a USER CLONE**, persisted in
  `~/Library/Application Support/com.zerologic.agency-agents-app/state/catalog.json`:
  `{"kind":"userClone","path":"/Users/michael/Software/AgentLand/agency-agents","manage":true}`.
  So the app reads/compares against THAT clone, not the bundled baseline.
- App data dir (FIXED this session — was wrongly `…/brew-browser/`): all under
  `~/Library/Application Support/com.zerologic.agency-agents-app/` → `state/{catalog.json,
  corpus-index.json,corpus-meta.json,installs.json}`, `corpus/` (bundled only), `backups/`, `settings.json`.
- Michael's reality: ~184 agents installed via the CLI `install.sh` into `~/.claude/agents/`
  (Claude Code). Report: 157 byte-identical (→ shown `current`), 8 divergent (repo is NEWER → use
  Update), 19 nested (now indexed after the recursion fix).

## 🔴 IMMEDIATE backlog (address first)
1. **Renderer parity for transform tools — LOAD-BEARING, not yet verified.** Everything proven so far
   is **Claude Code** (identity tool: file == raw `.md`, so byte-match is certain). But the whole new
   model — byte-identical→`current`, Diff, Update — assumes our Rust `render/` output is BYTE-IDENTICAL
   to `scripts/convert.sh` for transform tools (Cursor `.mdc`, Codex TOML, Gemini, opencode, qwen). If
   it's even a newline off, every CLI-installed Cursor/Codex agent falsely reads `foreign`/`modified`.
   **Action: diff our `render/` vs `convert.sh` across agents × the 5 transform tools; fix mismatches.**
   This is the #4 "renderer-parity test" in the roadmap, now urgent because state correctness depends on it.
2. **uninstall backup decision (open).** The quick pill-✕ (and bulk Delete) call `uninstall_agent`,
   which deletes the file with NO backup — unlike Update/Restore (which back up to `backups/`). For a
   `current`/byte-identical agent it's re-installable (fine); for `modified`/divergent it's gone. Michael
   hasn't decided: back up on uninstall too (recoverable ✕) vs keep deletion final (matches the bulk
   Delete "no undos" warning). Ask before assuming.

## Backlog (not immediate)
- **Dashboard rollup**: surface "N agents behind the repo" / attention at a glance (deep-links exist).
- **#8 multi-file renderers** (antigravity, openclaw, aider, windsurf) — error cleanly today.
- `aliases.json` (slug renames), explicit orphan surfacing, `.agency-cache/` convention.
- **Tech-debt (brew plumbing, invisible)**: dead `Settings` fields (caskIconMode, trendingTtl,
  catalogAutoRefresh, catalogStaleBannerDays, enhanced_trending, live_enrichment, vulnerability_scanning,
  aiFeaturesEnabled) in backend `commands/settings.rs` + frontend `types.ts`; `BrewErrorPayload` /
  `isBrewError` / `BrewStreamEvent` type names + dead codes in `types.ts`; `reportIssue.ts` shell-exit
  semantics; leftover `tools/` brew pipeline in the tree. `catalog_auto_refresh` has NO scheduler (dead).
- Updater: minisign key NOT set up (builds run `SKIP_UPDATER=1`). Endpoint placeholder
  `agency-agents-app.zerologic.com/updater.json`. `updater.pubkey` in tauri.conf is a placeholder.

## What's built + working (this session's arc)
- **Catalog-as-source-of-truth (#1)**: CatalogSource {bundled|managed|userClone}; detect / provision
  (git clone or tarball) / pull / `catalog_status` / `catalog_check_updates` (git behind/ahead +
  diffstat); first-run picker; Settings → Catalog (git status + GitHub repo stats + sign-in, reusing
  the existing `github` store). Categories parsed from `convert.sh` AGENT_DIRS. **Recursive indexing**
  (nested clone agents now found; `read_source` resolves nested paths).
- **Install safety + states**: Adopt→**Track** (records, no write); every write backs up first;
  `agent_diff`; **byte-identical foreign → `current`** (auto-recognized, no "adopt" ceremony).
- **Library = grouped by agent**: ONE row per agent, a **pill per tool**. Each pill is color-coded by
  state (current quiet; foreign/outdated/modified/removed stand out) with per-pill actions: click
  divergent pill → Diff (`DiffModal` + `util/diff.ts` LCS), ↻ → Update-from-catalog (backs up), ✕ →
  remove. **Select** button reveals checkboxes (per-agent); "With selected" → Update/Track/Delete
  (Delete confirms, warns no-undo; inapplicable actions disabled). `install.bulk()` = one reconcile.
- **Settings refocused** to Agency Agents (Network/GitHub/About/Appearance/Updates rewritten; dead brew
  toggles removed). **`BrewError`→`AppError`** rename + dead-code purge (0 warnings).
- **Window/panel persistence**: resizable + persisted sidebar + agent-detail panel; window geometry
  saves on resize (survives dev kills).
- **Install-into = multi-select** with remembered selection (`PersonaDiscover`).
- **Signed + notarized build WORKS**: `scripts/release.sh` (pulls notary pw + updater key from
  Keychain). `SKIP_UPDATER=1 ./scripts/release.sh` → Gatekeeper-accepted, notarized, stapled
  `Agency Agents.app` + signed `.dmg`. Notary creds: keychain service `agency-agents-notary`, account
  `msitarzewski@mac.com`, **Team `7JQGQ7CRH8`**, Apple ID `msitarzewski@mac.com`. Developer ID cert is
  in the keychain. `.gitignore` hardened for signing secrets.
- **Icon**: new white-glyph-on-purple icon shipped (`src-tauri/icons/*`, flat). Liquid Glass layered
  source staged in `docs/icon/` (`AppIcon.icon` validates with actool; `layers/`) for macOS 26 Tahoe —
  NOT yet wired into the build (standalone `actool` won't compile a `.icon`; Icon Composer is the path).

## GOTCHAS (don't relearn)
- **Frozen/blank view → open the webview devtools console FIRST.** (The `each_key_duplicate` saga.)
- **Render parity is now load-bearing** (see immediate #1).
- **Byte-identical foreign = `current`** is computed live in `installs_reconcile` (no ledger write).
  For transform tools this only works if parity holds.
- **Recursive indexing**: `build_from_dir` + `read_source` recurse; bundled baseline is flat (count
  unchanged 209), real clones nest.
- **Can't self-screenshot the app** — ask Michael.
- Dev Dock label = binary name; only a real `tauri build` makes it match productName.

## Diagnostics (re-run after the re-org)
The "what differs" report (replicates the app's compare logic) is a python one-liner pattern: read
`state/corpus-index.json` for slug→category, walk `~/.claude/agents/*.md`, compare each to
`<clone>/<category>/<slug>.md` (fall back to recursive find for nested). See agentLog 2026-06-08 entry
for the exact script — it found 157 identical / 8 divergent / 19 nested-unknown.

## Key files
- Backend: `src-tauri/src/{corpus,render,install,github,util}/`, `state.rs`, `types.rs`, `error.rs`
  (now `AppError`), `lib.rs`. Tauri: `src-tauri/tauri.conf.json` (id com.zerologic.agency-agents-app,
  port 1430, signingIdentity, updater endpoint placeholder).
- Frontend: `src/lib/components/{AgentLibrary,DiffModal,PersonaDiscover,CatalogFirstRun,
  SettingsSectionCatalog,Sidebar,ResizeHandle}.svelte`, `src/lib/stores/{install,catalog,corpus,ui}.svelte.ts`,
  `src/lib/util/{diff,reportIssue}.ts`, `src/routes/{+page,+layout}.svelte`.
- Release: `scripts/release.sh`. Icon source: `docs/icon/{AppIcon.icon,layers/,README-liquid-glass.md}`.

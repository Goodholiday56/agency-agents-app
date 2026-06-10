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

## ✅ DONE through 2026-06-09 — unified IA, Dashboard charts, nav, Tools console
- **Phase A — unified Agents workspace** (`AgentsWorkspace.svelte`; `PersonaDiscover`+`AgentLibrary`
  deleted). Detail = `PersonaBody` (`deploy` snippet, clickable division pill) + `DeploymentMatrix`
  (summary pills + "USE WITH" disclosure; user tools = `Switch`, project tools = Install/Add-project).
- **Phase B — Dashboard charts** (`HealthDonut`, `CoverageMatrix` category×tool, coverage-by-tool bars,
  category distribution). Dependency-free SVG/CSS; cells/segments deep-link.
- **Back/forward nav** — `ui` NavLocation history; titlebar ◀▶, ⌘[/], mouse 3/4. `agentsCategory` +
  `agentsSelected` live in `ui`. **Division deep-links** via `ui.openDivision`. Lens counts narrow to the
  division; "Not installed" lens added; zero-count lenses/stats auto-hide.
- **Tools console** — `ToolsView` rebuilt as list/detail two-pane: badges (`util/toolBadge.ts`), health
  bars, versions, Reveal folder, Default-target Switch, Sync/Track-all/Remove-all, projects. New Rust
  commands `reveal_path` + `tool_versions` (+ `ToolVersion`). Best-effort version probe is uneven (GUI
  tools / differently-named CLIs show none) — that's expected.
- **macOS 26 Tahoe Liquid Glass icon FIXED.** Tahoe renders from a compiled `Assets.car` (Icon Composer),
  not `.icns` → `.icns`-only = blank squircle. `actool` (full Xcode only, by path) compiles
  `docs/icon/AppIcon.icon` → `src-tauri/Assets.car` (in `bundle.resources`) + Tahoe-aware `icon.icns`;
  `src-tauri/Info.plist` adds `CFBundleIconName=AppIcon` (Tauri merges). Recipe: `docs/icon/
  README-liquid-glass.md`. **Don't run `npm run tauri icon`** (clobbers the glass icns). Dev Dock hack
  REMOVED (lib.rs plain `.run()`, objc2 deps gone).

**NEXT (Phase C, deferred): cross-platform chrome** — Windows/Linux titlebar + traffic-light
degradation (verify `tauri.conf.json` + `TitlebarControls.svelte`); the rest of the app is already
platform-clean (⌘/Ctrl via `util/platform.ts`, "this device" copy, Rust reveal/home paths).

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
- **Local-runtime system-prompt target (NEW, Michael 2026-06-08)**: a separate target CLASS for model
  runtimes — Ollama (`Modelfile` `SYSTEM "…"`) and LM Studio (preset/system prompt) — where an agent is
  deployed as the model's system prompt, not a per-tool agents/*.md. Needs its OWN renderer + a runtime
  locator + a reconcile story (no agents dir to scan; track the generated Modelfile/preset). NOT a missing
  entry in the agent-host `Tool` set — those ingest a persona file; runtimes serve weights. Its own track.
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
- **Unified Agents workspace (replaces Library + the catalog browse)**: `AgentsWorkspace.svelte` three-
  pane. List pane = filter lens (All/Installed/Needs-attention/Untracked, live counts) + search +
  Category ▾ + Select-mode bulk (Update/Track/Delete; Delete confirms, warns no-undo; `install.bulk()` =
  one reconcile). Detail pane = `PersonaBody` + `DeploymentMatrix`. The matrix: summary pills for
  installed tools (state-dotted) + a "USE WITH" disclosure where user tools toggle via `Switch.svelte`
  and project tools (Cursor/opencode) keep Install/Add-project + per-project sub-rows; Diff (`DiffModal`
  + `util/diff.ts`) / Track / Update inline when applicable. `PersonaDiscover` + `AgentLibrary` deleted.
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
- Frontend: `src/lib/components/{AgentsWorkspace,PersonaBody,DeploymentMatrix,Switch,DiffModal,
  CatalogFirstRun,SettingsSectionCatalog,Sidebar,ResizeHandle}.svelte`,
  `src/lib/stores/{install,catalog,corpus,ui}.svelte.ts`, `src/lib/util/{diff,platform,reportIssue}.ts`,
  `src/routes/{+page,+layout}.svelte`. (PersonaDiscover + AgentLibrary were deleted in the IA re-org.)
- Release: `scripts/release.sh`. Icon source: `docs/icon/{AppIcon.icon,layers/,README-liquid-glass.md}`.

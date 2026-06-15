# Active Context — Agency Agents

**State**: BUILD (pre-release polish, on `release-planning`). Phase C merged to `main`. **Release plan
LOCKED & documented, NOT cut yet** — v0.1.0, signed/notarized manual DMG, `SKIP_UPDATER=1`, auto-update
deferred. Runbook: `docs/BUILD.md#Release Checklist`; decision in `decisions.md` (2026-06-14).
**Last updated**: 2026-06-15

## ✅ Pre-release polish (2026-06-15) — committed + pushed on `release-planning`
- **brew vestige cleanup**: error-type rename (`BrewError*`→`AppError*`), removed dead `catalogAutoRefresh`
  setting, removed the dead error codes (`brew_*`, `job_not_found`, `canceled`, `feature_disabled`,
  `vulns_not_installed`), and **deleted the brew-era Python pipeline** (`tools/{catalog,categorize,enrich,
  pipeline,trending-collector}` — they fetched Homebrew formulae, NOT used by AA; the catalog comes from
  `corpus/mod.rs`).
- **Activity Journal** (replaces the inherited, permanently-empty brew streaming "Activity"): pivoted
  `activity.svelte.ts` to a `JournalEntry` store (localStorage), `install.svelte.ts` logs every
  install/uninstall/update/track/bulk + default-target switch, `ActivityHistory.svelte` rewritten as a
  day-grouped clearable journal. Deleted `ActivityDrawer.svelte` + `AppStreamEvent`/`ActivityJob` types.
  Built via a Workflow (planner→builder→Code-Reviewer+UX-Architect team→fix loop); UX nits hand-polished.
- **Tools pane lens**: defaults to **Installed** (detected/in-use) tools; toggle `Installed · Not installed
  · All` (top row beside rescan, no count chips). `ToolsView.svelte`. Bar = **catalog coverage**
  (green installed / gray rest), not sync-state.
- **Agents workspace streamlined**: removed the filter lens (per-row install dots already show count);
  Division dropdown moved onto the search row as the first element (neutral form styling); detail pane
  hidden when no agent is selected (list goes full-width).
- **Cold `cargo test` tauri-gate fix**: `.cargo/config.toml` feeds `TAURI_CONFIG` so bare cargo (tests/CI)
  passes the `macos-private-api` allowlist gate (Tauri CLI overrides it for real builds). `macos-private-api`
  enabled in `Cargo.toml`. Verified `tauri dev` still launches clean.
- **Green throughout**: svelte-check 0 errors, cargo 258/0.

## ✅ Phase C (2026-06-14) — both red items closed
- **Renderer parity VERIFIED.** `render/mod.rs` mirrors the upstream shell converter byte-for-byte
  (`source_field`/`source_body`/`slugify`/`output_slug`); new `--ignored` test diffs the real
  `scripts/convert.sh` → **232 agents × 5 transform tools = 1160/1160 byte-identical**. The
  `current`/Diff/Update model is now proven, not assumed.
- **Uninstall safety RESOLVED.** `remove_agent_files` backs up modified files FIRST (separate pass),
  byte-identical files need no backup, backup failure aborts the delete (original preserved). Tests cover
  every path.
- **Cross-platform chrome DONE.** Config split: base `tauri.conf.json` (decorations, opaque, no
  macOS-only keys) + `tauri.macos.conf.json` override (overlay titlebar/traffic-light/transparency).
- **Cleanup:** brew→Agency rename finished in `lib.rs`; dead `Settings` fields purged; docs overhauled;
  stale release notes removed; new `tools/phase-c/` validation runner. **Catalog now = 232 agents**
  (the re-org landed). Green: cargo 258/0 + parity 1/0, svelte-check 0, build clean.

## 🟣 Tahoe app icon (read first if touching icons)
macOS 26 renders icons from a compiled **`Assets.car`** (Icon Composer Liquid Glass), NOT `.icns` — `.icns`
-only = blank/gray squircle ("icon jail"). FIXED: `actool` (full Xcode only, by path) compiles
`docs/icon/AppIcon.icon` → `src-tauri/Assets.car` (in `bundle.resources`) + Tahoe-aware
`src-tauri/icons/icon.icns`; `src-tauri/Info.plist` adds `CFBundleIconName=AppIcon` (Tauri merges it).
**Don't run `npm run tauri icon`** (clobbers the glass icns). Full recipe: `docs/icon/README-liquid-glass.md`.
Dev Dock hack REMOVED (lib.rs plain `.run()`, objc2 deps dropped).


## Current state (read NEXT-SESSION.md for the full picture + IMMEDIATE backlog)
- **Phase B + nav + Tools (2026-06-09):** Dashboard has 4 dependency-free charts (`HealthDonut`,
  `CoverageMatrix` category×tool, coverage-by-tool bars, category distribution). **Back/forward nav**
  (titlebar ◀▶, ⌘[/], mouse 3/4) over a `ui` NavLocation history; `agentsCategory`+`agentsSelected`
  lifted into `ui`. **Division pills deep-link** everywhere (`ui.openDivision`); lens counts narrow to
  the division; added "Not installed" lens; zero-count lenses/stats hide. **Tools = list/detail console**
  (`ToolsView` rebuilt): badges (`util/toolBadge`), health bars, versions (`tool_versions`), Reveal
  (`reveal_path`), Default-target Switch, Sync-to-catalog/Track-all/Remove-all, projects list. Dev Dock
  icon set on `RunEvent::Ready` (macOS debug). Icon redrawn as a **macOS squircle** (regenerated).
- **UNIFIED Agents workspace (Phase A done).** Agents + Library are ONE three-pane surface
  (`AgentsWorkspace.svelte`): list pane (filter lens All/Installed/Needs-attention/Untracked + search +
  Category ▾ + Select-mode bulk) · `ResizeHandle` · persistent detail pane (`PersonaBody` + the
  `DeploymentMatrix`). `PersonaDiscover.svelte` + `AgentLibrary.svelte` DELETED.
- **Deployment band under the name/division**: summary pills for installed tools + a "USE WITH ⌄"
  disclosure. User tools = `Switch` (on=installed); project tools = Install/Add-project + per-project
  sub-rows. Drift actions (Diff/Track/Update) inline when applicable. New `Switch.svelte` (shared,
  extracted from Settings→Network), `util/platform.ts` (⌘/Ctrl shortcut glyphs).
- Nav: `library` section retired everywhere; `ui.agentsFilter` + `ui.openAgents(filter)` deep-link
  (Dashboard cards + palette use it). Section id stayed `personas`.
- **Byte-identical foreign → `current`**; **recursive indexing**; `agent_diff` + `DiffModal`; Track (safe).
- Active catalog = **userClone** `/Users/michael/Software/AgentLand/agency-agents` (manage:true).
- **Signed + notarized `.app`/`.dmg`** via `scripts/release.sh` (SKIP_UPDATER=1). 247 Rust tests / 0.
- 🔵 NEXT: **Phase B** = 4 Dashboard charts (coverage matrix · health donut · category distribution ·
  per-tool coverage), dependency-free SVG/CSS, cells deep-link into the workspace. Then **Phase C** =
  Windows/Linux titlebar degradation + "this device" copy + home-path display.
- ✅ CLOSED 2026-06-14: (1) **renderer parity** vs convert.sh — VERIFIED 1160/1160 byte-identical;
  (2) **uninstall safety** — RESOLVED (backup-first for modified, none for byte-identical, abort-on-fail).

## (historical) Earlier this arc
- **Adopt → Track**: destructive Adopt gone. `track_agent` records provenance, writes nothing; every
  write backs up first (`<app_data>/backups/`); `agent_diff` for review-before-Update.
- **categories from tooling**: `discover_categories` parses `AGENT_DIRS` from
  `scripts/convert.sh`. **Data fix: `integrations` (convert.sh output) dropped (210→209); `strategy`
  added.** Removed the orphan `integrations/backend-architect-with-memory.md` from the baseline (it's
  a valid-but-misfiled enrichment example; to ship it for real, promote it UPSTREAM into a real
  category — then it flows in via refresh).
- **#1 slices 2–4 — catalog source**: `CatalogSource` (Bundled | Managed{~/.agency-agents} |
  UserClone{path,manage}) in `state/catalog.json`; corpus reads/writes the RESOLVED root. Detect
  (~/.agency-agents + "Find" scan), provision (git clone or snapshot), pull (git pull or tarball).
  First-run picker (`CatalogFirstRun`) + `Settings → Catalog`. Verbs Track/Update, manage-with-
  permission, picker+Find — all as decided. cargo test 275/0; svelte-check 0 err; build green.
- ⚠️ NOTE: existing installs (incl. Michael's) have no catalog.json → the **first-run picker WILL
  appear** on next launch (by design — one-time source choice; pick "Bundled" to keep current).

> Full plan + sequence: `phases/phase-roadmap.md` (the "v2" block). Detailed resume notes +
> gotchas: `NEXT-SESSION.md`. Build spec: `contracts.md`. Architecture: `systemPatterns.md`.

## How to run (dev)
- `npm run tauri dev` from repo root. **Dev server is on port 1430** (NOT 1420 — that's
  brew-browser; sharing it makes one app load the other's frontend). HMR for frontend; Rust changes
  recompile. The app opens on **Agents** (personas).
- Reference clones (read-only): `/tmp/brew-browser-inspect`, `/tmp/agency-agents-inspect`.

## What works (verified)
- **Agents** catalog (210 agents / 16 categories), search, persona detail with an **Install** menu.
- **Library** — flat list of installs; your ~184 `install.sh` agents show as `foreign` with Adopt.
- **Tools**, **Loadouts** (Agentfile), **Dashboard** (agency rollup), Activity, Settings (⌘,).
- Backend: `corpus · render · install · github · util · commands{github,settings,updater}`.
  `cargo test` ~265/0; `vite build` + `svelte-check` green; app boots clean (210 corpus seeded).
- New brain-circuit **app icon** (dark shipped; light master in `docs/icon/`). About window rebranded.

## Immediate next: Michael runs it, then #2 / #3
**#1 slices 1–4 ✅ done.** Remaining for #1 (deferred refinements, non-blocking):
- `aliases.json` (slug renames across catalog versions) — not yet honored.
- Explicit **orphan** surfacing (ledger rows whose slug left the catalog) + unique-slug enforcement.
- `.agency-cache/` convention + add to the agency-agents repo `.gitignore` (cache not yet written).
- Symlink-aware reconcile (the `~/.claude` alias case) — still the old behavior.

Then: **#2 Track-all / Update-all**; **#3 tool-grouped Library IA** (L1 tools+counts → L2 per-tool)
+ wire `agent_diff` into a review-before-Update UI.

## Decisions locked (this session)
- Build order: **Both, Track first** → Track DONE, now #1.
- Clone detection: **picker-primary + a "Find Agency Agents" button** (opt-in scan, not auto).
- Existing clone: **manage-with-permission**. Managed path: **`~/.agency-agents`**.
- Cache dir: `.agency-cache/`. Verbs: **Track / Update**.
- Categories: **parse from repo tooling** (`AGENT_DIRS` in convert.sh), not a frontmatter heuristic.

## ✅ RESOLVED: "Adopt" is no longer unsafe
Adopt → **Track** (non-destructive) + backup-on-write shipped this session. The old clobber path is
gone.

<script lang="ts">
  /**
   * DeploymentMatrix — "where is this agent, and what do I do about it."
   *
   * Layout (per Michael's design): a calm SUMMARY line of pills for the tools
   * the agent is installed in, sitting right under the name/division; the full
   * per-tool controls live in a DISCLOSURE below it. User-scoped tools toggle
   * with a Switch (on = installed); project-scoped tools (Cursor, opencode) keep
   * an explicit Install / Add-project flow with per-project sub-rows, since one
   * switch can't represent N projects. Drift actions (Update / Track / Diff)
   * appear inline only when they apply.
   *
   * Reuses the install store verbs unchanged — no backend change.
   */
  import DownloadIcon from "@lucide/svelte/icons/download";
  import RefreshIcon from "@lucide/svelte/icons/refresh-cw";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import XIcon from "@lucide/svelte/icons/x";
  import DiffIcon from "@lucide/svelte/icons/file-diff";
  import FolderPlusIcon from "@lucide/svelte/icons/folder-plus";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";

  import Switch from "./Switch.svelte";
  import { install, SUPPORTED_TOOLS, type ToolDef } from "$lib/stores/install.svelte";
  import { toast } from "$lib/stores/toast.svelte";
  import { open as openDialog } from "@tauri-apps/plugin-dialog";
  import type { Agent, InstalledAgent, InstallState, Tool } from "$lib/types";

  let {
    agent,
    onDiff,
  }: {
    agent: Agent;
    onDiff: (t: { slug: string; tool: Tool; projectPath: string | null; name: string }) => void;
  } = $props();

  // All install rows for this agent, and a per-tool grouping for the disclosure.
  const rows = $derived(install.forSlug(agent.slug));
  const blocks = $derived(
    SUPPORTED_TOOLS.map((t) => ({ def: t, installs: rows.filter((r) => r.tool === t.id) })),
  );
  // Summary pills: one per install row, sorted by tool label for a stable scan.
  const installedRows = $derived(
    rows.slice().sort((a, b) => install.toolLabel(a.tool).localeCompare(install.toolLabel(b.tool))),
  );

  // Disclosure state. Default per agent: open when nothing's deployed yet (the
  // next move is to deploy), closed once there's a summary to glance at. Reset
  // only when the selected agent changes, so toggles stick while you read one.
  let open = $state(false);
  let lastSlug = "";
  $effect(() => {
    if (agent.slug !== lastSlug) {
      lastSlug = agent.slug;
      open = install.forSlug(agent.slug).length === 0;
    }
  });

  const DIFFABLE: InstallState[] = ["foreign", "modified", "outdated"];

  function stateInfo(s: InstallState): { label: string; tone: string; hint: string } {
    switch (s) {
      case "current":  return { label: "In sync",          tone: "ok",     hint: "Matches the catalog version" };
      case "outdated": return { label: "Update available", tone: "warn",   hint: "A newer catalog version exists" };
      case "modified": return { label: "Edited locally",   tone: "warn",   hint: "Differs from the catalog" };
      case "foreign":  return { label: "Untracked",        tone: "info",   hint: "Recognized but not managed by the app yet" };
      case "removed":  return { label: "Missing on disk",  tone: "danger", hint: "Tracked but the file is gone" };
    }
  }
  function dotTone(s: InstallState): string {
    if (s === "current") return "ok";
    if (s === "outdated" || s === "modified") return "warn";
    if (s === "foreign") return "info";
    return "danger";
  }

  let busyKey = $state<string | null>(null);
  function keyOf(tool: Tool, projectPath: string | null): string {
    return `${tool}:${projectPath ?? ""}`;
  }
  function isBusy(tool: Tool, projectPath: string | null): boolean {
    return busyKey === keyOf(tool, projectPath) || install.busy === `${agent.slug}:${tool}`;
  }

  async function run(key: string, fn: () => Promise<unknown>, ok: string) {
    busyKey = key;
    try {
      await fn();
      toast.success(ok);
    } catch (e) {
      toast.error("Action failed", String(e));
    } finally {
      busyKey = null;
    }
  }

  async function doInstall(t: ToolDef) {
    let projectPath: string | null = null;
    if (t.scope === "project") {
      const picked = await openDialog({ directory: true, title: `Install ${agent.name} into ${t.label}…` });
      if (!picked || Array.isArray(picked)) return; // cancelled
      projectPath = picked;
    }
    await run(keyOf(t.id, projectPath), () => install.install(agent.slug, t.id, projectPath), `Installed into ${t.label}`);
  }

  // User-scoped switch: on → install (user dest), off → uninstall the single row.
  function toggleUser(t: ToolDef, installs: InstalledAgent[]) {
    if (installs.length > 0) {
      const row = installs[0];
      return run(keyOf(t.id, null), () => install.uninstall(row.slug, row.tool, row.projectPath), `Removed from ${t.label}`);
    }
    return run(keyOf(t.id, null), () => install.install(agent.slug, t.id, null), `Installed into ${t.label}`);
  }

  function doUpdate(row: InstalledAgent) {
    return run(keyOf(row.tool, row.projectPath), () => install.update(row.slug, row.tool, row.projectPath), `Updated · ${install.toolLabel(row.tool)}`);
  }
  function doTrack(row: InstalledAgent) {
    return run(keyOf(row.tool, row.projectPath), () => install.track(row.slug, row.tool, row.projectPath), `Tracking · ${install.toolLabel(row.tool)}`);
  }
  function doRemove(row: InstalledAgent) {
    return run(keyOf(row.tool, row.projectPath), () => install.uninstall(row.slug, row.tool, row.projectPath), `Removed from ${install.toolLabel(row.tool)}`);
  }
</script>

<div class="dm">
  <!-- ── Summary line: pills for installed tools + disclosure toggle ── -->
  <button class="dm-head" aria-expanded={open} onclick={() => (open = !open)}>
    <span class="dm-summary">
      {#if installedRows.length > 0}
        {#each installedRows as r (r.dest)}
          {@const info = stateInfo(r.state)}
          <span class="dm-pill" data-tone={info.tone} title={`${install.toolLabel(r.tool)}${r.projectPath ? " · " + r.projectPath.split("/").pop() : ""} — ${info.label}`}>
            <span class="dm-pdot" data-tone={info.tone}></span>
            <span class="dm-plabel">{install.toolLabel(r.tool)}{#if r.projectPath}<span class="dm-pproj">{r.projectPath.split("/").pop()}</span>{/if}</span>
          </span>
        {/each}
      {:else}
        <span class="dm-none">Not deployed yet</span>
      {/if}
    </span>
    <span class="dm-disc">
      <span class="dm-disc-label">Use with</span>
      <ChevronDown size={15} class={open ? "dm-chev open" : "dm-chev"} />
    </span>
  </button>

  {#if open}
    <ul class="dm-list">
      {#each blocks as b (b.def.id)}
        <li class="dm-tool">
          <div class="dm-row">
            <span class="dm-name">{b.def.label}</span>
            <span class="dm-scope">{b.def.scope === "user" ? "user" : "project"}</span>

            <span class="dm-right">
              {#if b.def.scope === "user"}
                {#if b.installs.length > 0}
                  {@const row = b.installs[0]}
                  {@const info = stateInfo(row.state)}
                  {#if row.state !== "current"}
                    <span class="dm-state" data-tone={info.tone} title={info.hint}>{info.label}</span>
                  {/if}
                  <span class="dm-acts">
                    {#if DIFFABLE.includes(row.state)}
                      <button class="dm-act" title="See what differs from the catalog" onclick={() => onDiff({ slug: row.slug, tool: row.tool, projectPath: row.projectPath, name: agent.name })}><DiffIcon size={13} /></button>
                    {/if}
                    {#if row.state === "foreign"}
                      <button class="dm-act" title="Track — keep this file, start managing it" disabled={isBusy(row.tool, row.projectPath)} onclick={() => doTrack(row)}><PlusIcon size={13} /></button>
                    {/if}
                    {#if row.state !== "current"}
                      <button class="dm-act" title="Update — replace with the catalog version (yours is backed up)" disabled={isBusy(row.tool, row.projectPath)} onclick={() => doUpdate(row)}><RefreshIcon size={13} /></button>
                    {/if}
                  </span>
                {/if}
                <Switch
                  checked={b.installs.length > 0}
                  disabled={isBusy(b.def.id, null)}
                  ariaLabel={`Deploy ${agent.name} into ${b.def.label}`}
                  onToggle={() => toggleUser(b.def, b.installs)}
                />
              {:else}
                <button class="dm-add" disabled={isBusy(b.def.id, null)} onclick={() => doInstall(b.def)}>
                  {#if b.installs.length > 0}<FolderPlusIcon size={13} /> Add project{:else}<DownloadIcon size={13} /> Install{/if}
                </button>
              {/if}
            </span>
          </div>

          {#if b.def.scope === "project" && b.installs.length > 0}
            <ul class="dm-subrows">
              {#each b.installs as row (row.dest)}
                {@const info = stateInfo(row.state)}
                {@const busy = isBusy(row.tool, row.projectPath)}
                <li class="dm-subrow">
                  <span class="dm-dot" data-tone={dotTone(row.state)} title={info.hint}></span>
                  <span class="dm-substate" data-tone={info.tone}>{info.label}</span>
                  {#if row.projectPath}<span class="dm-proj" title={row.projectPath}>{row.projectPath.split("/").pop()}</span>{/if}
                  <span class="dm-acts">
                    {#if DIFFABLE.includes(row.state)}
                      <button class="dm-act" title="See what differs" onclick={() => onDiff({ slug: row.slug, tool: row.tool, projectPath: row.projectPath, name: agent.name })}><DiffIcon size={13} /></button>
                    {/if}
                    {#if row.state === "foreign"}
                      <button class="dm-act" title="Track" disabled={busy} onclick={() => doTrack(row)}><PlusIcon size={13} /></button>
                    {/if}
                    {#if row.state !== "current"}
                      <button class="dm-act" title="Update from catalog" disabled={busy} onclick={() => doUpdate(row)}><RefreshIcon size={13} /></button>
                    {/if}
                    <button class="dm-act danger" title="Remove from this project" disabled={busy} onclick={() => doRemove(row)}><XIcon size={13} /></button>
                  </span>
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .dm { display: flex; flex-direction: column; gap: var(--space-2); }

  /* ── Summary head (pills + disclosure toggle) ── */
  .dm-head {
    display: flex; align-items: center; gap: var(--space-3);
    width: 100%; padding: 2px 0; background: transparent; cursor: pointer; text-align: left;
  }
  .dm-summary { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; gap: 6px; }
  .dm-none { font-size: var(--text-body-sm); color: var(--color-text-muted); }
  .dm-pill {
    display: inline-flex; align-items: center; gap: 5px;
    height: 22px; padding: 0 9px; border-radius: 999px;
    border: 1px solid var(--color-border); background: var(--color-surface-sunken);
    color: var(--color-text-secondary); font-size: var(--text-caption); line-height: 1;
  }
  .dm-pill[data-tone="ok"]     { color: var(--color-text-primary); }
  .dm-pill[data-tone="warn"]   { border-color: color-mix(in srgb, var(--color-warning) 55%, var(--color-border)); color: var(--color-warning); }
  .dm-pill[data-tone="info"]   { border-color: color-mix(in srgb, var(--color-brand) 55%, var(--color-border)); color: var(--color-brand); }
  .dm-pill[data-tone="danger"] { border-color: color-mix(in srgb, var(--color-danger) 55%, var(--color-border)); color: var(--color-danger); }
  .dm-pdot { width: 6px; height: 6px; border-radius: 999px; background: var(--color-text-muted); flex: none; }
  .dm-pdot[data-tone="ok"]     { background: var(--color-success); }
  .dm-pdot[data-tone="warn"]   { background: var(--color-warning); }
  .dm-pdot[data-tone="info"]   { background: var(--color-brand); }
  .dm-pdot[data-tone="danger"] { background: var(--color-danger); }
  /* Optically center the pill label — nudge the text up 2px against the dot. */
  .dm-plabel { position: relative; top: -2px; }
  .dm-pproj { color: var(--color-text-muted); }
  .dm-pproj::before { content: "· "; }

  .dm-disc { display: inline-flex; align-items: center; gap: 5px; flex: none; color: var(--color-text-muted); }
  .dm-disc-label { font-size: var(--text-caption); text-transform: uppercase; letter-spacing: 0.04em; font-weight: var(--fw-semibold); }
  .dm-head :global(.dm-chev) { transition: transform var(--motion-duration-fast) var(--motion-ease-out); }
  .dm-head :global(.dm-chev.open) { transform: rotate(180deg); }

  /* ── Disclosure list ── */
  .dm-list { display: flex; flex-direction: column; gap: 1px; margin-top: var(--space-1); }
  .dm-tool { padding: 4px var(--space-2); border-radius: var(--radius-md); }
  .dm-tool:hover { background: var(--color-surface-sunken); }
  .dm-row { display: flex; align-items: center; gap: var(--space-2); min-height: 32px; }
  .dm-name { font-size: var(--text-body-sm); font-weight: var(--fw-medium); color: var(--color-text-primary); }
  .dm-scope {
    font-size: 10px; color: var(--color-text-muted);
    border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0 4px; line-height: 1.4;
  }
  .dm-right { margin-left: auto; display: inline-flex; align-items: center; gap: var(--space-2); }
  .dm-state { font-size: var(--text-caption); }
  .dm-state[data-tone="warn"]   { color: var(--color-warning); }
  .dm-state[data-tone="info"]   { color: var(--color-brand); }
  .dm-state[data-tone="danger"] { color: var(--color-danger); }

  .dm-add {
    display: inline-flex; align-items: center; gap: 4px;
    height: 26px; padding: 0 10px; border-radius: var(--radius-sm);
    background: var(--color-brand); color: var(--color-text-inverse); border: 0;
    font-size: var(--text-caption); cursor: pointer;
  }
  .dm-add:hover:not(:disabled) { filter: brightness(1.08); }
  .dm-add:disabled { opacity: 0.5; cursor: default; }

  .dm-acts { display: inline-flex; align-items: center; gap: 2px; }
  .dm-act {
    display: inline-flex; align-items: center; justify-content: center;
    width: 24px; height: 24px; border-radius: var(--radius-sm);
    background: transparent; color: var(--color-text-muted); cursor: pointer;
  }
  .dm-act:hover:not(:disabled) { background: var(--color-surface); color: var(--color-text-primary); }
  .dm-act.danger:hover:not(:disabled) { background: var(--color-danger); color: #fff; }
  .dm-act:disabled { opacity: 0.4; cursor: default; }

  /* project sub-rows */
  .dm-subrows { display: flex; flex-direction: column; gap: 1px; margin: 2px 0 2px var(--space-3); }
  .dm-subrow { display: flex; align-items: center; gap: var(--space-2); padding: 2px 0; }
  .dm-dot { width: 7px; height: 7px; border-radius: 999px; flex: none; background: var(--color-text-muted); }
  .dm-dot[data-tone="ok"]     { background: var(--color-success); }
  .dm-dot[data-tone="warn"]   { background: var(--color-warning); }
  .dm-dot[data-tone="info"]   { background: var(--color-brand); }
  .dm-dot[data-tone="danger"] { background: var(--color-danger); }
  .dm-substate { font-size: var(--text-caption); color: var(--color-text-secondary); }
  .dm-substate[data-tone="warn"]   { color: var(--color-warning); }
  .dm-substate[data-tone="info"]   { color: var(--color-brand); }
  .dm-substate[data-tone="danger"] { color: var(--color-danger); }
  .dm-proj { font-size: var(--text-caption); color: var(--color-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px; }
  .dm-subrow .dm-acts { margin-left: auto; }
</style>

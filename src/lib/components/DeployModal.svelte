<script lang="ts">
  /**
   * DeployModal — bulk-deploy an arbitrary set of agents into user-scoped tools.
   *
   * Used by the divisions landing (a division's agents) and the Teams view (a
   * preset or saved team's agents). For the given agent set, every user-scoped
   * tool shows a TRI-STATE checkbox reflecting coverage:
   *   [✓] all agents in the set are installed there
   *   [–] some are (partial)
   *   [ ] none are
   * Clicking fills the set (installs the missing agents) or, when already full,
   * removes the whole set from that tool. Toggles apply immediately and the
   * tri-state recomputes live off the reconcile — same mental model as the
   * per-agent Switch in DeploymentMatrix.
   *
   * Project-scoped tools (Cursor, opencode) are intentionally absent: each agent
   * would need its own folder prompt, which doesn't fit a set-wide toggle —
   * those stay in the per-agent view. We also only offer tools actually present
   * on this device (detected, or already holding an install of the set).
   *
   * Removal mirrors the per-agent rules: a plain uninstall is silent and
   * re-installable; if the set includes `foreign` files (not installed by this
   * app) the action is a genuine Delete and asks first (the backend backs up
   * any user edits before removing).
   */
  import Modal from "./Modal.svelte";
  import Button from "./Button.svelte";
  import DestructiveConfirm from "./DestructiveConfirm.svelte";
  import { corpus } from "$lib/stores/corpus.svelte";
  import { install, SUPPORTED_TOOLS } from "$lib/stores/install.svelte";
  import { toast } from "$lib/stores/toast.svelte";
  import type { Tool, Agent, InstalledAgent } from "$lib/types";

  interface Props {
    /** Modal heading, e.g. "Deploy Engineering" or "Deploy Mobile Launch". */
    title: string;
    /** The agent slugs this deployment acts on. */
    agentSlugs: string[];
    onClose: () => void;
  }
  let { title, agentSlugs, onClose }: Props = $props();

  // User-scoped tools deploy without a per-agent folder prompt — and we only
  // offer ones actually present on this device (detected, or already holding an
  // install from this set). Before detection loads, show all rather than hide
  // valid targets. Mirrors DeploymentMatrix / the Tools view.
  const USER_TOOLS = $derived(
    SUPPORTED_TOOLS.filter(
      (t) =>
        t.scope === "user" &&
        (install.tools.length === 0 ||
          install.tools.some((ti) => ti.tool === t.id && ti.detected) ||
          install.installed.some((r) => r.tool === t.id && r.state !== "removed")),
    ),
  );

  let busyTool = $state<Tool | null>(null);
  // Pending foreign-delete confirmation (set when a removal would touch files
  // we don't manage). Holds the rows so the confirm can act without recomputing.
  let confirm = $state<{ tool: Tool; rows: InstalledAgent[] } | null>(null);

  // The agents in this set that exist in the current corpus (unknown slugs from
  // a stale preset/team are silently skipped rather than shown as ghosts).
  const slugSet = $derived(new Set(agentSlugs));
  const agents = $derived<Agent[]>(corpus.agents.filter((a) => slugSet.has(a.slug)));
  const total = $derived(agents.length);

  // Per-tool: which of THIS set's agents are present (any non-removed row).
  const rowsByTool = $derived.by<Map<Tool, InstalledAgent[]>>(() => {
    const slugs = new Set(agents.map((a) => a.slug));
    const m = new Map<Tool, InstalledAgent[]>();
    for (const r of install.installed) {
      if (r.state === "removed") continue; // ledger says installed but file gone
      if (!slugs.has(r.slug)) continue;
      const arr = m.get(r.tool);
      if (arr) arr.push(r);
      else m.set(r.tool, [r]);
    }
    return m;
  });

  function coverage(tool: Tool) {
    const rows = rowsByTool.get(tool) ?? [];
    const present = new Set(rows.map((r) => r.slug)); // distinct agents present
    const count = present.size;
    return {
      count,
      rows,
      all: total > 0 && count === total,
      some: count > 0 && count < total,
      hasForeign: rows.some((r) => r.state === "foreign"),
    };
  }

  async function apply(tool: Tool) {
    if (busyTool) return;
    const cov = coverage(tool);
    const label = install.toolLabel(tool);

    if (cov.all) {
      // Full → remove the whole set from this tool.
      if (cov.hasForeign) {
        confirm = { tool, rows: cov.rows };
        return;
      }
      await doRemove(tool, cov.rows, `Removed ${total} from ${label}`);
      return;
    }

    // None or partial → fill: install the agents not yet present here.
    const presentSlugs = new Set((rowsByTool.get(tool) ?? []).map((r) => r.slug));
    const missing = agents.filter((a) => !presentSlugs.has(a.slug));
    if (missing.length === 0) return;
    busyTool = tool;
    try {
      const { ok, fail } = await install.bulk(
        "install",
        missing.map((a) => ({ slug: a.slug, tool, projectPath: null })),
      );
      if (fail === 0) toast.success(`Installed ${ok} into ${label}`);
      else toast.error(`${label}: ${ok} installed, ${fail} failed`);
    } finally {
      busyTool = null;
    }
  }

  async function doRemove(tool: Tool, rows: InstalledAgent[], okMsg: string) {
    busyTool = tool;
    try {
      const { ok, fail } = await install.bulk(
        "uninstall",
        rows.map((r) => ({ slug: r.slug, tool: r.tool, projectPath: r.projectPath })),
      );
      if (fail === 0) toast.success(okMsg);
      else toast.error(`${install.toolLabel(tool)}: ${ok} removed, ${fail} failed`);
    } finally {
      busyTool = null;
    }
  }

  async function confirmRemove() {
    if (!confirm) return;
    const { tool, rows } = confirm;
    confirm = null;
    await doRemove(tool, rows, `Deleted ${rows.length} from ${install.toolLabel(tool)}`);
  }
</script>

<Modal open {title} onClose={onClose}>
  <div class="intro">
    <p class="sub">{total} agent{total === 1 ? "" : "s"}</p>
    <p class="hint">Toggle a tool to deploy the whole set into it — or remove it. Partly-installed tools fill in the rest.</p>
  </div>

  <ul class="tools">
    {#each USER_TOOLS as t (t.id)}
      {@const cov = coverage(t.id)}
      {@const busy = busyTool === t.id}
      <li class="tool">
        <label class="tlabel">
          <input
            type="checkbox"
            class="check"
            checked={cov.all}
            indeterminate={cov.some}
            disabled={busy || total === 0}
            onchange={() => apply(t.id)}
            aria-label={`Deploy into ${t.label}`}
          />
          <span class="tname">{t.label}</span>
        </label>
        <span class="tcount" class:on={cov.all} class:partial={cov.some}>
          {#if busy}working…{:else if cov.all}all {total}{:else if cov.some}{cov.count}/{total}{:else}none{/if}
          {#if cov.hasForeign && !busy}<span class="foreign" title="Includes files installed outside this app">· foreign</span>{/if}
        </span>
      </li>
    {/each}
  </ul>

  {#snippet actions()}
    <span class="legend"><span class="lbox on">✓</span> all <span class="lbox partial">–</span> some <span class="lbox"></span> none</span>
    <Button variant="primary" onclick={onClose}>Done</Button>
  {/snippet}
</Modal>

{#if confirm}
  {@const n = confirm.rows.length}
  {@const label = install.toolLabel(confirm.tool)}
  <DestructiveConfirm
    open
    title="Delete {n} file{n === 1 ? '' : 's'} from {label}?"
    confirmLabel="Delete {n}"
    onConfirm={confirmRemove}
    onCancel={() => (confirm = null)}
  >
    <p>
      This <strong>permanently removes {n} file{n === 1 ? "" : "s"} from disk</strong>,
      <strong>including files installed outside this app</strong>. Any edits you made are backed up first.
    </p>
  </DestructiveConfirm>
{/if}

<style>
  .intro { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-3); }
  .sub { font-size: var(--text-caption); color: var(--color-text-muted); }
  .hint { font-size: var(--text-body-sm); color: var(--color-text-muted); }

  .tools { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
  .tool {
    display: flex; align-items: center; justify-content: space-between;
    padding: var(--space-2) var(--space-2); border-radius: var(--radius-md);
  }
  .tool:hover { background: var(--color-surface-sunken); }
  .tlabel { display: flex; align-items: center; gap: var(--space-3); cursor: pointer; min-width: 0; }
  .check { width: 16px; height: 16px; accent-color: var(--color-brand); cursor: pointer; }
  .tname { font-size: var(--text-body); color: var(--color-text-primary); font-weight: var(--fw-medium); }
  .tcount { font-size: var(--text-body-sm); color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
  .tcount.on { color: var(--color-success); }
  .tcount.partial { color: var(--color-text-secondary); }
  .foreign { color: var(--color-info); }

  /* Legend sits in the footer row, pushed left so Done stays right. Neutral
     gray swatches — a key, not interactive controls. */
  .legend { display: inline-flex; align-items: center; gap: 6px; margin-right: auto; font-size: var(--text-caption); color: var(--color-text-muted); }
  .lbox {
    display: inline-flex; align-items: center; justify-content: center;
    width: 15px; height: 15px; border-radius: 3px;
    border: 1px solid var(--color-text-muted); font-size: 10px; line-height: 1;
    color: var(--color-surface-raised);
  }
  .lbox.on, .lbox.partial { background: var(--color-text-muted); border-color: var(--color-text-muted); }
</style>

<script lang="ts">
  /**
   * PlaybookModal — "how to get real work out of your agents." The flagship
   * surface for the Playbook content (practices + copyable starter prompts).
   * Opened from the title-bar ? button and the command palette.
   */
  import Modal from "./Modal.svelte";
  import Button from "./Button.svelte";
  import StarterPrompt from "./StarterPrompt.svelte";
  import { ui } from "$lib/stores/ui.svelte";
  import { PLAYBOOK_PRACTICES, STARTER_PROMPTS } from "$lib/data/playbook";
</script>

<Modal open={ui.playbookOpen} title="The Playbook" size="wide" onClose={() => ui.closePlaybook()}>
  <div class="pb">
    <p class="intro">
      Agents pay off when you <strong>direct them like a team</strong>. Name the outcome,
      cast the right squad, and loop until it's proven. Here's the short version.
    </p>

    <ol class="practices">
      {#each PLAYBOOK_PRACTICES as p, i (p.title)}
        <li>
          <span class="num">{i + 1}</span>
          <div class="p-body">
            <span class="p-title">{p.title}</span>
            <p>{p.body}</p>
          </div>
        </li>
      {/each}
    </ol>

    <h2 class="sec">Starter prompts</h2>
    <p class="sec-sub">Copy one, swap the <code>[brackets]</code>, and paste it into your tool.</p>
    <div class="starters">
      {#each STARTER_PROMPTS as s (s.id)}
        <StarterPrompt label={s.label} description={s.description} template={s.template} />
      {/each}
    </div>
  </div>

  {#snippet actions()}
    <Button variant="primary" onclick={() => ui.closePlaybook()}>Got it</Button>
  {/snippet}
</Modal>

<style>
  .pb { max-height: 62vh; overflow-y: auto; padding-right: var(--space-1); }
  .intro { font-size: var(--text-body); color: var(--color-text-secondary); line-height: var(--lh-normal); margin-bottom: var(--space-4); }
  .intro strong { color: var(--color-text-primary); }

  .practices { list-style: none; margin: 0 0 var(--space-5); padding: 0; display: flex; flex-direction: column; gap: var(--space-3); }
  .practices li { display: flex; gap: var(--space-3); }
  .num {
    flex: none; display: inline-flex; align-items: center; justify-content: center;
    width: 24px; height: 24px; border-radius: 999px;
    background: var(--color-brand); color: var(--color-text-inverse);
    font-size: var(--text-caption); font-weight: var(--fw-bold);
  }
  .p-body { flex: 1; min-width: 0; }
  .p-body .p-title { display: block; font-size: var(--text-body); font-weight: var(--fw-semibold); color: var(--color-text-primary); margin-bottom: 2px; }
  .p-body p { font-size: var(--text-body-sm); color: var(--color-text-secondary); line-height: var(--lh-normal); }

  .sec { font-size: var(--text-body-sm); font-weight: var(--fw-semibold); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
  .sec-sub { font-size: var(--text-body-sm); color: var(--color-text-secondary); margin-bottom: var(--space-3); }
  .sec-sub code { font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.9em; background: var(--color-surface-sunken); padding: 1px 5px; border-radius: var(--radius-sm); }
  .starters { display: flex; flex-direction: column; gap: var(--space-2); }
</style>

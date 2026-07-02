/**
 * i18n.svelte.ts — reactive translation store
 *
 * Wraps the static translation dictionaries in a Svelte 5 reactive layer.
 * Reads `ui.language` (a $state) so every template that calls `t()` re-renders
 * when the user picks a different language in Settings.
 *
 * Usage in any .svelte file:
 *   import { t } from "$lib/stores/i18n.svelte";
 *   <span>{t("nav.dashboard")}</span>
 *   <span>{t("nav.agentsCount", { n: 42 })}</span>
 */

import { translate } from "$lib/i18n/translations";
import { ui } from "./ui.svelte";

/**
 * Translate a key into the currently selected UI language.
 * Call this directly in Svelte templates — it reads `ui.language` (a $state)
 * so the template automatically re-renders when the language changes.
 */
export function t(key: string, replacements?: Record<string, string | number>): string {
  // Read ui.language inside every call so Svelte 5 tracks the dependency.
  // The lang attribute on <html> is kept in sync by ui.setLanguage().
  return translate(ui.language, key, replacements);
}

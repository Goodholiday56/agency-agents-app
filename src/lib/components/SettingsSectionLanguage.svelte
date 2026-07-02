<script lang="ts">
  /**
   * SettingsSectionLanguage.svelte
   *
   * Language preference dropdown. The app currently ships English-only —
   * this sets the `<html lang>` attribute so browsers, screen readers,
   * and `toLocale*` APIs honour the user's region. It also prepares the
   * settings surface for future i18n.
   */

  import { ui } from "$lib/stores/ui.svelte";
  import { t } from "$lib/stores/i18n.svelte";

  /** Major world languages with BCP 47 tags and native labels.
      Sorted with English first, then by approximate global speaker count. */
  const LANGUAGES: { value: string; label: string }[] = [
    { value: "en",    label: "English" },
    { value: "zh-CN", label: "中文（简体）" },
    { value: "zh-TW", label: "中文（繁體）" },
    { value: "hi",    label: "हिन्दी" },
    { value: "es",    label: "Español" },
    { value: "fr",    label: "Français" },
    { value: "ar",    label: "العربية" },
    { value: "pt",    label: "Português" },
    { value: "ru",    label: "Русский" },
    { value: "ja",    label: "日本語" },
    { value: "de",    label: "Deutsch" },
    { value: "ko",    label: "한국어" },
    { value: "it",    label: "Italiano" },
    { value: "tr",    label: "Türkçe" },
    { value: "nl",    label: "Nederlands" },
    { value: "pl",    label: "Polski" },
    { value: "vi",    label: "Tiếng Việt" },
    { value: "th",    label: "ไทย" },
    { value: "id",    label: "Bahasa Indonesia" },
  ];

  function onLanguageChange(e: Event) {
    const value = (e.currentTarget as HTMLSelectElement).value;
    ui.setLanguage(value);
  }
</script>

<div class="section">
  <h2>{t("language.title")}</h2>

  <div class="field">
    <label for="language-select">{t("language.displayLanguage")}</label>
    <select
      id="language-select"
      class="select"
      value={ui.language}
      onchange={onLanguageChange}
    >
      {#each LANGUAGES as lang (lang.value)}
        <option value={lang.value}>{lang.label}</option>
      {/each}
    </select>
    <p class="hint">{t("language.hint")}</p>
  </div>
</div>

<style>
  .section { display: flex; flex-direction: column; gap: var(--space-5); max-width: 520px; }
  h2 {
    font-size: var(--text-h1);
    font-weight: var(--fw-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }
  .field { display: flex; flex-direction: column; gap: var(--space-2); }
  label {
    font-size: var(--text-body);
    font-weight: var(--fw-medium);
    color: var(--color-text-primary);
  }
  .hint {
    font-size: var(--text-body-sm);
    color: var(--color-text-muted);
    line-height: var(--lh-snug);
  }
  .select {
    width: 100%;
    max-width: 260px;
    padding: 6px var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-raised);
    color: var(--color-text-primary);
    font-size: var(--text-body);
    font-family: var(--font-sans);
    cursor: pointer;
  }
  .select:focus-visible {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: var(--shadow-focus-ring);
  }
</style>

/**
 * Tool badges — a per-tool accent color so the Tools panel reads like an app
 * shelf instead of a list of grey cards. We render a rounded-square badge with
 * this accent and the tool's initial (the colors disambiguate the several
 * "C" tools). These are stylized brand-adjacent accents, not official logos —
 * swap in real SVG marks here later without touching the components.
 */
import type { Tool } from "$lib/types";

const ACCENTS: Record<Tool, string> = {
  claudeCode: "#D97757", // Claude clay
  codex: "#10A37F", // OpenAI green
  geminiCli: "#4285F4", // Google blue
  copilot: "#6E40C9", // GitHub purple
  qwen: "#615CED", // Qwen indigo
  cursor: "#1F2430", // Cursor near-black
  opencode: "#FF6B35", // amber
  windsurf: "#09B6A2", // teal
  aider: "#8B5CF6", // violet
  openclaw: "#E11D48", // rose
  antigravity: "#0EA5E9", // sky
};

/** Accent color for a tool's badge (falls back to a neutral grey). */
export function toolAccent(tool: Tool): string {
  return ACCENTS[tool] ?? "#8A8F98";
}

/** Single-character mark for the badge — the label's first letter, uppercased. */
export function toolMark(label: string): string {
  return (label.trim()[0] ?? "?").toUpperCase();
}

# tools/categorize

## Status

Legacy inherited tooling from the source app. It is not part of the current Agency Agents runtime or release pipeline.

Agency Agents does not categorize Homebrew packages. Categories are discovered from the `agency-agents` repo structure and its tooling.

## Current Category Model

The app derives divisions/categories from the active AA catalog, using the upstream repo as source of truth. Category discovery lives in `src-tauri/src/corpus/mod.rs`.

## Action

Do not run this tool for Agency Agents release work. If category enrichment is needed later, create AA-specific tooling that reads agent Markdown/frontmatter and writes an explicitly reviewed artifact.

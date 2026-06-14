# tools/enrich

## Status

Legacy inherited tooling from the source app. It is not part of the current Agency Agents runtime or release pipeline.

Agency Agents does not currently run build-time LLM enrichment over a Homebrew catalog. The app presents the agent source and metadata from the `agency-agents` repo.

## Current Enrichment Model

There is no runtime LLM enrichment path in the app. Future enrichment should be explicit, reviewed, and tied to AA agent metadata rather than package descriptions.

## Action

Do not run this tool for Agency Agents release work. If it is repurposed, update the script, prompts, output schema, and this README in the same change.

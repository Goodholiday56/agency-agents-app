# tools/pipeline

## Status

Legacy inherited tooling from the source app. It is not part of the current Agency Agents runtime or release pipeline.

The previous pipeline rendered Homebrew catalog enrichment for an opt-in live-update endpoint. Agency Agents currently uses the `agency-agents` repository itself as the live catalog source.

## Current Release Pipeline

Use:

```sh
npm run build:phase-c
```

For signed macOS release work, see [docs/BUILD.md](../../docs/BUILD.md).

## Action

Do not deploy this pipeline for Agency Agents. Any future hosted metadata should have a new AA-specific design, endpoint audit, and Settings disclosure.

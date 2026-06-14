# tools/trending-collector

## Status

Legacy inherited tooling from the source app. It is not part of the current Agency Agents runtime or release pipeline.

The old collector watched Homebrew install analytics. Agency Agents does not use Homebrew analytics and does not publish a trending-history endpoint today.

## Current Trending Direction

If Agency Agents adds trending later, it should be based on AA-specific signals such as:

- upstream repo changes
- newly added agents
- recently updated agents
- GitHub stars/discussions/issues around the AA repo
- local install coverage, only if kept local and private

## Action

Do not deploy this collector for Agency Agents. Keep it only as inherited reference until it is removed or replaced with AA-specific tooling.

# Building Agency Agents

## Development Build

```sh
npm install
npm run tauri dev
```

The dev server runs on port `1430`. The app opens with HMR for frontend changes; Rust changes trigger a backend rebuild.

## Local QA Batch

The repeatable Phase C batch is:

```sh
npm run build:phase-c
```

It runs the local build/test checks and static platform-config validation.

When the configured Ubuntu and Windows VM targets are available:

```sh
npm run build:phase-c:full
```

This includes VM-assisted packaging checks. Do not claim native runtime verification for an OS unless the app was actually launched there.

## Standard Checks

```sh
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml --lib
npm run check
npm run build
```

Renderer parity against the active AA repo:

```sh
AGENCY_AGENTS_PARITY_ROOT=/Users/michael/Software/AgentLand/agency-agents \
cargo test --manifest-path src-tauri/Cargo.toml upstream_convert_sh_is_byte_identical_for_transform_tools -- --ignored
```

## Release Build On macOS

The release build produces a signed `.app` and `.dmg`.

### Prerequisites

1. Apple Developer ID Application certificate in the login keychain:

   ```sh
   security find-identity -v -p codesigning
   ```

2. App-specific Apple password generated at <https://appleid.apple.com>.

3. Signing environment outside the repo:

   ```sh
   mkdir -p ~/.config/agency-agents-app
   chmod 700 ~/.config/agency-agents-app
   ```

   Create `~/.config/agency-agents-app/signing.env`:

   ```sh
   export APPLE_ID="your@email.com"
   export APPLE_PASSWORD="xxxx-xxxx-xxxx-xxxx"
   export APPLE_TEAM_ID="XXXXXXXXXX"
   # Optional:
   # export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAMID)"
   ```

   Then:

   ```sh
   chmod 600 ~/.config/agency-agents-app/signing.env
   ```

### Build

```sh
source ~/.config/agency-agents-app/signing.env
./scripts/release.sh
```

If using the lower-level Tauri build directly:

```sh
npm run tauri build
```

Expected artifacts live under:

```text
src-tauri/target/release/bundle/
```

## Verify macOS Artifacts

```sh
DMG=src-tauri/target/release/bundle/dmg/Agency\ Agents_0.1.0_aarch64.dmg

codesign -dv --verbose=4 "$DMG"
spctl --assess --type install --verbose=4 "$DMG"
xcrun stapler validate "$DMG"
```

The exact filename may vary by version and architecture.

## Updater Manifest

Agency Agents uses `tauri-plugin-updater`. The configured endpoint is:

```text
https://agency-agents-app.zerologic.com/updater.json
```

The updater artifact is a gzipped `.app` tarball, not the `.dmg`.

Manifest generation is handled by:

```sh
tools/release/publish-manifest.sh <version>
```

The updater public key is embedded in the app config/source. The matching private key must live outside the repo, for example:

```text
~/.config/agency-agents-app/updater.key
```

## macOS Icon Notes

macOS 26 Tahoe uses the compiled `Assets.car` path for Liquid Glass icons. Do not blindly run `npm run tauri icon`; it can clobber the curated icon outputs.

See [docs/icon/README-liquid-glass.md](./icon/README-liquid-glass.md).

## Cross-Platform Notes

- macOS uses overlay titlebar, vibrancy, and the Tahoe icon setup.
- Windows and Linux use native decorated opaque windows.
- Windows Intel and ARM builds should be verified as separate artifacts.
- Linux packages should be smoke-tested in the Ubuntu VM before claiming support.

## Secrets

Never commit signing credentials, updater private keys, GitHub tokens, or notary credentials. Use local keychain items or files outside the repo with `0600` permissions.

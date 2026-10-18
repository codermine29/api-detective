# MindPilot

MindPilot is a mock-first BCI control center for macOS. It separates BCI input, command interpretation, safety checks, native actions, and future agent execution so an EMOTIV EPOC X can be added without rewriting the dashboard.

## Current milestone

The browser dashboard runs in Mock Mode by default. Its six simulated commands update agent focus and a bounded event feed. The local Swift helper accepts only `launch-mellow` and `spotlight-mellow`, after validating a loopback request token and browser origin. Live Cortex input is intentionally not implemented yet and is shown as unavailable rather than successful.

## Architecture

```text
MockBciAdapter (now) / CortexBciAdapter (pending)
             -> command mapping and safety boundary
             -> React dashboard and event feed
             -> localhost:4817 Swift helper
             -> NSWorkspace launch or explicit CGEvent Spotlight demo
```

The frontend contains no Cortex client secrets. Agent cards are a mock registry only; selecting an agent does not execute it.

## Prerequisites

- macOS 13 or newer for the helper
- Node.js and npm
- Swift 5.9+ / Xcode Command Line Tools
- Mellow installed locally for the launch demonstration
- Cortex access, EmotivID, registered app credentials, and the appropriate license only when live integration begins

## Run the dashboard

```sh
npm install
npm run dev
```

Open the printed local URL. Use the command buttons to generate simulated events. `Push` and `Right` advance focus, `Left` goes back, `Pull` is an overview action, and `Neutral`/`Unknown` are no-ops. The feed is newest-first and retains at most 50 events.

## Run the Swift helper

Choose a random local token and use the same value in the shell that starts the helper and the frontend's `VITE_HELPER_TOKEN` value. The helper is loopback-only and exits without a token.

```sh
export MINDPILOT_HELPER_TOKEN='use-a-long-random-local-value'
swift run --package-path macos-helper mindpilot-helper
```

Optional target configuration:

```sh
export MINDPILOT_MELLOW_PATH='/Applications/Mellow.app'
# Or use the actual value from Mellow's bundle metadata:
export MINDPILOT_MELLOW_BUNDLE_ID='your.actual.bundle.identifier'
```

The helper first honors `MINDPILOT_MELLOW_PATH`, then a configured bundle ID via `NSWorkspace`, then `/Applications/Mellow.app`. The checked-in machine had Mellow at `/Applications/Mellow.app`; this path is a discovery fallback, not a claim about the bundle identifier.

## Mellow tests

1. Start the helper and the Vite dashboard.
2. Click **Test: Launch Mellow**. This uses `NSWorkspace` and reports that macOS accepted the request; it does not claim visual verification of the app.
3. To demonstrate Spotlight, toggle **Keyboard automation** on, read the warning, then click **Test via Spotlight**. The helper posts Command-Space, types `mellow`, and presses Return. It reports that keystrokes were posted, not that the correct result opened.

Spotlight automation requires the helper process to be allowed under **System Settings > Privacy & Security > Accessibility**. The shortcut may be changed, Spotlight may be disabled, the focused app may differ, or another result may be selected. Do not enable this path unless you explicitly intend to automate the keyboard.

## Tests and build

```sh
npm run lint
npm test
npm run build
swift test --package-path macos-helper
swift build --package-path macos-helper
```

The Swift test suite validates the action allowlist, token/origin checks, and missing-target behavior. It never posts keyboard events. Manual testing is still required for the actual Mellow launch and Accessibility permission behavior.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys only the static frontend. Vite receives `VITE_BASE_PATH=/<repository-name>/` in Actions so repository subpaths work. In GitHub, set **Settings > Pages > Source** to **GitHub Actions**. Pages cannot run the Swift helper or store Cortex secrets. A hosted dashboard therefore needs the helper running locally and a browser policy/network setup that permits the local request; for the safest prototype, use the local Vite dashboard with the local helper.

For local repository-subpath testing, set `VITE_BASE_PATH` in `.env.local` (not committed) or pass it to `npm run build`.

## Cortex and EPOC X status

The official Cortex documentation lists EPOC X (all firmware, USB dongle/BLE) as supported and places Mental Commands in the Basic BCI API. Cortex is a local secure WebSocket JSON-RPC service at `wss://localhost:6868`. Live use still requires an EmotivID, a registered Cortex App ID/client credentials, authorization, a trained profile, the `com` stream, EMOTIV software, and entitlement/licensing confirmation. None of those credentials or a headset connection were available or tested here. The `CortexBciAdapter` is an explicit unavailable stub, not a fake integration.

When enabled later, keep Cortex credentials in a local native process or secure development configuration, never in the frontend bundle. Verify the current `com` subscription response and actual event fields against the account and API version before mapping confidence or command names.

## Apple BCI HID research

Apple's [BCI HID reference](https://developer.apple.com/documentation/accessibility/brain-computer-interface-hid-reference-for-connecting-to-apple-platforms) defines a device-side HID descriptor and reports for signal quality, 32 buttons, pointer axes, item selection, and scan feedback. It requires compatible hardware/firmware to expose those reports. The documentation does not establish that EPOC X implements this descriptor, and no evidence was found here that it does. Translating Cortex events would require a supported physical HID intermediary or a specialized virtual HID implementation, which is unnecessary and risky for this prototype. MindPilot therefore uses Cortex-to-helper as its primary future route and does not install a driver or custom HID device.

Apple API references consulted: [NSWorkspace](https://developer.apple.com/documentation/appkit/nsworkspace), [bundle lookup](https://developer.apple.com/documentation/appkit/nsworkspace/urlsforapplications(withbundleidentifier:)), [CGEvent](https://developer.apple.com/documentation/coregraphics/cgevent), and [AXUIElement](https://developer.apple.com/documentation/applicationservices/axuielement). EMOTIV sources consulted: [Cortex API](https://emotiv.gitbook.io/cortex-api), [connecting to Cortex](https://emotiv.gitbook.io/cortex-api/connecting-to-the-cortex-api.md), and the [official examples](https://github.com/Emotiv/cortex-example). The [Vite Pages guide](https://vite.dev/guide/static-deploy.html#github-pages) informed the workflow and base path.

## Security limitations

The helper binds to `127.0.0.1:4817`, requires a shared token, checks an allowlisted origin, decodes a strict request shape, and rejects shell commands, paths, scripts, and unknown actions. The token is a local prototype secret exposed to the browser process, HTTP is not TLS, and a malicious local page or browser extension remains part of the threat model. Keep the helper stopped when not in use and do not expose its port beyond loopback.

## Roadmap

1. Verify Cortex access, entitlements, app authorization, and EPOC X connectivity.
2. Implement and test the `com` WebSocket adapter against a trained Mental Commands profile.
3. Add an explicit confirmation/cooldown policy before any mental command can launch a native app.
4. Replace mock agent cards with a separately authenticated agent adapter.

## Publishing

No remote, commit, push, or GitHub setting was changed by this implementation. When ready:

```sh
git add .
git commit -m "Build MindPilot BCI control center prototype"
git push -u origin main
```

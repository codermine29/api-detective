# MindPilot Implementation Notes

## Summary

Implemented a React/Vite/TypeScript mock BCI dashboard and a macOS Swift Package helper. Mock commands flow through an adapter and deterministic mapping layer into agent focus state and a 50-event feed. Native actions are a strict two-action allowlist: direct Mellow launch via `NSWorkspace`, and an explicitly enabled Spotlight keystroke demonstration via `CGEvent`.

## Files

- `src/app/App.tsx`, `src/styles.css`: responsive dark control dashboard.
- `src/bci/*`: adapter interface, mock adapter, explicit Cortex stub, mappings, event types.
- `src/native/helperClient.ts`: browser-side allowlist and loopback client.
- `src/agents/*`: placeholder agent registry and types.
- `tests/*`: mapping, adapter, and native allowlist tests.
- `macos-helper/`: Swift Package, request validator, AppKit/CoreGraphics helper, and safe unit tests.
- `.github/workflows/deploy.yml`: GitHub Pages deployment.
- `README.md`, `.env.example`, `.gitignore`: setup, security, research, and publishing documentation.

## Research findings

EPOC X is listed as Cortex-supported and Mental Commands are part of EMOTIV's Basic BCI API, but credentials, authorization, training profile, licensing, and a physical connection remain unverified. Cortex uses secure WebSocket JSON-RPC at `wss://localhost:6868`. Apple's BCI HID reference describes firmware/device reports; it is not evidence that EPOC X supports the protocol. Cortex-to-Swift is the practical route for this prototype.

Mellow was discovered during implementation at `/Applications/Mellow.app`. No bundle identifier was guessed. The helper supports an explicit path, bundle-ID lookup, and that discovered fallback.

## Commands run

- `git status --short && git branch --show-current && git log --oneline -5`: clean initial worktree on `main`; initial commit `d172210`.
- `node --version && npm --version && swift --version && xcode-select --print-path`: Node `v26.11.1`, npm `11.20.0`, Swift `5.10`, Command Line Tools path available.
- `mdfind "kMDItemFSName == 'Mellow.app'"`: `/Applications/Mellow.app`.
- `npm install`: passed; 80 packages installed, 0 vulnerabilities.
- `npm run lint`: passed.
- `npm test`: passed, 3 files and 9 tests.
- `npm run build`: passed; Vite produced `dist`.
- `swift build --package-path macos-helper`: passed.
- `swift test --package-path macos-helper`: blocked by the installed Command Line Tools: `xcrun` could not locate the macOS platform path and XCTest was unavailable.

## Known limitations and unverified assumptions

- The hosted GitHub Pages frontend cannot execute the native helper; local helper/browser deployment and origin settings remain the safest configuration.
- Direct launch reports an `NSWorkspace` acceptance/error callback, not a visual proof that Mellow is frontmost.
- Spotlight reports posted keystrokes only. It cannot verify the selected result.
- Accessibility permission is not requested or bypassed automatically.
- Cortex live integration is an unavailable stub and must not be represented as connected.
- The helper uses a simple HTTP parser suitable for this local prototype, not an internet-facing service.

## Manual tests still required

1. Start the helper with a random `MINDPILOT_HELPER_TOKEN`, set the matching frontend token, and click direct launch.
2. Grant Accessibility permission to the helper executable only if testing Spotlight, then verify the explicit sequence while observing focus.
3. Test missing Mellow path and invalid token/origin responses.
4. Verify EPOC X firmware, EMOTIV Launcher/Cortex installation, app authorization, trained profile, `com` payload, and entitlements with the actual account.

## Next steps

Implement Cortex authorization/session lifecycle and subscription only after the current account and API version are verified. Keep the native launch mapping deliberate, add cooldown/confirmation controls, then connect independently authenticated custom-agent adapters.

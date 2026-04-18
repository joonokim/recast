# build/

Files in this directory are consumed by `electron-builder` at package time.

## Required

- `entitlements.mac.plist` — macOS Hardened Runtime entitlements (already here).

## Icons (add your own)

Drop these files in as needed:

- `icon.icns` — macOS app icon. 1024×1024 source recommended.
- `icon.ico` — Windows.
- `icon.png` — Linux (and cross-platform fallback, ≥512×512).
- `background.png` / `background@2x.png` — DMG installer background (540×380).

If the icons are missing, electron-builder falls back to Electron's default —
fine for early testing but replace before shipping.

Tip: you can generate all three from one 1024×1024 PNG with
[`@electron/icon-maker`](https://github.com/electron/icon-maker) or
`iconutil` on macOS.

# Viewmodel Lab

A polished, interactive Counter-Strike 2 viewmodel generator. Compare knife,
rifle, and pistol previews, tune every supported viewmodel axis, save a local
preset, and copy one console-ready command string.

## Commands covered

- `viewmodel_presetpos`
- `viewmodel_fov` (54–68)
- `viewmodel_offset_x` (-2.5–2.5)
- `viewmodel_offset_y` (-2–2)
- `viewmodel_offset_z` (-2–2)

The one-line output uses semicolons because the CS2 console does not execute a
comma-separated list of commands. Legacy CS:GO bob and recoil commands are
intentionally excluded because current CS2 builds no longer support them.

## Development

```bash
npm install
npm run dev
```

Run `npm run build` to type-check and create a production build.

The browser's positional response is an approximation. Always verify the final
position in-game before saving it to an autoexec.

## Preview imagery

The preview gallery uses real Counter-Strike 2 captures sourced from Valve's
official Steam store media and CS2 screenshots published through Steam
Community. They are not AI-generated stand-ins. Counter-Strike and all related
game assets are trademarks or copyrighted works of Valve Corporation.
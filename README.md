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

Preview images are visual approximations. Always verify the final position
in-game before saving it to an autoexec.
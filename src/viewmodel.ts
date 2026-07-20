export type Hand = 'right' | 'left'
export type AspectRatio = '16:9' | '16:10' | '4:3'

export interface ViewmodelSettings {
  fov: number
  x: number
  y: number
  z: number
}

export interface ViewmodelPreset extends ViewmodelSettings {
  id: string
  name: string
  description: string
  tag?: string
}

export const DEFAULT_SETTINGS: ViewmodelSettings = {
  fov: 68,
  x: 2.5,
  y: 0,
  z: -1.5,
}

export const PREVIEW = {
  background: '/assets/game-bg.jpg',
  viewmodel: '/assets/rifle-viewmodel.png',
  weapon: 'AK-47',
}

export const PRESETS: ViewmodelPreset[] = [
  {
    id: 'max-visibility',
    name: 'Max visibility',
    description: 'Wide and low for clean sightlines',
    tag: 'POPULAR',
    fov: 68,
    x: 2.5,
    y: 0,
    z: -1.5,
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'A neutral all-purpose position',
    fov: 64,
    x: 1.5,
    y: 0.5,
    z: -1,
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Closer framing with less reach',
    fov: 58,
    x: 1.8,
    y: -1,
    z: -1.3,
  },
  {
    id: 'centered',
    name: 'Centered',
    description: 'Brings the model toward the middle',
    fov: 62,
    x: 0,
    y: 0,
    z: -1,
  },
  {
    id: 'low-profile',
    name: 'Low profile',
    description: 'Drops the weapon out of the action',
    fov: 68,
    x: 2,
    y: 1,
    z: -2,
  },
  {
    id: 'close-focus',
    name: 'Close focus',
    description: 'Large model and detailed skins',
    fov: 54,
    x: 1,
    y: -1.5,
    z: 0,
  },
]

export interface PreviewOptions {
  hand: Hand
  exposure: number
}

export const formatValue = (value: number) => {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1).replace(/\.0$/, '')
}

export const getCanvasStyle = (exposure: number) => ({
  '--preview-exposure': exposure / 100,
})

export const getViewmodelTransform = (
  settings: ViewmodelSettings,
  hand: Hand,
) => {
  const fovDelta = settings.fov - DEFAULT_SETTINGS.fov
  const xDelta = settings.x - DEFAULT_SETTINGS.x
  const yDelta = settings.y - DEFAULT_SETTINGS.y
  const zDelta = settings.z - DEFAULT_SETTINGS.z

  const scale = 1 - fovDelta * 0.032 + yDelta * -0.04
  const x = xDelta * 30 + yDelta * 8
  const y = zDelta * -32 + yDelta * 16

  return {
    '--vm-scale': Math.max(0.55, Math.min(1.32, scale)),
    '--vm-x': `${x}px`,
    '--vm-y': `${y}px`,
    '--vm-mirror': hand === 'left' ? '-1' : '1',
  }
}

export const getCommands = (
  settings: ViewmodelSettings,
  options?: Pick<PreviewOptions, 'hand'>,
) => [
  {
    name: 'Custom position',
    command: 'viewmodel_presetpos',
    value: '0',
  },
  {
    name: 'Field of view',
    command: 'viewmodel_fov',
    value: formatValue(settings.fov),
  },
  {
    name: 'Horizontal offset',
    command: 'viewmodel_offset_x',
    value: formatValue(settings.x),
  },
  {
    name: 'Depth offset',
    command: 'viewmodel_offset_y',
    value: formatValue(settings.y),
  },
  {
    name: 'Vertical offset',
    command: 'viewmodel_offset_z',
    value: formatValue(settings.z),
  },
  {
    name: options?.hand === 'left' ? 'Left hand' : 'Right hand',
    command: 'cl_righthand',
    value: options?.hand === 'left' ? '0' : '1',
  },
]

export const getConsoleLine = (
  settings: ViewmodelSettings,
  writeConfig = false,
  options?: Pick<PreviewOptions, 'hand'>,
) => {
  const commands = getCommands(settings, options).map(
    ({ command, value }) => `${command} ${value}`,
  )

  if (writeConfig) commands.push('host_writeconfig')
  return commands.join('; ')
}

export const getConfigBlock = (
  settings: ViewmodelSettings,
  writeConfig = false,
  options?: Pick<PreviewOptions, 'hand'>,
) => {
  const lines = [
    '// Viewmodel Lab — CS2 viewmodel',
    ...getCommands(settings, options).map(
      ({ name, command, value }) => `${command} ${value} // ${name}`,
    ),
  ]

  if (writeConfig) lines.push('host_writeconfig')
  return lines.join('\n')
}

export const getActivePreset = (settings: ViewmodelSettings) =>
  PRESETS.find(
    (preset) =>
      preset.fov === settings.fov &&
      preset.x === settings.x &&
      preset.y === settings.y &&
      preset.z === settings.z,
  )

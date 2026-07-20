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

export interface ViewmodelCommand {
  name: string
  command: string
  value?: string
}

export const formatValue = (value: number) => {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1).replace(/\.0$/, '')
}

export const getCanvasStyle = (exposure: number) => ({
  '--preview-exposure': exposure / 100,
})

export const getViewmodelTransform = (settings: ViewmodelSettings) => {
  const xDelta = settings.x - DEFAULT_SETTINGS.x
  const yDelta = settings.y - DEFAULT_SETTINGS.y
  const zDelta = settings.z - DEFAULT_SETTINGS.z

  // Perspective scaling follows the same tangent relationship used by a
  // viewmodel camera. Offset Y changes depth, while X and Z move the model
  // across the screen. Percentage translations keep this consistent at every
  // preview size instead of making mobile movement disproportionately large.
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const fovScale =
    Math.tan(toRadians(DEFAULT_SETTINGS.fov) / 2) /
    Math.tan(toRadians(settings.fov) / 2)
  const depthScale = 1 - yDelta * 0.04
  // Preserve a normal in-game rifle footprint while still allowing the
  // supported FOV and depth range to visibly resize the model.
  const scale = fovScale * depthScale * 0.78
  const x = xDelta * 2.8
  const y = zDelta * -3.2

  return {
    '--vm-scale': Math.max(0.64, Math.min(1.12, scale)),
    '--vm-x': `${x}%`,
    '--vm-y': `${y}%`,
  }
}

export const getCommands = (
  settings: ViewmodelSettings,
  options?: Pick<PreviewOptions, 'hand'>,
): ViewmodelCommand[] => [
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
    command: options?.hand === 'left' ? 'switchhandsleft' : 'switchhandsright',
  },
]

const formatCommand = ({ command, value }: ViewmodelCommand) =>
  value === undefined ? command : `${command} ${value}`

export const getConsoleLine = (
  settings: ViewmodelSettings,
  writeConfig = false,
  options?: Pick<PreviewOptions, 'hand'>,
) => {
  const commands = getCommands(settings, options).map(formatCommand)

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
      (entry) => `${formatCommand(entry)} // ${entry.name}`,
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

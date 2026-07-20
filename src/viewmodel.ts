export type Weapon = 'knife' | 'rifle' | 'pistol'
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

export const WEAPONS: Record<
  Weapon,
  { label: string; detail: string; image: string; scene: string }
> = {
  knife: {
    label: 'Knife',
    detail: 'Melee',
    image: '/assets/knife-preview.png',
    scene: 'Mediterranean alley',
  },
  rifle: {
    label: 'Rifle',
    detail: 'AK platform',
    image: '/assets/rifle-preview.png',
    scene: 'Industrial range',
  },
  pistol: {
    label: 'Pistol',
    detail: 'Sidearm',
    image: '/assets/pistol-preview.png',
    scene: 'Stone courtyard',
  },
}

export const formatValue = (value: number) => {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1).replace(/\.0$/, '')
}

export const getCommands = (settings: ViewmodelSettings) => [
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
]

export const getConsoleLine = (
  settings: ViewmodelSettings,
  writeConfig = false,
) => {
  const commands = getCommands(settings).map(
    ({ command, value }) => `${command} ${value}`,
  )

  if (writeConfig) commands.push('host_writeconfig')
  return commands.join('; ')
}

export const getConfigBlock = (
  settings: ViewmodelSettings,
  writeConfig = false,
) => {
  const lines = [
    '// Viewmodel Lab — CS2 viewmodel',
    ...getCommands(settings).map(
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

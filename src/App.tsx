import {
  Check,
  ChevronRight,
  CircleDot,
  Copy,
  Crosshair,
  Download,
  Eye,
  Info,
  Keyboard,
  Maximize2,
  Monitor,
  Move3D,
  RefreshCcw,
  RotateCcw,
  Save,
  SlidersHorizontal,
  SquareTerminal,
  Trash2,
} from 'lucide-react'
import {
  type CSSProperties,
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  DEFAULT_SETTINGS,
  PRESETS,
  WEAPONS,
  formatValue,
  getActivePreset,
  getCommands,
  getConfigBlock,
  getConsoleLine,
  type AspectRatio,
  type Hand,
  type ViewmodelSettings,
  type Weapon,
} from './viewmodel'

type CopyTarget = 'all' | string | null
type OutputMode = 'console' | 'cfg'

const STORAGE_KEY = 'viewmodel-lab-saved-preset'

interface RangeControlProps {
  label: string
  axis?: string
  value: number
  min: number
  max: number
  step: number
  hint: string
  onChange: (value: number) => void
}

function RangeControl({
  label,
  axis,
  value,
  min,
  max,
  step,
  hint,
  onChange,
}: RangeControlProps) {
  const progress = ((value - min) / (max - min)) * 100
  const clamp = (next: number) => Math.min(max, Math.max(min, next))
  const handleNumber = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === '') return
    onChange(clamp(Number(event.target.value)))
  }

  return (
    <div className="range-control">
      <div className="control-heading">
        <div>
          <span className="control-label">
            {axis && <b className="axis-chip">{axis}</b>}
            {label}
          </span>
          <span className="control-hint">{hint}</span>
        </div>
        <div className="number-stepper">
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            onClick={() => onChange(clamp(Number((value - step).toFixed(2))))}
          >
            −
          </button>
          <input
            aria-label={`${label} value`}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleNumber}
          />
          <button
            type="button"
            aria-label={`Increase ${label}`}
            onClick={() => onChange(clamp(Number((value + step).toFixed(2))))}
          >
            +
          </button>
        </div>
      </div>
      <div className="slider-row">
        <span>{formatValue(min)}</span>
        <input
          className="range-input"
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          style={{ '--progress': `${progress}%` } as CSSProperties}
        />
        <span>{formatValue(max)}</span>
      </div>
    </div>
  )
}

interface SectionHeadingProps {
  index: string
  title: string
  icon: ReactNode
  action?: ReactNode
}

function SectionHeading({
  index,
  title,
  icon,
  action,
}: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div className="section-title">
        <span>{index}</span>
        {icon}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span>V</span>
      <i />
    </div>
  )
}

function App() {
  const [settings, setSettings] =
    useState<ViewmodelSettings>(DEFAULT_SETTINGS)
  const [weapon, setWeapon] = useState<Weapon>('knife')
  const [hand, setHand] = useState<Hand>('right')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9')
  const [exposure, setExposure] = useState(100)
  const [showReticle, setShowReticle] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [writeConfig, setWriteConfig] = useState(false)
  const [outputMode, setOutputMode] = useState<OutputMode>('console')
  const [copied, setCopied] = useState<CopyTarget>(null)
  const [savedPreset, setSavedPreset] = useState<ViewmodelSettings | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as ViewmodelSettings) : null
    } catch {
      return null
    }
  })

  const commands = useMemo(() => getCommands(settings), [settings])
  const consoleLine = useMemo(
    () => getConsoleLine(settings, writeConfig),
    [settings, writeConfig],
  )
  const configBlock = useMemo(
    () => getConfigBlock(settings, writeConfig),
    [settings, writeConfig],
  )
  const activePreset = getActivePreset(settings)
  const output = outputMode === 'console' ? consoleLine : configBlock

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(null), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  const updateSetting = (key: keyof ViewmodelSettings, value: number) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  const applyPreset = (preset: ViewmodelSettings) => {
    setSettings({
      fov: preset.fov,
      x: preset.x,
      y: preset.y,
      z: preset.z,
    })
  }

  const copyText = async (text: string, target: CopyTarget) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setCopied(target)
  }

  const saveCurrentPreset = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    setSavedPreset({ ...settings })
  }

  const deleteSavedPreset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setSavedPreset(null)
  }

  const downloadConfig = () => {
    const blob = new Blob([`${configBlock}\n`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'viewmodel.cfg'
    link.click()
    URL.revokeObjectURL(url)
  }

  const resetAll = () => {
    setSettings(DEFAULT_SETTINGS)
    setWeapon('knife')
    setHand('right')
    setAspectRatio('16:9')
    setExposure(100)
    setShowReticle(true)
    setShowGrid(false)
  }

  const scrollToPositionControls = () => {
    document
      .getElementById('position-controls')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cycleWeapon = () => {
    const weapons = Object.keys(WEAPONS) as Weapon[]
    const currentIndex = weapons.indexOf(weapon)
    setWeapon(weapons[(currentIndex + 1) % weapons.length])
  }

  const fovScale = 1 + ((68 - settings.fov) / 14) * 0.04
  const previewStyle = {
    '--preview-scale': fovScale,
    '--preview-x': `${(settings.x - 2.5) * 1.3}px`,
    '--preview-y': `${(settings.z + 1.5) * -1.1}px`,
    '--preview-exposure': exposure / 100,
  } as CSSProperties

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Viewmodel Lab home">
          <BrandMark />
          <span>
            <b>VIEWMODEL</b>
            <em>LAB</em>
          </span>
        </a>
        <div className="build-status">
          <i />
          CS2 · CURRENT COMMAND SET
        </div>
        <nav aria-label="Primary navigation">
          <a href="#generator">GENERATOR</a>
          <a href="#commands">COMMANDS</a>
          <a href="#axis-guide">AXIS GUIDE</a>
        </nav>
        <button className="reset-button" type="button" onClick={resetAll}>
          <RotateCcw size={14} />
          RESET
        </button>
      </header>

      <main className="workspace" id="generator">
        <aside className="settings-panel">
          <div className="panel-intro">
            <div className="eyebrow">
              <SlidersHorizontal size={13} />
              LIVE CONFIGURATOR
            </div>
            <h1>Build your view.</h1>
            <p>
              Tune the exact weapon position, compare loadouts, then paste one
              clean line into the CS2 console.
            </p>
          </div>

          <section className="settings-section preset-section">
            <SectionHeading
              index="01"
              title="Starting point"
              icon={<CircleDot size={15} />}
            />
            <div className="preset-grid">
              {PRESETS.map((preset) => {
                const isActive = activePreset?.id === preset.id
                return (
                  <button
                    className={`preset-card ${isActive ? 'is-active' : ''}`}
                    type="button"
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                  >
                    <span className="preset-topline">
                      <b>{preset.name}</b>
                      {preset.tag && <small>{preset.tag}</small>}
                    </span>
                    <span>{preset.description}</span>
                    <code>
                      {preset.fov} / {formatValue(preset.x)} /{' '}
                      {formatValue(preset.y)} / {formatValue(preset.z)}
                    </code>
                  </button>
                )
              })}
              {savedPreset && (
                <div
                  className={`preset-card saved-card ${
                    !activePreset &&
                    JSON.stringify(savedPreset) === JSON.stringify(settings)
                      ? 'is-active'
                      : ''
                  }`}
                >
                  <button
                    type="button"
                    className="saved-main"
                    onClick={() => applyPreset(savedPreset)}
                  >
                    <span className="preset-topline">
                      <b>My saved view</b>
                      <small>LOCAL</small>
                    </span>
                    <span>Your stored custom position</span>
                    <code>
                      {savedPreset.fov} / {formatValue(savedPreset.x)} /{' '}
                      {formatValue(savedPreset.y)} /{' '}
                      {formatValue(savedPreset.z)}
                    </code>
                  </button>
                  <button
                    type="button"
                    className="delete-preset"
                    aria-label="Delete saved preset"
                    onClick={deleteSavedPreset}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="settings-section" id="position-controls">
            <SectionHeading
              index="02"
              title="Viewmodel position"
              icon={<Move3D size={15} />}
              action={
                <button
                  className="text-action"
                  type="button"
                  onClick={saveCurrentPreset}
                >
                  <Save size={13} />
                  SAVE
                </button>
              }
            />
            <RangeControl
              label="Field of view"
              value={settings.fov}
              min={54}
              max={68}
              step={1}
              hint="Weapon model scale"
              onChange={(value) => updateSetting('fov', value)}
            />
            <RangeControl
              axis="X"
              label="Horizontal"
              value={settings.x}
              min={-2.5}
              max={2.5}
              step={0.1}
              hint="Left ↔ right"
              onChange={(value) => updateSetting('x', value)}
            />
            <RangeControl
              axis="Y"
              label="Depth"
              value={settings.y}
              min={-2}
              max={2}
              step={0.1}
              hint="Near ↔ far"
              onChange={(value) => updateSetting('y', value)}
            />
            <RangeControl
              axis="Z"
              label="Vertical"
              value={settings.z}
              min={-2}
              max={2}
              step={0.1}
              hint="Down ↕ up"
              onChange={(value) => updateSetting('z', value)}
            />
          </section>

          <section className="settings-section preview-settings">
            <SectionHeading
              index="03"
              title="Preview options"
              icon={<Eye size={15} />}
            />

            <div className="option-block">
              <span className="option-label">Active hand</span>
              <div className="segmented-control two-up">
                {(['right', 'left'] as Hand[]).map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={hand === value ? 'is-active' : ''}
                    onClick={() => setHand(value)}
                  >
                    {value.toUpperCase()}
                  </button>
                ))}
              </div>
              <small className="option-note">
                Preview only · use <code>switchhands</code> in-game
              </small>
            </div>

            <div className="option-block">
              <span className="option-label">Canvas ratio</span>
              <div className="segmented-control three-up">
                {(['16:9', '16:10', '4:3'] as AspectRatio[]).map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={aspectRatio === value ? 'is-active' : ''}
                    onClick={() => setAspectRatio(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <RangeControl
              label="Scene exposure"
              value={exposure}
              min={80}
              max={120}
              step={1}
              hint="Preview only"
              onChange={setExposure}
            />

            <div className="switch-list">
              <label>
                <span>
                  <Crosshair size={14} />
                  Center reticle
                </span>
                <input
                  type="checkbox"
                  checked={showReticle}
                  onChange={(event) => setShowReticle(event.target.checked)}
                />
                <i />
              </label>
              <label>
                <span>
                  <Maximize2 size={14} />
                  Composition grid
                </span>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(event) => setShowGrid(event.target.checked)}
                />
                <i />
              </label>
            </div>
          </section>

          <section className="axis-guide" id="axis-guide">
            <div className="axis-diagram" aria-hidden="true">
              <span className="axis-x">X</span>
              <span className="axis-y">Y</span>
              <span className="axis-z">Z</span>
              <i className="line-x" />
              <i className="line-y" />
              <i className="line-z" />
              <b />
            </div>
            <div>
              <span className="option-label">How the axes work</span>
              <p>
                X shifts side-to-side, Y changes camera depth, and Z raises or
                lowers the model. All values use CS2&apos;s accepted limits.
              </p>
            </div>
          </section>
        </aside>

        <div className="main-stage">
          <section className="preview-area" aria-label="Live viewmodel preview">
            <div className="preview-toolbar">
              <div className="weapon-tabs" role="tablist" aria-label="Weapon">
                {(Object.keys(WEAPONS) as Weapon[]).map((value, index) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={weapon === value}
                    className={weapon === value ? 'is-active' : ''}
                    key={value}
                    onClick={() => setWeapon(value)}
                  >
                    <span>0{index + 1}</span>
                    <b>{WEAPONS[value].label}</b>
                    <small>{WEAPONS[value].detail}</small>
                  </button>
                ))}
              </div>
              <div className="preview-meta">
                <span>
                  <Monitor size={13} />
                  {aspectRatio}
                </span>
                <span>
                  <i />
                  LIVE PREVIEW
                </span>
              </div>
            </div>

            <div className={`canvas-wrap ratio-${aspectRatio.replace(':', '-')}`}>
              <div
                className={`preview-canvas hand-${hand}`}
                style={previewStyle}
              >
                <img
                  key={weapon}
                  src={WEAPONS[weapon].image}
                  alt={`${WEAPONS[weapon].label} and tactical gloves in a first-person game view`}
                />
                <div className="canvas-shade" />
                {showGrid && <div className="composition-grid" />}
                {showReticle && (
                  <div className="reticle" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                )}
                <div className="corner corner-tl" />
                <div className="corner corner-tr" />
                <div className="corner corner-bl" />
                <div className="corner corner-br" />

                <div className="scene-label">
                  <span>SCENE</span>
                  <b>{WEAPONS[weapon].scene}</b>
                  <small>{WEAPONS[weapon].source}</small>
                </div>
                <div className="scene-switcher">
                  <span className="scene-switcher-label">
                    LOADOUT PREVIEWS
                    <b>03 SHOTS</b>
                  </span>
                  {(Object.keys(WEAPONS) as Weapon[]).map((value, index) => (
                    <button
                      type="button"
                      key={value}
                      className={weapon === value ? 'is-active' : ''}
                      onClick={() => setWeapon(value)}
                      aria-label={`Preview ${WEAPONS[value].label}`}
                    >
                      <img src={WEAPONS[value].image} alt="" />
                      <span>
                        <small>0{index + 1}</small>
                        {WEAPONS[value].label}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="preview-readout">
                  <span>
                    FOV <b>{settings.fov}</b>
                  </span>
                  <span>
                    X <b>{formatValue(settings.x)}</b>
                  </span>
                  <span>
                    Y <b>{formatValue(settings.y)}</b>
                  </span>
                  <span>
                    Z <b>{formatValue(settings.z)}</b>
                  </span>
                </div>
                <div className="preview-disclaimer">
                  <Info size={12} />
                  VISUAL APPROXIMATION · VERIFY IN-GAME
                </div>
              </div>
            </div>

            <div className="preview-footer">
              <div>
                <span>ACTIVE PROFILE</span>
                <b>{activePreset?.name ?? 'Custom position'}</b>
              </div>
              <div className="value-strip">
                <span>
                  <small>VM FOV</small>
                  {settings.fov}
                </span>
                <i />
                <span>
                  <small>OFFSET</small>
                  {formatValue(settings.x)} / {formatValue(settings.y)} /{' '}
                  {formatValue(settings.z)}
                </span>
                <i />
                <span>
                  <small>HAND</small>
                  {hand}
                </span>
              </div>
            </div>

            <div className="mobile-control-deck">
              <div className="mobile-mode-tabs">
                <button className="is-active" type="button" aria-label="Preview">
                  <Eye size={22} />
                  <span>PREVIEW</span>
                </button>
                <button
                  type="button"
                  aria-label="Jump to viewmodel settings"
                  onClick={scrollToPositionControls}
                >
                  <SlidersHorizontal size={22} />
                  <span>TUNE</span>
                </button>
              </div>

              <button
                className="mobile-loadout-card"
                type="button"
                onClick={cycleWeapon}
              >
                <span className="mobile-card-kicker">
                  REAL CS2 CAPTURE <b>0{(Object.keys(WEAPONS) as Weapon[]).indexOf(weapon) + 1}</b>
                </span>
                <span className="mobile-card-image">
                  <img src={WEAPONS[weapon].image} alt="" />
                </span>
                <span className="mobile-card-copy">
                  <small>{WEAPONS[weapon].detail}</small>
                  <strong>{WEAPONS[weapon].label}</strong>
                  <em>{WEAPONS[weapon].source}</em>
                </span>
                <ChevronRight size={20} />
              </button>

              <div className="mobile-safe-row">
                <span>
                  <i />
                  COMPETITIVE SAFE
                </span>
                <small>NO SV_CHEATS</small>
              </div>

              <div className="mobile-stat-cards">
                <button type="button" onClick={scrollToPositionControls}>
                  <small>VIEWMODEL FOV</small>
                  <strong>{settings.fov}</strong>
                  <span>54—68</span>
                </button>
                <button type="button" onClick={scrollToPositionControls}>
                  <small>OFFSET X / Y / Z</small>
                  <strong>
                    {formatValue(settings.x)} / {formatValue(settings.y)} /{' '}
                    {formatValue(settings.z)}
                  </strong>
                  <span>{activePreset?.name ?? 'CUSTOM'}</span>
                </button>
              </div>
            </div>
          </section>

          <section className="command-panel" id="commands">
            <div className="command-header">
              <div>
                <span className="eyebrow">
                  <SquareTerminal size={13} />
                  GENERATED OUTPUT
                </span>
                <h2>Ready for the console.</h2>
                <p>
                  CS2 uses semicolons—not commas—to run multiple commands from
                  one pasted line.
                </p>
              </div>
              <div className="output-actions">
                <button type="button" onClick={downloadConfig}>
                  <Download size={14} />
                  DOWNLOAD .CFG
                </button>
                <label className="write-toggle">
                  <input
                    type="checkbox"
                    checked={writeConfig}
                    onChange={(event) => setWriteConfig(event.target.checked)}
                  />
                  <i />
                  SAVE WITH HOST_WRITE
                </label>
              </div>
            </div>

            <div className="output-grid">
              <div className="console-output">
                <div className="output-tabs">
                  <button
                    className={outputMode === 'console' ? 'is-active' : ''}
                    type="button"
                    onClick={() => setOutputMode('console')}
                  >
                    ONE-LINE CONSOLE STRING
                  </button>
                  <button
                    className={outputMode === 'cfg' ? 'is-active' : ''}
                    type="button"
                    onClick={() => setOutputMode('cfg')}
                  >
                    CFG BLOCK
                  </button>
                </div>
                <div className="code-window">
                  <div className="code-gutter">
                    {output.split('\n').map((_, index) => (
                      <span key={index}>{String(index + 1).padStart(2, '0')}</span>
                    ))}
                  </div>
                  <pre>{output}</pre>
                  <button
                    className={`primary-copy ${
                      copied === 'all' ? 'is-copied' : ''
                    }`}
                    type="button"
                    onClick={() => copyText(output, 'all')}
                  >
                    {copied === 'all' ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                    {copied === 'all' ? 'COPIED' : 'COPY ALL'}
                  </button>
                </div>
                <div className="paste-guide">
                  <span>
                    <b>01</b>
                    <Keyboard size={15} />
                    Enable Developer Console in CS2 settings
                  </span>
                  <ChevronRight size={14} />
                  <span>
                    <b>02</b>
                    <SquareTerminal size={15} />
                    Press ~, paste, and hit Enter
                  </span>
                </div>
              </div>

              <div className="command-list">
                <div className="list-heading">
                  <span>COMMAND BREAKDOWN</span>
                  <small>{commands.length} ACTIVE</small>
                </div>
                {commands.map(({ name, command, value }) => {
                  const target = `${command}-${value}`
                  return (
                    <button
                      type="button"
                      key={command}
                      onClick={() =>
                        copyText(`${command} ${value}`, target)
                      }
                    >
                      <span>
                        <small>{name}</small>
                        <code>{command}</code>
                      </span>
                      <b>{value}</b>
                      {copied === target ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <span>VIEWMODEL LAB / CS2</span>
        <span>COMPETITIVE-SAFE COMMANDS · NO SV_CHEATS</span>
        <a href="#generator">
          BACK TO TOP <RefreshCcw size={11} />
        </a>
      </footer>
    </div>
  )
}

export default App

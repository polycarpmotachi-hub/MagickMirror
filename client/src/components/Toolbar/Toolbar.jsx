import styles from './Toolbar.module.css';

export const DEFAULT_TRANSFORMS = {
  brightness: 100,
  contrast: 0,
  resize: { width: '', height: '', lockAspect: true },
  rotate: 0,
  flip: null,
  grayscale: false,
  blur: 0,
  sharpen: 0,
};

function SliderRow({ label, name, min, max, step = 1, value, onChange, unit = '' }) {
  return (
    <div className={styles.row}>
      <label className={styles.label}>
        {label}
        <span className={styles.value}>{value}{unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(name, Number(e.target.value))}
        className={styles.slider}
        data-testid={`slider-${name}`}
      />
    </div>
  );
}

export default function Toolbar({ transforms, onChange, disabled }) {
  function update(key, value) {
    onChange({ ...transforms, [key]: value });
  }

  function updateResize(key, value) {
    onChange({
      ...transforms,
      resize: { ...transforms.resize, [key]: value },
    });
  }

  function reset() {
    onChange({ ...DEFAULT_TRANSFORMS });
  }

  return (
    <div className={`${styles.toolbar} ${disabled ? styles.disabled : ''}`} data-testid="toolbar">
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Adjustments</h3>

        <SliderRow
          label="Brightness"
          name="brightness"
          min={0}
          max={200}
          value={transforms.brightness}
          onChange={update}
          unit="%"
        />

        <SliderRow
          label="Contrast"
          name="contrast"
          min={-10}
          max={10}
          value={transforms.contrast}
          onChange={update}
        />

        <SliderRow
          label="Blur"
          name="blur"
          min={0}
          max={20}
          step={0.5}
          value={transforms.blur}
          onChange={update}
          unit="px"
        />

        <SliderRow
          label="Sharpen"
          name="sharpen"
          min={0}
          max={10}
          step={0.5}
          value={transforms.sharpen}
          onChange={update}
        />
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Transform</h3>

        <div className={styles.row}>
          <label className={styles.label}>
            Rotate
            <span className={styles.value}>{transforms.rotate}°</span>
          </label>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={transforms.rotate}
            onChange={(e) => update('rotate', Number(e.target.value))}
            className={styles.slider}
            data-testid="slider-rotate"
          />
        </div>

        <div className={styles.row}>
          <label className={styles.label}>Flip</label>
          <div className={styles.btnGroup}>
            <button
              className={`${styles.toggleBtn} ${transforms.flip === 'horizontal' ? styles.active : ''}`}
              onClick={() => update('flip', transforms.flip === 'horizontal' ? null : 'horizontal')}
              data-testid="flip-horizontal"
            >
              ↔ H
            </button>
            <button
              className={`${styles.toggleBtn} ${transforms.flip === 'vertical' ? styles.active : ''}`}
              onClick={() => update('flip', transforms.flip === 'vertical' ? null : 'vertical')}
              data-testid="flip-vertical"
            >
              ↕ V
            </button>
          </div>
        </div>

        <div className={styles.row}>
          <label className={styles.label}>Grayscale</label>
          <button
            className={`${styles.toggleBtn} ${transforms.grayscale ? styles.active : ''}`}
            onClick={() => update('grayscale', !transforms.grayscale)}
            data-testid="toggle-grayscale"
          >
            {transforms.grayscale ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Resize</h3>

        <div className={styles.resizeRow}>
          <div className={styles.inputGroup}>
            <label className={styles.smallLabel}>Width</label>
            <input
              type="number"
              min={1}
              max={8000}
              value={transforms.resize.width}
              placeholder="px"
              onChange={(e) => updateResize('width', e.target.value ? Number(e.target.value) : '')}
              className={styles.numInput}
              data-testid="resize-width"
            />
          </div>
          <span className={styles.sep}>×</span>
          <div className={styles.inputGroup}>
            <label className={styles.smallLabel}>Height</label>
            <input
              type="number"
              min={1}
              max={8000}
              value={transforms.resize.height}
              placeholder="px"
              onChange={(e) => updateResize('height', e.target.value ? Number(e.target.value) : '')}
              className={styles.numInput}
              data-testid="resize-height"
            />
          </div>
          <button
            className={`${styles.lockBtn} ${transforms.resize.lockAspect ? styles.active : ''}`}
            onClick={() => updateResize('lockAspect', !transforms.resize.lockAspect)}
            title="Lock aspect ratio"
            data-testid="resize-lock"
          >
            {transforms.resize.lockAspect ? '🔒' : '🔓'}
          </button>
        </div>
      </div>

      <button className={styles.resetBtn} onClick={reset} data-testid="reset-btn">
        Reset All
      </button>
    </div>
  );
}

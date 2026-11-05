import { useState } from 'react'
import { applyTheme, loadTheme, saveTheme } from './theme'
import styles from './ThemeSwitch.module.css'

export function ThemeSwitch() {
  const [theme, setTheme] = useState(() => {
    const saved = loadTheme()
    applyTheme(saved)
    return saved
  })

  return (
    <button
      type="button"
      className={styles.control}
      aria-label={`Theme: ${theme === 'classic' ? 'Classic. Switch to Illuminated' : 'Illuminated. Switch to Classic'}`}
      onClick={() => {
        const next = theme === 'classic' ? 'illuminated' : 'classic'
        saveTheme(next)
        setTheme(next)
      }}
    >
      <span>Theme</span>
      <strong>{theme === 'classic' ? 'Classic' : 'Illuminated'}</strong>
    </button>
  )
}

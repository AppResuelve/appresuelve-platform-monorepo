import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

const THEMES = ['system', 'light', 'dark']
const LABELS = { system: 'Sistema', light: 'Claro', dark: 'Oscuro' }

export default function ThemeToggle({ mobile = false }) {
  const [theme, setTheme] = useState('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved && THEMES.includes(saved)) {
      setTheme(saved)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    applyTheme(theme)
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  useEffect(() => {
    if (!mounted || theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, mounted])

  function applyTheme(t) {
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    if (t === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(isDark ? 'dark' : 'light')
    } else {
      root.classList.add(t)
    }
  }

  function cycle() {
    setTheme(prev => {
      const idx = THEMES.indexOf(prev)
      return THEMES[(idx + 1) % THEMES.length]
    })
  }

  if (!mounted) return null

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <button
      onClick={cycle}
      title={LABELS[theme]}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors w-full"
    >
      <Icon className="w-4 h-4" />
      {mobile && <span>{LABELS[theme]}</span>}
    </button>
  )
}

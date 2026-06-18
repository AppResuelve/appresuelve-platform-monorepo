import { useEffect, useState, useRef } from 'react'

const THEME = {
  success: { border: 'border-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bgIcon: 'bg-emerald-100 dark:bg-emerald-950', icon: '✨' },
  warning: { border: 'border-amber-500', text: 'text-amber-600 dark:text-amber-400', bgIcon: 'bg-amber-100 dark:bg-amber-950', icon: '⚠️' },
  error:   { border: 'border-red-500',   text: 'text-red-600 dark:text-red-400',   bgIcon: 'bg-red-100 dark:bg-red-950',   icon: '🚫' },
  info:    { border: 'border-[var(--color-primary)]',  text: 'text-[var(--color-primary)]',  bgIcon: 'bg-indigo-50 dark:bg-indigo-950',  icon: 'ℹ️' },
}

export default function CustomAlert({
  type = 'info',
  variant = 'banner',
  title, message, duration = 0, onClose, onConfirm,
  showCancelButton = false,
  confirmButtonText = 'Aceptar', cancelButtonText = 'Cancelar',
  input = null, inputLabel = '', inputPlaceholder = '', inputValidator = null,
}) {
  const [isExiting, setIsExiting] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const timerRef = useRef(null)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => { if (onClose) onClose() }, 300)
  }

  const startTimer = () => { if (!duration || duration <= 0 || input) return; timerRef.current = setTimeout(handleClose, duration) }
  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current) }

  useEffect(() => { setIsExiting(false); startTimer(); return () => clearTimer() }, [])

  const handleConfirmAction = async () => {
    if (input) {
      if (inputValidator) { const ve = inputValidator(inputValue); if (ve) { setError(ve); return } }
      if (onConfirm) await onConfirm(inputValue)
    } else {
      if (onConfirm) await onConfirm()
    }
    handleClose()
  }

  const confirmRef = useRef(handleConfirmAction)
  confirmRef.current = handleConfirmAction

  useEffect(() => {
    if (variant === 'banner') return
    const handler = (e) => { if (e.key === 'Enter') { e.preventDefault(); confirmRef.current() } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [variant])

  const theme = THEME[type] || THEME.info

  if (variant === 'banner') {
    return (
      <div onMouseEnter={clearTimer} onMouseLeave={startTimer}
        className={`relative pointer-events-auto transition-all duration-300 ease-out w-full md:w-[400px] md:max-w-[400px]
                    ${isExiting ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className={`relative flex flex-col gap-2 p-4 bg-[var(--color-bg-card)] border-l-4 ${theme.border} rounded-xl shadow-lg border border-[var(--color-border)]`}>
          <div className="flex items-end gap-2">
            <span className="text-lg">{theme.icon}</span>
            <p className={`text-sm font-bold uppercase tracking-wide ${theme.text}`}>{title || type}</p>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] font-medium leading-tight">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`bg-[var(--color-bg-card)] w-full max-w-sm rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden transition-all duration-300 ${isExiting ? 'opacity-0 translate-y-10 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 ${theme.bgIcon} ${theme.text}`}>{theme.icon}</div>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">{title || (input ? inputLabel || 'Ingresá un valor' : 'Atención')}</h3>
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">{message}</p>

          {input && (
            <div className="mb-6 text-left">
              <input autoFocus type={input} value={inputValue} placeholder={inputPlaceholder}
                onChange={(e) => { setInputValue(e.target.value); setError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAction() }}
                className={`w-full border rounded-lg p-2.5 text-sm outline-none font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-card)] ${error ? 'border-red-500' : 'border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]/50'}`} />
              {error && <p className="text-red-500 text-xs mt-1 font-medium">🚫 {error}</p>}
            </div>
          )}

          <div className="flex flex-col gap-3 mt-2">
            {showCancelButton ? (
              <div className="flex gap-3 w-full">
                <button onClick={handleClose} className="flex-1 py-3 bg-[var(--color-bg-section)] border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl font-bold hover:bg-[var(--color-bg-elevated)] transition-colors">{cancelButtonText}</button>
                <button onClick={handleConfirmAction} className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-[var(--color-primary-hover)] transition-transform active:scale-95 shadow-lg shadow-[var(--color-primary)]/20">{confirmButtonText}</button>
              </div>
            ) : (
              <>
                <button onClick={handleConfirmAction} className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-[var(--color-primary-hover)] transition-transform active:scale-95 shadow-lg shadow-[var(--color-primary)]/20">{confirmButtonText}</button>
                <button onClick={handleClose} className="w-full py-1 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">Cerrar</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

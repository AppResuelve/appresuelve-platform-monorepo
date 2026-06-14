import { useEffect, useState, useRef } from 'react'

const THEME = {
  success: { border: 'border-emerald-500', text: 'text-emerald-600', bgIcon: 'bg-emerald-100', icon: '✨' },
  warning: { border: 'border-amber-500', text: 'text-amber-600', bgIcon: 'bg-amber-100', icon: '⚠️' },
  error:   { border: 'border-red-500',   text: 'text-red-600',   bgIcon: 'bg-red-100',   icon: '🚫' },
  info:    { border: 'border-indigo-500',  text: 'text-indigo-600',  bgIcon: 'bg-indigo-100',  icon: 'ℹ️' },
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
        <div className={`relative flex flex-col gap-2 p-4 bg-white border-l-4 ${theme.border} rounded-xl shadow-lg border border-slate-200`}>
          <div className="flex items-end gap-2">
            <span className="text-lg">{theme.icon}</span>
            <p className={`text-sm font-bold uppercase tracking-wide ${theme.text}`}>{title || type}</p>
          </div>
          <p className="text-sm text-slate-600 font-medium leading-tight">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${isExiting ? 'opacity-0 translate-y-10 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 ${theme.bgIcon} ${theme.text}`}>{theme.icon}</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{title || (input ? inputLabel || 'Ingresá un valor' : 'Atención')}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">{message}</p>

          {input && (
            <div className="mb-6 text-left">
              <input autoFocus type={input} value={inputValue} placeholder={inputPlaceholder}
                onChange={(e) => { setInputValue(e.target.value); setError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmAction() }}
                className={`w-full border rounded-lg p-2.5 text-sm outline-none font-medium text-slate-800 ${error ? 'border-red-500' : 'border-slate-300 focus:ring-2 focus:ring-indigo-500/50'}`} />
              {error && <p className="text-red-500 text-xs mt-1 font-medium">🚫 {error}</p>}
            </div>
          )}

          <div className="flex flex-col gap-3 mt-2">
            {showCancelButton ? (
              <div className="flex gap-3 w-full">
                <button onClick={handleClose} className="flex-1 py-3 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">{cancelButtonText}</button>
                <button onClick={handleConfirmAction} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-transform active:scale-95 shadow-lg shadow-indigo-200">{confirmButtonText}</button>
              </div>
            ) : (
              <>
                <button onClick={handleConfirmAction} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-transform active:scale-95 shadow-lg shadow-indigo-200">{confirmButtonText}</button>
                <button onClick={handleClose} className="w-full py-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Cerrar</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

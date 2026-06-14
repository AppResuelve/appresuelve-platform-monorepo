import { createContext, useContext, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import CustomAlert from './CustomAlert'

const AlertContext = createContext()

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([])
  const toastRoot = document.getElementById('toast-root') || document.body

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const fire = useCallback(
    (config) => {
      return new Promise((resolve) => {
        const id = Math.random().toString(36).substr(2, 9)
        const variant = config.variant || config.style || config.alertType || 'banner'

        const newAlert = {
          id,
          title: config.title || '',
          message: config.message || config.text || '',
          type: config.type || config.messageType || 'info',
          variant,
          duration: config.duration !== undefined
            ? config.duration
            : variant === 'banner' ? 3000 : null,
          showCancelButton: config.showCancelButton || false,
          confirmButtonText: config.confirmButtonText || 'Aceptar',
          cancelButtonText: config.cancelButtonText || 'Cancelar',

          onConfirm: (value) => {
            removeAlert(id)
            if (value !== undefined) resolve({ value, isConfirmed: true })
            else resolve({ isConfirmed: true })
          },
          onClose: () => {
            removeAlert(id)
            resolve({ isConfirmed: false })
          },
        }

        setAlerts((prev) => {
          if (newAlert.variant === 'banner') {
            const banners = prev.filter((a) => a.variant === 'banner')
            if (banners.length >= 3) {
              return [...prev.filter((a) => a.id !== banners[0].id), newAlert]
            }
          }
          return [...prev, newAlert]
        })
      })
    },
    [removeAlert]
  )

  return (
    <AlertContext.Provider value={{ fire }}>
      {children}
      {createPortal(
        <>
          <div className="fixed top-4 left-4 right-4 md:top-6 md:right-6 md:left-auto z-[9999]
                          flex flex-col items-center md:items-end pointer-events-none gap-2">
            {alerts
              .filter((a) => a.variant === 'banner')
              .map((alert, index, filteredArray) => {
                const total = filteredArray.length
                const position = total - 1 - index
                return (
                  <div
                    key={alert.id}
                    className="pointer-events-auto transition-all duration-500 ease-out w-full md:w-auto"
                    style={{
                      transform: `translateY(${position * 0}px) scale(${1 - position * 0.05})`,
                      opacity: 1 - position * 0.2,
                      zIndex: total - position,
                    }}
                  >
                    <CustomAlert {...alert} />
                  </div>
                )
              })}
          </div>

          {alerts
            .filter((a) => a.variant !== 'banner')
            .map((alert) => (
              <CustomAlert key={alert.id} {...alert} />
            ))}
        </>,
        toastRoot
      )}
    </AlertContext.Provider>
  )
}

export const useAlert = () => useContext(AlertContext)

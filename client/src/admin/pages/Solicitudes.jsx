import React from 'react'
import { Clock } from 'lucide-react'

export default function Solicitudes() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Solicitudes</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">Cambios solicitados por los clientes</p>

      <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-12 text-center">
        <Clock className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
        <p className="text-[var(--color-text-secondary)] font-medium">Próximamente</p>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Acá vas a poder ver y gestionar las solicitudes de cambio que envíen tus clientes.
        </p>
      </div>
    </div>
  )
}

import React from 'react'
import { Clock } from 'lucide-react'

export default function Solicitudes() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Solicitudes</h1>
      <p className="text-sm text-slate-500 mb-8">Cambios solicitados por los clientes</p>

      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Próximamente</p>
        <p className="text-sm text-slate-400 mt-1">
          Acá vas a poder ver y gestionar las solicitudes de cambio que envíen tus clientes.
        </p>
      </div>
    </div>
  )
}

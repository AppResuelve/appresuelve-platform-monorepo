import React, { useState } from 'react'
import { Plus, GripVertical, Trash2, MoveUp, MoveDown } from 'lucide-react'

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'textarea', label: 'Área de texto' },
  { value: 'number', label: 'Número' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'color', label: 'Color' },
  { value: 'date', label: 'Fecha' },
  { value: 'datetime', label: 'Fecha y hora' },
  { value: 'boolean', label: 'Switch (Sí/No)' },
  { value: 'select', label: 'Selector' },
  { value: 'image', label: 'Imagen (upload)' },
  { value: 'gallery', label: 'Galería' },
  { value: 'richtext', label: 'Texto enriquecido' },
  { value: 'icon', label: 'Ícono' },
  { value: 'link', label: 'Link' },
]

const EMPTY_FIELD = {
  key: '',
  label: '',
  type: 'text',
  required: false,
  placeholder: '',
  helpText: '',
  order: 0,
}

export default function DynamicFieldsEditor({ fields = [], onChange }) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [editField, setEditField] = useState(null)

  const handleAdd = () => {
    setEditField({ ...EMPTY_FIELD, order: fields.length })
    setEditingIndex(-1)
  }

  const handleEdit = (index) => {
    setEditField({ ...fields[index] })
    setEditingIndex(index)
  }

  const handleSave = () => {
    if (!editField.key.trim() || !editField.label.trim()) return

    const updated = [...fields]
    if (editingIndex === -1) {
      updated.push(editField)
    } else {
      updated[editingIndex] = editField
    }

    onChange(updated.map((f, i) => ({ ...f, order: i })))
    setEditingIndex(null)
    setEditField(null)
  }

  const handleDelete = (index) => {
    const updated = fields.filter((_, i) => i !== index)
    onChange(updated.map((f, i) => ({ ...f, order: i })))
  }

  const handleMove = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= fields.length) return
    const updated = [...fields]
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    onChange(updated.map((f, i) => ({ ...f, order: i })))
  }

  const handleFieldChange = (key, value) => {
    setEditField((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Campos del formulario</label>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar campo
        </button>
      </div>

      {fields.length === 0 && !editField && (
        <div className="text-center py-6 border-2 border-dashed border-[var(--color-border)] rounded-lg">
          <p className="text-sm text-[var(--color-text-muted)]">No hay campos definidos. Agregá el primero.</p>
        </div>
      )}

      <div className="space-y-2 mb-3">
        {fields.map((field, index) => (
          <div
            key={field.key || index}
            className="flex items-center gap-3 bg-[var(--color-bg-section)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 group"
          >
            <GripVertical className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-text-secondary)] truncate">
                  {field.label || field.key}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 rounded">
                  {FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                </span>
                {field.required && (
                  <span className="text-xs text-red-400">*</span>
                )}
              </div>
              {field.key && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">key: {field.key}</p>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => handleMove(index, -1)}
                className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
                disabled={index === 0}
              >
                <MoveUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMove(index, 1)}
                className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
                disabled={index === fields.length - 1}
              >
                <MoveDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleEdit(index)}
                className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-indigo-50 dark:hover:bg-indigo-950"
              >
                <span className="text-xs px-1">Editar</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="p-1 rounded text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editField && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Key</label>
              <input
                type="text"
                value={editField.key}
                onChange={(e) => handleFieldChange('key', e.target.value)}
                placeholder="Ej: headline"
                className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Label</label>
              <input
                type="text"
                value={editField.label}
                onChange={(e) => handleFieldChange('label', e.target.value)}
                placeholder="Ej: Título principal"
                className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Tipo</label>
              <select
                value={editField.type}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Placeholder</label>
              <input
                type="text"
                value={editField.placeholder || ''}
                onChange={(e) => handleFieldChange('placeholder', e.target.value)}
                placeholder="Texto de ayuda..."
                className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Texto de ayuda</label>
              <input
                type="text"
                value={editField.helpText || ''}
                onChange={(e) => handleFieldChange('helpText', e.target.value)}
                placeholder="Info extra para el usuario..."
                className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editField.required || false}
                  onChange={(e) => handleFieldChange('required', e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-xs font-medium text-[var(--color-text-muted)]">Requerido</span>
              </label>
            </div>
          </div>

          {editField.type === 'select' && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                Opciones (una por línea, formato: label|value)
              </label>
              <textarea
                value={(editField.options || []).map((o) => `${o.label}|${o.value}`).join('\n')}
                onChange={(e) => {
                  const options = e.target.value
                    .split('\n')
                    .filter((l) => l.includes('|'))
                    .map((l) => {
                      const [label, value] = l.split('|')
                      return { label: label.trim(), value: (value || label).trim() }
                    })
                  handleFieldChange('options', options)
                }}
                rows={3}
                placeholder="Chico|small&#10;Mediano|medium&#10;Grande|large"
                className="w-full px-2.5 py-1.5 text-sm border border-[var(--color-border)] rounded-md bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] font-mono"
              />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => { setEditingIndex(null); setEditField(null) }}
              className="px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!editField.key.trim() || !editField.label.trim()}
              className="px-3 py-1.5 text-sm font-medium bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

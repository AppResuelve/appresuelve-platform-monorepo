import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Save, X, Layers, Puzzle, Check, Ban } from 'lucide-react'
import { apiFetch } from '../../shared/api'
import DynamicFieldsEditor from '../components/DynamicFieldsEditor'
import { useAlert } from '../components/AlertContext'

const TABS = [
  { key: 'categories', label: 'Categorías', icon: Layers },
  { key: 'components', label: 'Componentes', icon: Puzzle },
]

const INITIAL_CATEGORY = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  order: 0,
  active: true,
  free: false,
  price: '',
}

const INITIAL_COMPONENT = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  thumbnail: '',
  estimatedDays: '',
  requiresApproval: false,
  paidOverride: false,
  price: '',
  fields: [],
  active: true,
  categoryId: '',
}

export default function ModuleBuilder() {
  const Alert = useAlert()
  const [tab, setTab] = useState('categories')
  const [categories, setCategories] = useState([])
  const [components, setComponents] = useState([])
  const [loading, setLoading] = useState(false)

  // Category modal
  const [showCatModal, setShowCatModal] = useState(false)
  const [catForm, setCatForm] = useState(INITIAL_CATEGORY)
  const [editingCatId, setEditingCatId] = useState(null)
  const [catSaving, setCatSaving] = useState(false)

  // Component modal
  const [showCompModal, setShowCompModal] = useState(false)
  const [compForm, setCompForm] = useState(INITIAL_COMPONENT)
  const [editingCompId, setEditingCompId] = useState(null)
  const [compSaving, setCompSaving] = useState(false)

  // Category filter for components tab
  const [compCategoryFilter, setCompCategoryFilter] = useState('')

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiFetch('/admin/module-categories')
      setCategories(data)
    } catch (err) {
      Alert.fire({ message: 'Error al cargar categorías', type: 'error' })
    }
  }, [])

  const fetchComponents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (compCategoryFilter) params.set('categoryId', compCategoryFilter)
      const data = await apiFetch(`/admin/module-components?${params}`)
      setComponents(data)
    } catch (err) {
      Alert.fire({ message: 'Error al cargar componentes', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [compCategoryFilter])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (tab === 'components') fetchComponents()
  }, [tab, fetchComponents])

  /* ─── Category CRUD ─── */

  const openNewCategory = () => {
    setEditingCatId(null)
    setCatForm(INITIAL_CATEGORY)
    setShowCatModal(true)
  }

  const openEditCategory = (cat) => {
    setEditingCatId(cat.id)
    setCatForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      icon: cat.icon || '',
      order: cat.order ?? 0,
      active: cat.active,
      free: cat.free,
      price: cat.price != null ? String(cat.price) : '',
    })
    setShowCatModal(true)
  }

  const saveCategory = async () => {
    if (!catForm.name.trim()) {
      Alert.fire({ message: 'El nombre es requerido', type: 'warning' })
      return
    }
    setCatSaving(true)
    try {
      const payload = {
        ...catForm,
        order: Number(catForm.order) || 0,
        price: catForm.price ? Number(catForm.price) : null,
      }
      if (editingCatId) {
        await apiFetch(`/admin/module-categories/${editingCatId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      } else {
        await apiFetch('/admin/module-categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }
      setShowCatModal(false)
      fetchCategories()
      Alert.fire({ message: editingCatId ? 'Categoría actualizada' : 'Categoría creada', type: 'success' })
    } catch (err) {
      Alert.fire({ message: err.message, type: 'error' })
    } finally {
      setCatSaving(false)
    }
  }

  const deleteCategory = async (cat) => {
    const confirmed = await Alert.fire({
      message: `¿Eliminar la categoría "${cat.name}"?`,
      type: 'warning',
      showCancel: true,
      confirmText: 'Eliminar',
    })
    if (!confirmed) return
    try {
      await apiFetch(`/admin/module-categories/${cat.id}`, { method: 'DELETE' })
      fetchCategories()
      Alert.fire({ message: 'Categoría eliminada', type: 'success' })
    } catch (err) {
      Alert.fire({ message: err.message, type: 'error' })
    }
  }

  /* ─── Component CRUD ─── */

  const openNewComponent = () => {
    setEditingCompId(null)
    setCompForm({ ...INITIAL_COMPONENT, categoryId: compCategoryFilter || '' })
    setShowCompModal(true)
  }

  const openEditComponent = (comp) => {
    setEditingCompId(comp.id)
    setCompForm({
      name: comp.name || '',
      slug: comp.slug || '',
      description: comp.description || '',
      icon: comp.icon || '',
      thumbnail: comp.thumbnail || '',
      estimatedDays: comp.estimatedDays != null ? String(comp.estimatedDays) : '',
      requiresApproval: comp.requiresApproval || false,
      paidOverride: comp.paidOverride || false,
      price: comp.price != null ? String(comp.price) : '',
      fields: comp.fields || [],
      active: comp.active,
      categoryId: comp.categoryId != null ? String(comp.categoryId) : '',
    })
    setShowCompModal(true)
  }

  const saveComponent = async () => {
    if (!compForm.name.trim()) {
      Alert.fire({ message: 'El nombre es requerido', type: 'warning' })
      return
    }
    if (!compForm.categoryId) {
      Alert.fire({ message: 'Seleccioná una categoría', type: 'warning' })
      return
    }
    setCompSaving(true)
    try {
      const payload = {
        ...compForm,
        categoryId: Number(compForm.categoryId),
        estimatedDays: compForm.estimatedDays ? Number(compForm.estimatedDays) : null,
        price: compForm.price ? Number(compForm.price) : null,
      }
      if (editingCompId) {
        await apiFetch(`/admin/module-components/${editingCompId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      } else {
        await apiFetch('/admin/module-components', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }
      setShowCompModal(false)
      fetchComponents()
      Alert.fire({ message: editingCompId ? 'Componente actualizado' : 'Componente creado', type: 'success' })
    } catch (err) {
      Alert.fire({ message: err.message, type: 'error' })
    } finally {
      setCompSaving(false)
    }
  }

  const deleteComponent = async (comp) => {
    const confirmed = await Alert.fire({
      message: `¿Eliminar el componente "${comp.name}"?`,
      type: 'warning',
      showCancel: true,
      confirmText: 'Eliminar',
    })
    if (!confirmed) return
    try {
      await apiFetch(`/admin/module-components/${comp.id}`, { method: 'DELETE' })
      fetchComponents()
      Alert.fire({ message: 'Componente eliminado', type: 'success' })
    } catch (err) {
      Alert.fire({ message: err.message, type: 'error' })
    }
  }

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === catId)
    return cat?.name || `ID ${catId}`
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Constructor</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        Gestioná las categorías y componentes de módulos que los clientes pueden solicitar.
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-[var(--color-bg-section)] rounded-lg p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ========== CATEGORIES TAB ========== */}
      {tab === 'categories' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              {categories.length} categoría{categories.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={openNewCategory}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"
            >
              <Plus className="w-4 h-4" />
              Nueva categoría
            </button>
          </div>

          <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-section)]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Icono</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Orden</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Estado</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Comps.</th>
                  <th className="px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">
                      No hay categorías. Creá la primera.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[var(--color-bg-elevated)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {cat.icon && <span className="text-lg">{cat.icon}</span>}
                          <div>
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">{cat.name}</p>
                            {cat.price != null && (
                              <p className="text-xs text-[var(--color-text-muted)]">${cat.price}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-muted)] font-mono">{cat.slug}</td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">{cat.icon || '-'}</td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-muted)] text-center">{cat.order}</td>
                      <td className="px-4 py-3 text-center">
                        {cat.active ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-section)] px-2 py-0.5 rounded-full">
                            <Ban className="w-3 h-3" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-muted)] text-center">
                        {cat.componentsCount || 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditCategory(cat)}
                            className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-indigo-50 dark:hover:bg-indigo-950"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCategory(cat)}
                            className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========== COMPONENTS TAB ========== */}
      {tab === 'components' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <select
                value={compCategoryFilter}
                onChange={(e) => setCompCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ''}{c.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-[var(--color-text-muted)]">
                {components.length} componente{components.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={openNewComponent}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"
            >
              <Plus className="w-4 h-4" />
              Nuevo componente
            </button>
          </div>

          <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-section)]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Slug</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Estado</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Campos</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase">Precio</th>
                  <th className="px-4 py-3 text-xs font-medium text-[var(--color-text-muted)] uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">
                      Cargando...
                    </td>
                  </tr>
                ) : components.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">
                      No hay componentes. Creá el primero.
                    </td>
                  </tr>
                ) : (
                  components.map((comp) => (
                    <tr key={comp.id} className="hover:bg-[var(--color-bg-elevated)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {comp.icon && <span className="text-lg">{comp.icon}</span>}
                          <p className="text-sm font-medium text-[var(--color-text-primary)]">{comp.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-section)] px-2 py-0.5 rounded">
                          {comp.category?.name || getCategoryName(comp.categoryId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-muted)] font-mono">{comp.slug}</td>
                      <td className="px-4 py-3 text-center">
                        {comp.active ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-section)] px-2 py-0.5 rounded-full">
                            <Ban className="w-3 h-3" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-muted)] text-center">
                        {(comp.fields || []).length}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {comp.paidOverride ? (
                          <span className="text-sm text-[var(--color-text-secondary)]">${comp.price || 0}</span>
                        ) : comp.price != null ? (
                          <span className="text-sm text-[var(--color-text-muted)]">${comp.price}</span>
                        ) : (
                          <span className="text-sm text-[var(--color-text-muted)]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditComponent(comp)}
                            className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-indigo-50 dark:hover:bg-indigo-950"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteComponent(comp)}
                            className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ========== CATEGORY MODAL ========== */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCatModal(false)} />
          <div className="relative bg-[var(--color-bg-card)] rounded-xl shadow-xl border border-[var(--color-border)] w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {editingCatId ? 'Editar categoría' : 'Nueva categoría'}
              </h3>
              <button onClick={() => setShowCatModal(false)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={catForm.name}
                    onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Slug</label>
                  <input
                    type="text"
                    value={catForm.slug}
                    onChange={(e) => setCatForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="auto-generado"
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Descripción</label>
                <textarea
                  value={catForm.description}
                  onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Icono (emoji)</label>
                  <input
                    type="text"
                    value={catForm.icon}
                    onChange={(e) => setCatForm((p) => ({ ...p, icon: e.target.value }))}
                    placeholder="🎯"
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Orden</label>
                  <input
                    type="number"
                    value={catForm.order}
                    onChange={(e) => setCatForm((p) => ({ ...p, order: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">Precio</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catForm.free}
                      onChange={(e) => {
                        setCatForm((p) => ({ ...p, free: e.target.checked, price: e.target.checked ? '' : p.price }))
                      }}
                      className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--color-text-secondary)]">Gratuito</span>
                  </label>
                </div>
                {catForm.free ? (
                  <div className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-section)] text-sm text-[var(--color-text-muted)]">
                    Sin costo
                  </div>
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    value={catForm.price}
                    onChange={(e) => setCatForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  />
                )}
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={catForm.active}
                    onChange={(e) => setCatForm((p) => ({ ...p, active: e.target.checked }))}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">Activo</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-section)]">
              <button
                onClick={() => setShowCatModal(false)}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                Cancelar
              </button>
              <button
                onClick={saveCategory}
                disabled={catSaving}
                className="px-4 py-2 text-sm font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {catSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== COMPONENT MODAL ========== */}
      {showCompModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCompModal(false)} />
          <div className="relative bg-[var(--color-bg-card)] rounded-xl shadow-xl border border-[var(--color-border)] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg-card)] z-10">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {editingCompId ? 'Editar componente' : 'Nuevo componente'}
              </h3>
              <button onClick={() => setShowCompModal(false)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={compForm.name}
                    onChange={(e) => setCompForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Slug</label>
                  <input
                    type="text"
                    value={compForm.slug}
                    onChange={(e) => setCompForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="auto-generado"
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Descripción</label>
                <textarea
                  value={compForm.description}
                  onChange={(e) => setCompForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Icono (emoji)</label>
                  <input
                    type="text"
                    value={compForm.icon}
                    onChange={(e) => setCompForm((p) => ({ ...p, icon: e.target.value }))}
                    placeholder="🎯"
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Thumbnail URL</label>
                  <input
                    type="text"
                    value={compForm.thumbnail}
                    onChange={(e) => setCompForm((p) => ({ ...p, thumbnail: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Días estimados</label>
                  <input
                    type="number"
                    value={compForm.estimatedDays}
                    onChange={(e) => setCompForm((p) => ({ ...p, estimatedDays: e.target.value }))}
                    placeholder="3"
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Categoría *</label>
                  <select
                    value={compForm.categoryId}
                    onChange={(e) => setCompForm((p) => ({ ...p, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ''}{c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[var(--color-text-secondary)]">Precio</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={compForm.paidOverride}
                        onChange={(e) => {
                          setCompForm((p) => ({ ...p, paidOverride: e.target.checked, price: e.target.checked ? p.price : '' }))
                        }}
                        className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm text-[var(--color-text-secondary)]">Precio propio</span>
                    </label>
                  </div>
                  {compForm.paidOverride ? (
                    <input
                      type="number"
                      step="0.01"
                      value={compForm.price}
                      onChange={(e) => setCompForm((p) => ({ ...p, price: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  ) : (
                    <div className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-section)] text-sm text-[var(--color-text-muted)]">
                      {compForm.categoryId
                        ? (() => {
                            const cat = categories.find((c) => String(c.id) === String(compForm.categoryId))
                            return cat?.price != null && !cat.free
                              ? `Usa el precio de la categoría ($${cat.price})`
                              : 'Usa el precio de la categoría'
                          })()
                        : 'Seleccioná una categoría primero'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={compForm.active}
                    onChange={(e) => setCompForm((p) => ({ ...p, active: e.target.checked }))}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">Activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={compForm.requiresApproval}
                    onChange={(e) => setCompForm((p) => ({ ...p, requiresApproval: e.target.checked }))}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">Requiere aprobación</span>
                </label>
              </div>

              <div className="border-t border-[var(--color-border)] pt-4">
                <DynamicFieldsEditor
                  fields={compForm.fields}
                  onChange={(fields) => setCompForm((p) => ({ ...p, fields }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-section)]">
              <button
                onClick={() => setShowCompModal(false)}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                Cancelar
              </button>
              <button
                onClick={saveComponent}
                disabled={compSaving}
                className="px-4 py-2 text-sm font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {compSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

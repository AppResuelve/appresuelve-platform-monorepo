import db from '../models/index.js'

const { ModuleCategory, ModuleComponent } = db

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/* ─── Categories ─── */

export async function listCategories() {
  const categories = await ModuleCategory.findAll({
    include: [
      {
        model: ModuleComponent,
        as: 'components',
        attributes: ['id'],
      },
    ],
    order: [['order', 'ASC'], ['name', 'ASC']],
  })

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    order: c.order,
    active: c.active,
    free: c.free,
    price: c.price,
    componentsCount: c.components?.length || 0,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }))
}

export async function getCategory(id) {
  return ModuleCategory.findByPk(id, {
    include: [
      {
        model: ModuleComponent,
        as: 'components',
        order: [['name', 'ASC']],
      },
    ],
  })
}

export async function createCategory(data) {
  const slug = data.slug || generateSlug(data.name)
  return ModuleCategory.create({ ...data, slug })
}

export async function updateCategory(id, data) {
  const category = await ModuleCategory.findByPk(id)
  if (!category) return null
  if (data.name && !data.slug) {
    data.slug = generateSlug(data.name)
  }
  return category.update(data)
}

export async function deleteCategory(id) {
  const category = await ModuleCategory.findByPk(id)
  if (!category) return null
  await category.destroy()
  return true
}

/* ─── Components ─── */

export async function listComponents(query = {}) {
  const where = {}
  if (query.categoryId) where.categoryId = query.categoryId
  if (query.active !== undefined) where.active = query.active

  return ModuleComponent.findAll({
    where,
    include: [
      {
        model: ModuleCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
    ],
    order: [['name', 'ASC']],
  })
}

export async function getComponent(id) {
  return ModuleComponent.findByPk(id, {
    include: [
      {
        model: ModuleCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
    ],
  })
}

export async function createComponent(data) {
  const slug = data.slug || generateSlug(data.name)
  return ModuleComponent.create({ ...data, slug })
}

export async function updateComponent(id, data) {
  const component = await ModuleComponent.findByPk(id)
  if (!component) return null
  if (data.name && !data.slug) {
    data.slug = generateSlug(data.name)
  }
  return component.update(data)
}

export async function deleteComponent(id) {
  const component = await ModuleComponent.findByPk(id)
  if (!component) return null
  await component.destroy()
  return true
}

/* ─── Public API ─── */

export async function getPublicModules() {
  const categories = await ModuleCategory.findAll({
    where: { active: true },
    include: [
      {
        model: ModuleComponent,
        as: 'components',
        where: { active: true },
        required: false,
      },
    ],
    order: [['order', 'ASC'], ['name', 'ASC']],
  })

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    free: c.free,
    price: c.price,
    components: (c.components || []).map((comp) => ({
      id: comp.id,
      name: comp.name,
      slug: comp.slug,
      description: comp.description,
      icon: comp.icon,
      thumbnail: comp.thumbnail,
      estimatedDays: comp.estimatedDays,
      requiresApproval: comp.requiresApproval,
      paidOverride: comp.paidOverride,
      price: comp.price,
      fields: comp.fields,
    })),
  }))
}

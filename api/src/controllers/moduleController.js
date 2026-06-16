import * as moduleService from '../services/moduleService.js'

/* ─── Categories ─── */

export async function listCategories(req, res) {
  try {
    const categories = await moduleService.listCategories()
    res.json(categories)
  } catch (error) {
    console.error('Error listing module categories:', error)
    res.status(500).json({ error: 'Failed to list categories' })
  }
}

export async function getCategory(req, res) {
  try {
    const { id } = req.params
    const category = await moduleService.getCategory(id)
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    res.json(category)
  } catch (error) {
    console.error('Error getting module category:', error)
    res.status(500).json({ error: 'Failed to get category' })
  }
}

export async function createCategory(req, res) {
  try {
    const category = await moduleService.createCategory(req.body)
    res.status(201).json(category)
  } catch (error) {
    console.error('Error creating module category:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params
    const category = await moduleService.updateCategory(id, req.body)
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    res.json(category)
  } catch (error) {
    console.error('Error updating module category:', error)
    res.status(500).json({ error: 'Failed to update category' })
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params
    const deleted = await moduleService.deleteCategory(id)
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' })
    }
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting module category:', error)
    res.status(500).json({ error: 'Failed to delete category' })
  }
}

/* ─── Components ─── */

export async function listComponents(req, res) {
  try {
    const components = await moduleService.listComponents(req.query)
    res.json(components)
  } catch (error) {
    console.error('Error listing module components:', error)
    res.status(500).json({ error: 'Failed to list components' })
  }
}

export async function getComponent(req, res) {
  try {
    const { id } = req.params
    const component = await moduleService.getComponent(id)
    if (!component) {
      return res.status(404).json({ error: 'Component not found' })
    }
    res.json(component)
  } catch (error) {
    console.error('Error getting module component:', error)
    res.status(500).json({ error: 'Failed to get component' })
  }
}

export async function createComponent(req, res) {
  try {
    const component = await moduleService.createComponent(req.body)
    res.status(201).json(component)
  } catch (error) {
    console.error('Error creating module component:', error)
    res.status(500).json({ error: 'Failed to create component' })
  }
}

export async function updateComponent(req, res) {
  try {
    const { id } = req.params
    const component = await moduleService.updateComponent(id, req.body)
    if (!component) {
      return res.status(404).json({ error: 'Component not found' })
    }
    res.json(component)
  } catch (error) {
    console.error('Error updating module component:', error)
    res.status(500).json({ error: 'Failed to update component' })
  }
}

export async function deleteComponent(req, res) {
  try {
    const { id } = req.params
    const deleted = await moduleService.deleteComponent(id)
    if (!deleted) {
      return res.status(404).json({ error: 'Component not found' })
    }
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting module component:', error)
    res.status(500).json({ error: 'Failed to delete component' })
  }
}

/* ─── Public ─── */

export async function getPublicModules(req, res) {
  try {
    const modules = await moduleService.getPublicModules()
    res.json(modules)
  } catch (error) {
    console.error('Error getting public modules:', error)
    res.status(500).json({ error: 'Failed to get modules' })
  }
}

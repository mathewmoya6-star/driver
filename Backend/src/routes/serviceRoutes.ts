import { Router, Request, Response } from 'express'
import { supabase } from '../app'
import { authenticate } from '../middleware/auth'

const router = Router()

// Get all services
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query

    let query = supabase.from('services').select('*, provider:profiles(first_name, last_name, avatar_url)')

    if (category) query = query.eq('category', category)
    if (minPrice) query = query.gte('price', minPrice)
    if (maxPrice) query = query.lte('price', maxPrice)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query

    if (error) throw error

    res.json({
      success: true,
      data: data,
      count: data?.length || 0
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get single service
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('services')
      .select('*, provider:profiles(*)')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      })
    }

    res.json({
      success: true,
      data: data
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Create service (Authenticated)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, description, category, price, duration, location } = req.body
    const userId = (req as any).user.id

    const { data, error } = await supabase
      .from('services')
      .insert([
        {
          provider_id: userId,
          title,
          description,
          category,
          price,
          duration,
          location
        }
      ])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: data
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Update service
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body
    const userId = (req as any).user.id

    // Check if user owns the service
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('provider_id')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (service.provider_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not own this service'
      })
    }

    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: data
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Delete service
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = (req as any).user.id

    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('provider_id')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (service.provider_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not own this service'
      })
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({
      success: true,
      message: 'Service deleted successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

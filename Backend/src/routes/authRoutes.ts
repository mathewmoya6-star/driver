import { Router, Request, Response } from 'express'
import { supabase } from '../app'
import jwt from 'jsonwebtoken'

const router = Router()

// Sign Up
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body

    // Sign up with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          role: 'USER'
        }
      }
    })

    if (authError) throw authError

    // Create profile in your profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user?.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          role: 'USER'
        }
      ])

    if (profileError) throw profileError

    // Generate JWT token
    const token = jwt.sign(
      { userId: authData.user?.id, email: email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: authData.user,
        token
      }
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Sign In
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) throw authError

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) throw profileError

    // Generate JWT token
    const token = jwt.sign(
      { userId: authData.user.id, email: email, role: profile.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { ...authData.user, profile },
        token
      }
    })
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message
    })
  }
})

// Sign Out
router.post('/signout', async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    res.json({
      success: true,
      message: 'Signed out successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get Current User
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error) throw error

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    res.json({
      success: true,
      data: { ...user, profile }
    })
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message
    })
  }
})

export default router

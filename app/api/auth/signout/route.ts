import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Signout error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({ 
      message: 'Signed out successfully',
      success: true 
    })
  } catch (error) {
    console.error('Signout API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
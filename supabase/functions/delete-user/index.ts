import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

// Create the admin client using your CUSTOM secret names
const supabaseAdmin = createClient(
  Deno.env.get('MY_SUPABASE_URL') ?? '',        // <-- MUST MATCH YOUR SECRET NAME
  Deno.env.get('MY_SERVICE_ROLE_KEY') ?? ''     // <-- MUST MATCH YOUR SECRET NAME
)

serve(async (req) => {
  // 1. Handle CORS (Pre-flight checks)
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // 2. Parse the body
    const { user_id } = await req.json()
    if (!user_id) throw new Error('User ID is required')

    console.log(`Attempting to delete user: ${user_id}`)

    // 3. Delete from Auth system (This requires the Service Role Key)
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(user_id)

    if (error) {
      console.error('Auth delete error:', error)
      throw error
    }

    // 4. Also explicitly delete from profiles table (just to be safe)
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user_id)
    
    if (dbError) {
      console.error('DB Profile delete error:', dbError)
      // We don't throw here, because the auth user is already gone.
    }

    return new Response(
      JSON.stringify({ message: 'User deleted successfully' }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Function failed:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
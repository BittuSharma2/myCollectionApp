import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// --- (THE FIX) ---
// Changed from 'https.npm.io' to 'npm:'
import { createClient } from 'npm:@supabase/supabase-js@2'
// --- (END FIX) ---

// Create an admin-level Supabase client
const supabaseAdmin = createClient(
  Deno.env.get('MY_SUPABASE_URL') ?? '', // <-- THE FIX
  Deno.env.get('MY_SERVICE_ROLE_KEY') ?? ''// Use the Service Role Key
)

serve(async (req) => {
  try {
    const { userId, newPassword } = await req.json()

    if (!userId) throw new Error('User ID is required')
    if (!newPassword) throw new Error('New password is required')

    // This admin function updates the user's password in auth.users
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (error) throw error

    return new Response(
      JSON.stringify({ data }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
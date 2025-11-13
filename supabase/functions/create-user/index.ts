import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // 1. Create Supabase Admin Client
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // 2. Check if the caller is an 'admin'
  const authHeader = req.headers.get('Authorization')!;
  const { data: { user } } = await supabaseAdmin.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Not authorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Get all the new agent details from the request body
  const { 
    email, 
    password, 
    username,
    mobile_no,        // <-- NEW
    address,          // <-- NEW
    aadhar_card_no    // <-- NEW
  } = await req.json();

  // 4. Check for required fields (Aadhar is optional)
  if (!email || !password || !username || !mobile_no || !address) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 5. Create the new user's login
  const { data: newUserData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Auto-confirm their email
  });

  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // 6. Create the new user's profile with all the new details
  const { error: newProfileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: newUserData.user.id,
      email: email, // Also save the email here for convenience
      username: username,
      role: 'user', // 'user' is the agent role
      mobile_no: mobile_no,         // <-- NEW
      address: address,           // <-- NEW
      aadhar_card_no: aadhar_card_no  // <-- NEW
    });

  if (newProfileError) {
    return new Response(JSON.stringify({ error: newProfileError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // 7. Send a success response
  return new Response(JSON.stringify({ message: 'Agent created successfully' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
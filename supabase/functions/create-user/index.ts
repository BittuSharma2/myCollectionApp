import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // 1. Create a Supabase Admin Client
  // This client has full admin rights and is only on the server
  const supabaseAdmin = createClient(
    // These Deno variables are set by Supabase when you deploy
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // 2. Check if the person calling this function is an 'admin'
  // We get their auth token from the 'Authorization' header
  const authHeader = req.headers.get('Authorization')!;
  
  // Get the user object from the token
  const { data: { user } } = await supabaseAdmin.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check their role in the 'profiles' table
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

  // 3. If they are an admin, proceed to create the new user
  // Get the new user's details from the request body
  const { email, password, username } = await req.json();

  if (!email || !password || !username) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 4. Create the new user's login
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
  
  // 5. Create the new user's profile
  const { error: newProfileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: newUserData.user.id,
      username: username,
      role: 'user',
    });

  if (newProfileError) {
    return new Response(JSON.stringify({ error: newProfileError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // 6. Send a success response
  return new Response(JSON.stringify({ message: 'User created successfully' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
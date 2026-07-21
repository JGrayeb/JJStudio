
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('La configuración de Supabase no está completa.');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Falta RESEND_API_KEY.');
  }

  return new Resend(apiKey);
}

export async function POST(request: Request) {
  try {
    const supabase = getAdminClient();
    const resend = getResendClient();
    const { fullName, alias, email, password, phone } = await request.json();

    // Validate input
    if (!fullName || !alias || !email || !password || !phone) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if alias is unique
    const { data: aliasExists } = await supabase
      .from('profiles')
      .select('id')
      .eq('alias', alias)
      .single();

    if (aliasExists) {
      return Response.json(
        { error: 'Alias already taken' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false
    });

if (authError || !authData.user) {
  console.error('Auth error:', authError); // ← ADD THIS
  return Response.json(
    { error: authError?.message || 'Failed to create user' },
    { status: 400 }
  );
}

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        alias,
        phone_number: phone,
        email_verified: false
      });

if (profileError) {
  console.error('Profile creation error:', profileError); // ← ADD THIS
  // Clean up auth user if profile creation fails
  await supabase.auth.admin.deleteUser(authData.user.id);
  return Response.json(
    { error: `Failed to create profile: ${profileError.message}` }, // ← CHANGE THIS
    { status: 400 }
  );
}

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { error: tokenError } = await supabase
      .from('email_verifications')
      .insert({
        user_id: authData.user.id,
        token: verificationToken,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      return Response.json(
        { error: 'Failed to create verification token' },
        { status: 400 }
      );
    }

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

    await resend.emails.send({
      from: 'JJStudio <onboarding@resend.dev>',
      to: email,
      subject: 'Verify Your JJStudio Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; padding: 20px; color: #fff;">
          <h1 style="color: #dc2626; text-align: center;">Welcome to JJStudio!</h1>
          
          <p style="text-align: center; font-size: 16px; margin: 20px 0;">Hi <strong>${fullName}</strong>,</p>
          
          <p style="text-align: center; color: #ccc;">Thanks for joining our fitness community. To complete your registration and start booking classes, please verify your email.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="
              display: inline-block;
              background-color: #dc2626;
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
              font-size: 16px;
            ">
              VERIFY EMAIL
            </a>
          </div>
          
          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            Or copy this link:<br/>
            <code style="background: #1a1a1a; padding: 8px; display: inline-block; border-radius: 4px;">${verificationLink}</code>
          </p>
          
          <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">This link expires in 24 hours.</p>
          
          <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;" />
          
          <p style="text-align: center; color: #999; font-size: 12px;">
            JJStudio Team<br/>
            <strong style="color: #dc2626;">Trust The Process.</strong>
          </p>
        </div>
      `
    });

    return Response.json({
      success: true,
      message: 'Account created! Check your email to verify.',
      userId: authData.user.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

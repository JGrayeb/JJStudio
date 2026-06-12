import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  // If it's a password reset, exchange the code for a session
  if (type === 'recovery' && code) {
    const supabase = await createClient();
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      return NextResponse.redirect(
        new URL(`/password-reset?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
    
    // Redirect to password reset page (session is now active)
    return NextResponse.redirect(new URL('/password-reset', request.url));
  }

  // Handle normal sign-up/sign-in flow
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
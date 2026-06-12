import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  // If it's a password reset, redirect to password-reset page
  if (type === 'recovery' && code) {
    return NextResponse.redirect(
      new URL(`/password-reset?code=${code}`, request.url)
    );
  }

  // Handle normal sign-up/sign-in flow
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
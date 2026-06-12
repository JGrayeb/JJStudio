// app/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Exchange error:', error);
      return NextResponse.redirect(
        new URL(`/password-reset?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    // Redirect based on the flow type
    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/password-reset', request.url));
    }
    
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.redirect(new URL('/login', request.url));
}
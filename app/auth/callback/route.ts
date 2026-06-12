// app/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  
  console.log('🔍 Callback hit with:', { code: code?.slice(0, 10), type });

  if (code) {
    try {
      const supabase = await createClient();
      console.log('📊 Exchanging code for session...');
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      console.log('✅ Exchange result:', { hasData: !!data, error: error?.message });

      if (error) {
        console.error('❌ Exchange error:', error);
        return NextResponse.redirect(
          new URL(`/password-reset?error=${encodeURIComponent(error.message)}`, request.url)
        );
      }

      console.log('✅ Session exchanged successfully, user:', data.user?.email);

      if (type === 'recovery') {
        console.log('🔄 Redirecting to password-reset');
        return NextResponse.redirect(new URL('/password-reset', request.url));
      }
      
      console.log('🔄 Redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (err) {
      console.error('💥 Callback error:', err);
      return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
    }
  }

  console.log('⚠️ No code provided, redirecting to login');
  return NextResponse.redirect(new URL('/login', request.url));
}
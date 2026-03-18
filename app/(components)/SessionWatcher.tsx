'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearTokens } from '@/utils/tokenSlice';

export default function SessionWatcher() {
  const { status, data: session } = useSession();
  const pathname = usePathname();
  const dispatch = useDispatch();

  useEffect(() => {
    // If we're on the login or OTP page, we don't need to check for session expiration
    if (pathname === '/login' || pathname === '/login/otp') return;

    // Check if NextAuth session is unauthenticated
    if (status === 'unauthenticated') {
      console.log('Session expired or unauthenticated. Logging out...');
      // Clear Redux tokens as a precaution
      dispatch(clearTokens());
      // Sign out and redirect to login
      signOut({ callbackUrl: `${window.location.origin}/login` });
      return;
    }

    // Optional: If idToken exists, you could decode it and check expiration locally
    // However, configuring refetchInterval in SessionProvider is usually enough
    // as NextAuth will automatically set status to 'unauthenticated' once it expires.
  }, [status, pathname, dispatch]);

  return null;
}

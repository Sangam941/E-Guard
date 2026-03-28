'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Manually force an auth check to bypass Zustand's hydration lag
    const isValid = checkAuth();
    if (!isValid) {
      router.push('/login');
    }
    setChecking(false);
  }, [checkAuth, router]);

  // Show loading while checking or redirecting
  if (checking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p>Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
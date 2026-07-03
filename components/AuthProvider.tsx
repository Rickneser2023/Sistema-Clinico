"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUserById, AuthUser } from '@/app/actions/auth';
import { useToast } from './ToastProvider';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  loginUser: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  loginUser: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const doLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('current_user_id');
    setSessionExpired(true);
    setTimeout(() => router.push('/login'), 2000);
  }, [router]);

  useEffect(() => {
    const storedId = localStorage.getItem('current_user_id');
    if (!storedId) {
      setLoading(false);
      setUser(null);
      return;
    }
    getUserById(storedId)
      .then(found => {
        if (found && found.activo) {
          setUser(found);
        } else {
          if (found && !found.activo) {
            toast("Tu cuenta ha sido desactivada. Serás redirigido al login.", "error");
          }
          localStorage.removeItem('current_user_id');
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('current_user_id');
        setUser(null);
        setLoading(false);
      });
  }, [toast]);

  // Periodic check: cada 30s verificar que el usuario sigue activo
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(async () => {
      try {
        const found = await getUserById(user.id);
        if (!found || !found.activo) {
          toast("Sesión expirada o cuenta desactivada.", "error");
          doLogout();
        }
      } catch {
        // ignore network errors
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.id, toast, doLogout]);

  const loginUser = (u: AuthUser) => {
    setUser(u);
    setSessionExpired(false);
    localStorage.setItem('current_user_id', u.id);
  };

  const logout = () => {
    doLogout();
  };

  if (sessionExpired) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-app)', color: 'var(--secondary-color)',
        flexDirection: 'column', gap: '1rem',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-critico)" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h2>Sesión expirada</h2>
        <p style={{ color: 'var(--secondary-light)' }}>Redirigiendo al login...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

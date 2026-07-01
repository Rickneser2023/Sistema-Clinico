"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserById, AuthUser } from '@/app/actions/auth';

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
  const router = useRouter();

  useEffect(() => {
    const storedId = localStorage.getItem('current_user_id');
    if (!storedId) {
      setLoading(false);
      setUser(null);
      return;
    }
    getUserById(storedId).then(found => {
      if (found && found.activo) {
        setUser(found);
      } else {
        localStorage.removeItem('current_user_id');
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const loginUser = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem('current_user_id', u.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user_id');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

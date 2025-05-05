'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import Client from '@prisma/client';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { session: Session | null; user: User | null } | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);
        router.refresh();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email);
      const prisma = new Client.PrismaClient();
      const { data: { user } } = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.error('User not found in database:', email);
        return {
          error: new Error('User not found'),
          data: { session: null, user: null }
        };
      }
      console.log('User found in database:', user);

      if (user.password !== password) {
        console.error('Incorrect password for user:', email);
        return {
          error: new Error('Incorrect password'),
          data: { session: null, user: null }
        };
      }
      console.log('Password is correct for user:', email);

      router.push('/dashboard');

      return {
        error: null,
        data: { session, user }
      };
    } catch (e) {
      console.error('Exception during sign in:', e);
      return {
        error: new Error('Authentication service error'),
        data: { session: null, user: null }
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import { apiClient } from "./api-client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export type AuthResult = {
  success: boolean;
  error?: string;
};

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  const syncToken = useCallback((session: Session | null) => {
    if (session?.access_token) {
      apiClient.setToken(session.access_token);
    } else {
      apiClient.clearToken();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      const user = session?.user ?? null;
      setState({ user, session, loading: false });
      syncToken(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      const user = session?.user ?? null;
      setState({ user, session, loading: false });
      syncToken(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [syncToken]);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error("SignIn error:", err);
      return { success: false, error: err.message || "Login failed" };
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        return { success: false, error: error.message || "Registration failed" };
      }

      return { success: true };
    } catch (err: any) {
      console.error("SignUp error:", err);
      return { success: false, error: err.message || "Registration failed" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
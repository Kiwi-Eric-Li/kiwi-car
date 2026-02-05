import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (data: { email: string; password: string; phone?: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    phone: supabaseUser.phone || supabaseUser.user_metadata?.phone,
    nickname: supabaseUser.user_metadata?.nickname,
    avatar: supabaseUser.user_metadata?.avatar,
    region: supabaseUser.user_metadata?.region,
    phoneVisible: supabaseUser.user_metadata?.phoneVisible ?? false,
    createdAt: supabaseUser.created_at,
  };
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({
          user: mapSupabaseUser(session.user),
          token: session.access_token,
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        set({ isInitialized: true });
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          set({
            user: mapSupabaseUser(session.user),
            token: session.access_token,
            isAuthenticated: true,
          });
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      });
    } catch {
      set({ isInitialized: true });
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async ({ email, password, phone }) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { phone },
        },
      });
      if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  updateUser: (data: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));

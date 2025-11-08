import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User, LoginCredentials, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: true, 
        isLoading: false 
      };
    case 'LOGOUT':
      return { 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        isLoading: false
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const handleSession = (session: Session | null) => {
      if (session?.user) {
        // Simplified auth - using only auth.users metadata
        setTimeout(async () => {
          try {
            const userId = session.user!.id;
            const email = session.user!.email || '';
            const metadata = session.user!.user_metadata || {};

            const user: User = {
              id: userId,
              email,
              name: metadata.full_name || email.split('@')[0],
              role: (metadata.role as UserRole) || 'SECRETARIA',
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
              createdAt: session.user!.created_at,
              updatedAt: session.user!.updated_at || session.user!.created_at,
            };
            dispatch({ type: 'SET_USER', payload: user });
          } catch {
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }, 0);
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
      if (!session) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      
      // User state will be updated via the auth state change listener
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (data: { name: string; email: string; password: string; role: UserRole }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.name,
            role: data.role,
          }
        }
      });

      if (error) throw error;
      
      // User state will be updated via the auth state change listener
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { useState, useEffect } from 'react';

// Mock auth for demo purposes - replace with actual Supabase auth
interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('invoiceapp_user');
    if (storedUser) {
      setAuthState({
        user: JSON.parse(storedUser),
        loading: false,
      });
    } else {
      setAuthState({
        user: null,
        loading: false,
      });
    }
  }, []);

  const signIn = (email: string, password: string) => {
    // Mock sign in - replace with Supabase auth
    const user = { id: '1', email };
    localStorage.setItem('invoiceapp_user', JSON.stringify(user));
    setAuthState({ user, loading: false });
  };

  const signUp = (email: string, password: string) => {
    // Mock sign up - replace with Supabase auth
    const user = { id: '1', email };
    localStorage.setItem('invoiceapp_user', JSON.stringify(user));
    setAuthState({ user, loading: false });
  };

  const signOut = () => {
    localStorage.removeItem('invoiceapp_user');
    setAuthState({ user: null, loading: false });
  };

  return {
    user: authState.user,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
  };
};

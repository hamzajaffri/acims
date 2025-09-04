import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User, Session } from '@supabase/supabase-js';

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        title: 'Signup Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: 'Sign In Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    console.log('signOut function called');
    try {
      const { error } = await supabase.auth.signOut();
      console.log('Supabase signOut result:', { error });
      if (error) {
        console.error('Supabase signOut error:', error);
        toast({
          title: 'Sign Out Error',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      console.log('SignOut successful, clearing state...');
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('SignOut catch block:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
}
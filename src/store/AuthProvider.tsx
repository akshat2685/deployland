import { useEffect, useState } from 'react';
import { AuthContext } from './auth';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { userDatabase, UserAccount } from './userDatabase';
import { isLifetimeVip } from '../engine/access-policy';
import { usePlayerStore } from './player-store';

function accountToUser(account: UserAccount): User {
  return {
    id: account.id,
    app_metadata: { provider: account.provider },
    user_metadata: { 
      name: account.name, 
      email: account.email,
      isVip: account.isVip,
      avatarUrl: account.avatarUrl 
    },
    aud: 'authenticated',
    created_at: new Date(account.createdAt).toISOString(),
    email: account.email
  } as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const isRealCloud = Boolean(
      import.meta.env.VITE_SUPABASE_URL && 
      !import.meta.env.VITE_SUPABASE_URL.includes('mock.supabase.co')
    );

    // 1. Check local multi-user database active session
    const activeAccount = userDatabase.getActiveSession();
    if (activeAccount) {
      const u = accountToUser(activeAccount);
      setUser(u);
      if (activeAccount.isVip || isLifetimeVip(activeAccount.email)) {
        usePlayerStore.getState().grantEntitlement('cicd');
      }
      setLoading(false);
      return;
    }

    // 2. If no real cloud database configured, finish loading immediately
    if (!isRealCloud) {
      setLoading(false);
      return;
    }

    // 3. Fallback to Supabase session if real cloud is configured
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 300);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      clearTimeout(timer);
      if (session?.user) {
        setUser(session.user);
        if (isLifetimeVip(session.user.email)) {
          usePlayerStore.getState().grantEntitlement('cicd');
        }
      }
      setLoading(false);
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        if (isLifetimeVip(session.user.email)) {
          usePlayerStore.getState().grantEntitlement('cicd');
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const signInGuest = async () => {
    const guestAccount: UserAccount = {
      id: 'guest_' + Math.random().toString(36).slice(2, 9),
      email: 'guest@deployland.local',
      name: 'Guest Operator',
      provider: 'guest',
      isVip: false,
      entitlements: [],
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };
    userDatabase.setActiveSession(guestAccount);
    setUser(accountToUser(guestAccount));
  };

  const signInWithGithub = async (customHandle?: string) => {
    try {
      // If a real Supabase URL is configured, try Supabase OAuth
      const isCustomSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('mock.supabase.co');
      if (isCustomSupabase) {
        await supabase.auth.signInWithOAuth({ 
          provider: 'github',
          options: { redirectTo: window.location.origin }
        });
        return;
      }
    } catch {
      // Fallback to local smooth GitHub account authentication
    }

    const handle = customHandle || 'i-jain';
    const email = handle.includes('@') ? handle : `${handle}@github.com`;
    const isVip = isLifetimeVip(email) || handle.toLowerCase().includes('akshat') || handle.toLowerCase().includes('i-jain');
    
    let account = userDatabase.getAccountByEmail(email);
    if (!account) {
      account = {
        id: `gh_${handle.replace(/[^a-zA-Z0-9_-]/g, '')}`,
        email,
        name: `@${handle}`,
        provider: 'github',
        isVip,
        entitlements: isVip ? ['cicd'] : [],
        createdAt: Date.now(),
        lastLoginAt: Date.now()
      };
    } else {
      account.lastLoginAt = Date.now();
      if (isVip) {
        account.isVip = true;
        account.entitlements = Array.from(new Set([...account.entitlements, 'cicd']));
      }
    }

    userDatabase.setActiveSession(account);
    if (account.isVip) {
      usePlayerStore.getState().grantEntitlement('cicd');
    }
    setUser(accountToUser(account));
  };

  const signInWithEmail = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    
    // If Supabase is configured with a real cloud database, try Supabase password auth first
    const isCustomSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('mock.supabase.co');
    if (isCustomSupabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (!error && data.user) {
          setUser(data.user);
          if (isLifetimeVip(cleanEmail)) {
            usePlayerStore.getState().grantEntitlement('cicd');
          }
          return;
        }
      } catch {
        // Fallback to local user database
      }
    }

    // Authenticate through UserDatabase with password verification
    const account = password 
      ? await userDatabase.authenticate(cleanEmail, password)
      : userDatabase.getAccountByEmail(cleanEmail) || await userDatabase.registerAccount(cleanEmail, 'default_dev_pass');

    userDatabase.setActiveSession(account);
    if (account.isVip || isLifetimeVip(cleanEmail)) {
      usePlayerStore.getState().grantEntitlement('cicd');
    }
    setUser(accountToUser(account));
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    
    const isCustomSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('mock.supabase.co');
    if (isCustomSupabase) {
      try {
        await supabase.auth.signUp({ email: cleanEmail, password });
      } catch {
        // Fallback to local
      }
    }

    const account = await userDatabase.registerAccount(cleanEmail, password, name);
    userDatabase.setActiveSession(account);
    if (account.isVip || isLifetimeVip(cleanEmail)) {
      usePlayerStore.getState().grantEntitlement('cicd');
    }
    setUser(accountToUser(account));
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    userDatabase.setActiveSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInGuest, signInWithGithub, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

import { isLifetimeVip } from '../engine/access-policy';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  avatarUrl?: string;
  provider: 'email' | 'github' | 'guest';
  isVip: boolean;
  entitlements: string[];
  createdAt: number;
  lastLoginAt: number;
}

const DB_KEY = 'deployland_users_db_v2';
const SESSION_KEY = 'deployland_active_session_v2';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim() + '_deployland_sec_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export class UserDatabase {
  public getAllAccounts(): UserAccount[] {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getAccountByEmail(email: string): UserAccount | null {
    const accounts = this.getAllAccounts();
    return accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }

  public getAccountById(id: string): UserAccount | null {
    const accounts = this.getAllAccounts();
    return accounts.find(a => a.id === id) || null;
  }

  public async registerAccount(email: string, password: string, name?: string): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.getAccountByEmail(cleanEmail);
    const passwordHash = await hashPassword(password);
    const isVip = isLifetimeVip(cleanEmail);

    if (existing) {
      existing.passwordHash = passwordHash;
      existing.lastLoginAt = Date.now();
      if (name) existing.name = name;
      if (isVip) {
        existing.isVip = true;
        existing.entitlements = Array.from(new Set([...existing.entitlements, 'cicd']));
      }
      this.saveAccount(existing);
      return existing;
    }

    const newAccount: UserAccount = {
      id: `usr_${btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0].toUpperCase(),
      passwordHash,
      provider: 'email',
      isVip,
      entitlements: isVip ? ['cicd'] : [],
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };

    this.saveAccount(newAccount);
    return newAccount;
  }

  public async authenticate(email: string, password: string): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();
    const account = this.getAccountByEmail(cleanEmail);
    const inputHash = await hashPassword(password);

    if (!account) {
      // First time login for this email: register and set password securely
      return await this.registerAccount(cleanEmail, password);
    }

    // If account has an existing password, verify it strictly
    if (account.passwordHash && account.passwordHash !== inputHash) {
      throw new Error('INVALID_SECURITY_CREDENTIALS: Password does not match operator record.');
    }

    // If account was created before password system, save this password as master
    if (!account.passwordHash) {
      account.passwordHash = inputHash;
    }

    account.lastLoginAt = Date.now();
    if (isLifetimeVip(account.email)) {
      account.isVip = true;
      account.entitlements = Array.from(new Set([...account.entitlements, 'cicd']));
    }

    this.saveAccount(account);
    return account;
  }

  public saveAccount(account: UserAccount): void {
    const accounts = this.getAllAccounts();
    const idx = accounts.findIndex(a => a.id === account.id || a.email.toLowerCase() === account.email.toLowerCase());
    
    // Auto-grant VIP if email matches lifetime premium list
    if (isLifetimeVip(account.email)) {
      account.isVip = true;
      account.entitlements = Array.from(new Set([...account.entitlements, 'cicd']));
    }

    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], ...account, lastLoginAt: Date.now() };
    } else {
      accounts.push(account);
    }

    try {
      localStorage.setItem(DB_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Failed to save to local database', e);
    }
  }

  public getActiveSession(): UserAccount | null {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      // Check if VIP status should be refreshed
      if (parsed && isLifetimeVip(parsed.email)) {
        parsed.isVip = true;
        parsed.entitlements = Array.from(new Set([...(parsed.entitlements || []), 'cicd']));
      }
      return parsed;
    } catch {
      return null;
    }
  }

  public setActiveSession(account: UserAccount | null): void {
    try {
      if (account) {
        if (isLifetimeVip(account.email)) {
          account.isVip = true;
          account.entitlements = Array.from(new Set([...account.entitlements, 'cicd']));
        }
        localStorage.setItem(SESSION_KEY, JSON.stringify(account));
        this.saveAccount(account);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (e) {
      console.warn('Failed to update active session', e);
    }
  }
}

export const userDatabase = new UserDatabase();

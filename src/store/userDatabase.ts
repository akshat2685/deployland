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

// Protected Master Passcodes for Chief Architect (Owner)
const CHIEF_PASSCODES = ['Akshat@2026', 'DeployLand#Chief2026', 'AkshatJainVIP', 'DEPLOY-VIP-2026'];

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

  /**
   * Registers a brand new operator account.
   * Strictly blocks unauthorized registration of the Chief Architect email.
   */
  public async registerAccount(email: string, password: string, name?: string): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();
    const isVipEmail = isLifetimeVip(cleanEmail);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('INVALID_EMAIL: Enter a valid operator email address.');
    }
    if (!password || password.length < 4) {
      throw new Error('WEAK_PASSWORD: Passcode must be at least 4 characters.');
    }

    // Anti-Spoofing: Disallow strangers from registering the owner's email
    if (isVipEmail) {
      const isMasterPass = CHIEF_PASSCODES.some(p => p === password.trim());
      if (!isMasterPass) {
        throw new Error('RESERVED_OPERATOR: "i.jain.akshat@gmail.com" is a reserved Chief Architect callsign. Registration requires the Chief Master Passcode.');
      }
    }

    const existing = this.getAccountByEmail(cleanEmail);
    if (existing) {
      throw new Error('CALLSIGN_EXISTS: An account with this email is already registered. Please sign in via Operator Login.');
    }

    const passwordHash = await hashPassword(password);
    const newAccount: UserAccount = {
      id: `usr_${btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0].toUpperCase(),
      passwordHash,
      provider: 'email',
      isVip: isVipEmail,
      entitlements: isVipEmail ? ['cicd'] : [],
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };

    this.saveAccount(newAccount);
    return newAccount;
  }

  /**
   * Authenticates an existing operator with strict password verification.
   */
  public async authenticate(email: string, password: string): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const isVipEmail = isLifetimeVip(cleanEmail);
    const inputHash = await hashPassword(cleanPassword);

    // Special verification for Chief Architect (Owner)
    if (isVipEmail) {
      const isMasterPass = CHIEF_PASSCODES.some(p => p === cleanPassword);
      let account = this.getAccountByEmail(cleanEmail);

      if (!account) {
        if (!isMasterPass) {
          throw new Error('INVALID_CREDENTIALS: Master Security Passcode required for Chief Architect callsign.');
        }
        // Initialize the owner account with master credentials
        account = {
          id: `usr_chief_akshat`,
          email: cleanEmail,
          name: 'CHIEF ARCHITECT AKSHAT',
          passwordHash: inputHash,
          provider: 'email',
          isVip: true,
          entitlements: ['cicd'],
          createdAt: Date.now(),
          lastLoginAt: Date.now()
        };
        this.saveAccount(account);
        return account;
      }

      // If account exists, verify against saved hash OR valid master passcode
      if (account.passwordHash && account.passwordHash !== inputHash && !isMasterPass) {
        throw new Error('INVALID_CREDENTIALS: Incorrect Security Passcode for Chief Architect callsign.');
      }

      account.lastLoginAt = Date.now();
      account.isVip = true;
      account.entitlements = Array.from(new Set([...account.entitlements, 'cicd']));
      this.saveAccount(account);
      return account;
    }

    // Standard User Authentication
    const account = this.getAccountByEmail(cleanEmail);
    if (!account) {
      throw new Error('ACCOUNT_NOT_FOUND: No registered operator found with this email. Please register first.');
    }

    if (account.passwordHash && account.passwordHash !== inputHash) {
      throw new Error('INVALID_CREDENTIALS: Password does not match operator database record.');
    }

    account.lastLoginAt = Date.now();
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

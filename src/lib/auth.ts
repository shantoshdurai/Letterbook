// On-device accounts. Letterbook has no server yet, so accounts, passwords and
// reading data all live in this browser/app install. Passwords are never stored
// in plain text: we keep a random salt and a PBKDF2-SHA256 hash.
import { readJSON, writeJSON, storageKey, keysWithPrefix, removeKey } from './storage';

export interface Account {
  id: string;
  name: string;
  handle: string; // always starts with @
  email: string;
  salt: string;
  hash: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  name: string;
  handle: string;
  isGuest: boolean;
}

const ACCOUNTS_KEY = storageKey('accounts');
const SESSION_KEY = storageKey('session');
export const GUEST_ID = 'guest';

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomId(bytes = 12) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return toHex(a.buffer);
}

async function hashPassword(password: string, salt: string) {
  if (!crypto?.subtle) throw new Error('Secure storage is unavailable in this browser.');
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 120_000 },
    key,
    256,
  );
  return toHex(bits);
}

export function normalizeHandle(raw: string) {
  const clean = raw.trim().replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_.]/g, '');
  return clean ? `@${clean}` : '';
}

export function listAccounts(): Account[] {
  return readJSON<Account[]>(ACCOUNTS_KEY, []);
}

export function loadSession(): Session | null {
  return readJSON<Session | null>(SESSION_KEY, null);
}

export function saveSession(session: Session | null) {
  if (session) writeJSON(SESSION_KEY, session);
  else removeKey(SESSION_KEY);
}

export function guestSession(): Session {
  return { userId: GUEST_ID, name: 'Guest Reader', handle: '@guest', isGuest: true };
}

export interface SignUpInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export function validateSignUp(input: SignUpInput): string | null {
  if (!input.name.trim()) return 'Please enter your name.';
  const handle = normalizeHandle(input.username);
  if (handle.length < 4) return 'Username needs at least 3 letters or numbers.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return 'Please enter a valid email address.';
  if (input.password.length < 8) return 'Password must be at least 8 characters.';
  const accounts = listAccounts();
  if (accounts.some((a) => a.handle === handle)) return `${handle} is already taken on this device.`;
  if (accounts.some((a) => a.email.toLowerCase() === input.email.trim().toLowerCase())) {
    return 'An account with that email already exists. Sign in instead.';
  }
  return null;
}

export async function signUp(input: SignUpInput): Promise<Session> {
  const error = validateSignUp(input);
  if (error) throw new Error(error);
  const salt = randomId(16);
  const account: Account = {
    id: `u_${randomId(8)}`,
    name: input.name.trim(),
    handle: normalizeHandle(input.username),
    email: input.email.trim().toLowerCase(),
    salt,
    hash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  };
  writeJSON(ACCOUNTS_KEY, [...listAccounts(), account]);
  return { userId: account.id, name: account.name, handle: account.handle, isGuest: false };
}

export async function signIn(identifier: string, password: string): Promise<Session> {
  const id = identifier.trim().toLowerCase();
  const handle = normalizeHandle(id);
  const account = listAccounts().find((a) => a.email === id || a.handle === handle);
  if (!account) throw new Error('No account found with that username or email on this device.');
  const hash = await hashPassword(password, account.salt);
  if (hash !== account.hash) throw new Error('Incorrect password.');
  return { userId: account.id, name: account.name, handle: account.handle, isGuest: false };
}

export function updateAccountIdentity(userId: string, name: string, handle: string): string | null {
  const accounts = listAccounts();
  const normalized = normalizeHandle(handle);
  if (normalized.length < 4) return 'Username needs at least 3 letters or numbers.';
  if (accounts.some((a) => a.id !== userId && a.handle === normalized)) return `${normalized} is already taken on this device.`;
  const next = accounts.map((a) => (a.id === userId ? { ...a, name: name.trim() || a.name, handle: normalized } : a));
  writeJSON(ACCOUNTS_KEY, next);
  return null;
}

// Removes the account and every piece of data stored for it.
export function deleteAccountData(userId: string) {
  keysWithPrefix(storageKey('u', userId, '')).forEach(removeKey);
  if (userId !== GUEST_ID) {
    writeJSON(ACCOUNTS_KEY, listAccounts().filter((a) => a.id !== userId));
  }
}

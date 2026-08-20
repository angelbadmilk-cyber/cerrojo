export type EntryType = 'password' | 'document';
export type Category = 'social' | 'work' | 'finance' | 'personal' | 'streaming' | 'other';
export type ViewMode = 'list' | 'grid';
export type ThemeMode = 'light' | 'dark' | 'system';
export type Seccion = 'boveda' | 'auditoria' | 'nube' | 'ajustes';

export interface PasswordEntry {
  id: string;
  type: EntryType;
  siteName: string;
  username: string;
  password: string;
  url?: string;
  totpSecret?: string;
  category: Category;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  attachment?: string;
  fileName?: string;
  fileType?: string;
  favorite?: boolean;
}

export interface EncryptedStorage {
  salt: string;
  iv: string;
  encryptedVault: string;
  wrappedKey: string;
  recoverySalt: string;
  recoveryIv: string;
  recoveryWrappedKey: string;
  recoveryQuestion: string;
  verifier: string;
}

export interface AppSettings {
  themeMode: ThemeMode;
  themeColor: string;
  autoLockTimeout: number;
  biometricsEnabled: boolean;
  viewMode: ViewMode;
  faviconsEnabled: boolean;
}

export interface SecurityAudit {
  total: number;
  weak: number;
  reused: number;
  old: number;
  score: number;
}
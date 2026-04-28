import Logger from './logger';

export enum SecurityEventType {
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RECOVERY_REQUESTED = 'PASSWORD_RECOVERY_REQUESTED',
  PASSWORD_RECOVERY_COMPLETED = 'PASSWORD_RECOVERY_COMPLETED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export interface SecurityLogEntry {
  timestamp: string;        // ISO 8601
  event: SecurityEventType;
  username?: string;
  ip?: string;
  result: 'SUCCESS' | 'FAILURE';
  details?: string;
}

export default class SecurityLogger {
  private logger = new Logger();

  /**
   * Registra un evento de seguridad en data/logs/security.log
   * Cada entrada se escribe como una línea JSON.
   */
  public log(entry: SecurityLogEntry): void {
    const fullEntry: SecurityLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.writeLog('security', JSON.stringify(fullEntry));
    } catch (error) {
      console.error('SecurityLogger: error al escribir entrada de seguridad', error);
    }
  }
}

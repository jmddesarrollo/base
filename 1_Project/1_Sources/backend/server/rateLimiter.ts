import { Socket } from 'socket.io';
import SecurityLogger, { SecurityEventType } from '../utils/securityLogger';

interface WindowEntry {
  count: number;
  windowStart: number;
}

/**
 * RateLimiter — Middleware de Socket.IO para limitar la tasa de eventos por socket.
 *
 * Mantiene contadores en memoria por socketId.
 * Soporta un límite general y un límite específico más restrictivo para auth/login.
 *
 * Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export class RateLimiter {
  // Contadores generales: socketId → { count, windowStart }
  private generalWindows: Map<string, WindowEntry> = new Map();
  // Contadores específicos para auth/login: socketId → { count, windowStart }
  private loginWindows: Map<string, WindowEntry> = new Map();

  private readonly maxEvents: number;
  private readonly windowMs: number;
  private readonly loginMax: number;
  private readonly loginWindowMs: number;

  private securityLogger: SecurityLogger;

  constructor() {
    this.maxEvents = parseInt(process.env.APP_RATE_LIMIT_MAX_EVENTS || '200', 10);
    this.windowMs = parseInt(process.env.APP_RATE_LIMIT_WINDOW_MS || '60000', 10);
    this.loginMax = parseInt(process.env.APP_RATE_LIMIT_LOGIN_MAX || '10', 10);
    this.loginWindowMs = parseInt(process.env.APP_RATE_LIMIT_LOGIN_WINDOW_MS || '300000', 10);
    this.securityLogger = new SecurityLogger();
  }

  /**
   * Registra un evento para un socket y comprueba si está dentro del límite.
   *
   * @param socketId  Identificador del socket
   * @param eventName Nombre del evento WebSocket
   * @returns true si el evento está dentro del límite, false si lo supera
   */
  public checkLimit(socketId: string, eventName: string): boolean {
    const now = Date.now();

    // Comprobar límite específico de auth/login
    if (eventName === 'auth/login') {
      if (!this.isWithinWindow(this.loginWindows, socketId, now, this.loginMax, this.loginWindowMs)) {
        return false;
      }
    }

    // Comprobar límite general
    if (!this.isWithinWindow(this.generalWindows, socketId, now, this.maxEvents, this.windowMs)) {
      return false;
    }

    return true;
  }

  /**
   * Comprueba y actualiza el contador de una ventana de tiempo.
   * Retorna true si el evento está dentro del límite, false si lo supera.
   */
  private isWithinWindow(
    windows: Map<string, WindowEntry>,
    socketId: string,
    now: number,
    max: number,
    windowMs: number
  ): boolean {
    const entry = windows.get(socketId);

    if (!entry || now - entry.windowStart >= windowMs) {
      // Nueva ventana
      windows.set(socketId, { count: 1, windowStart: now });
      return true;
    }

    if (entry.count >= max) {
      return false;
    }

    entry.count += 1;
    return true;
  }

  /**
   * Limpia los contadores de un socket (al desconectarse).
   */
  public clearSocket(socketId: string): void {
    this.generalWindows.delete(socketId);
    this.loginWindows.delete(socketId);
  }

  /**
   * Middleware de Socket.IO.
   * Aplica rate limiting a todos los eventos entrantes del socket.
   *
   * Uso: this.io.use(rateLimiter.middleware.bind(rateLimiter))
   */
  public middleware(socket: Socket, next: Function): void {
    const ip = socket.handshake.address;

    // Interceptar todos los eventos del socket usando onAny
    socket.onAny((eventName: string) => {
      if (!this.checkLimit(socket.id, eventName)) {
        this.securityLogger.log({
          timestamp: new Date().toISOString(),
          event: SecurityEventType.RATE_LIMIT_EXCEEDED,
          ip,
          result: 'FAILURE',
          details: `Límite de tasa superado para el evento '${eventName}'`,
        });

        socket.emit('error_message', {
          message: 'Demasiadas peticiones. Inténtalo más tarde.',
          code: 429,
        });

        socket.disconnect(true);
      }
    });

    // Limpiar contadores al desconectar
    socket.on('disconnect', () => {
      this.clearSocket(socket.id);
    });

    next();
  }
}

export default RateLimiter;

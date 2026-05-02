import * as fc from 'fast-check';
import { RateLimiter } from '../../server/rateLimiter';

// ============================================================
// Feature: security-hardening
// Propiedad 2: El contador de rate limiting refleja fielmente los eventos recibidos
// Valida: Requisitos 2.1, 2.2
// ============================================================

describe('Propiedad 2 - El contador de rate limiting refleja fielmente los eventos recibidos', () => {

  it('permite exactamente maxEvents eventos dentro de la ventana de tiempo', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),  // maxEvents
        fc.string({ minLength: 1, maxLength: 20 }), // socketId
        (maxEvents, socketId) => {
          process.env.APP_RATE_LIMIT_MAX_EVENTS = String(maxEvents);
          process.env.APP_RATE_LIMIT_WINDOW_MS = '60000';
          process.env.APP_RATE_LIMIT_LOGIN_MAX = String(maxEvents + 10); // login limit higher so it doesn't interfere
          process.env.APP_RATE_LIMIT_LOGIN_WINDOW_MS = '300000';

          const limiter = new RateLimiter();
          const event = 'user/getUsers'; // non-login event

          // First maxEvents calls should all be allowed
          for (let i = 0; i < maxEvents; i++) {
            if (!limiter.checkLimit(socketId, event)) return false;
          }

          // The (maxEvents + 1)th call should be rejected
          return limiter.checkLimit(socketId, event) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('reinicia el contador cuando la ventana de tiempo expira', () => {
    // Use a very short window so we can test expiry
    process.env.APP_RATE_LIMIT_MAX_EVENTS = '3';
    process.env.APP_RATE_LIMIT_WINDOW_MS = '1'; // 1ms window — expires immediately
    process.env.APP_RATE_LIMIT_LOGIN_MAX = '100';
    process.env.APP_RATE_LIMIT_LOGIN_WINDOW_MS = '300000';

    const limiter = new RateLimiter();
    const socketId = 'test-socket-expiry';
    const event = 'user/getUsers';

    // Exhaust the limit
    limiter.checkLimit(socketId, event);
    limiter.checkLimit(socketId, event);
    limiter.checkLimit(socketId, event);
    expect(limiter.checkLimit(socketId, event)).toBe(false);

    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // After window expiry, should be allowed again
        expect(limiter.checkLimit(socketId, event)).toBe(true);
        resolve();
      }, 10);
    });
  });

  it('contadores son independientes por socketId', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 20 }),
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 15 }), { minLength: 2, maxLength: 5 }),
        (maxEvents, socketIds) => {
          process.env.APP_RATE_LIMIT_MAX_EVENTS = String(maxEvents);
          process.env.APP_RATE_LIMIT_WINDOW_MS = '60000';
          process.env.APP_RATE_LIMIT_LOGIN_MAX = String(maxEvents + 10);
          process.env.APP_RATE_LIMIT_LOGIN_WINDOW_MS = '300000';

          const limiter = new RateLimiter();
          const event = 'user/getUsers';

          // Exhaust the limit for the first socket
          for (let i = 0; i < maxEvents; i++) {
            limiter.checkLimit(socketIds[0], event);
          }
          // First socket should now be blocked
          if (limiter.checkLimit(socketIds[0], event) !== false) return false;

          // Other sockets should still be allowed (their counters are independent)
          for (let i = 1; i < socketIds.length; i++) {
            if (!limiter.checkLimit(socketIds[i], event)) return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('clearSocket reinicia el contador permitiendo eventos de nuevo', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.string({ minLength: 1, maxLength: 15 }),
        (maxEvents, socketId) => {
          process.env.APP_RATE_LIMIT_MAX_EVENTS = String(maxEvents);
          process.env.APP_RATE_LIMIT_WINDOW_MS = '60000';
          process.env.APP_RATE_LIMIT_LOGIN_MAX = String(maxEvents + 10);
          process.env.APP_RATE_LIMIT_LOGIN_WINDOW_MS = '300000';

          const limiter = new RateLimiter();
          const event = 'user/getUsers';

          // Exhaust the limit
          for (let i = 0; i < maxEvents; i++) {
            limiter.checkLimit(socketId, event);
          }
          if (limiter.checkLimit(socketId, event) !== false) return false;

          // Clear and verify it's allowed again
          limiter.clearSocket(socketId);
          return limiter.checkLimit(socketId, event) === true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Feature: security-hardening
// Propiedad 3: El límite de login es siempre más restrictivo que el límite general
// Valida: Requisito 2.3
// ============================================================

describe('Propiedad 3 - El límite de login es siempre más restrictivo que el límite general', () => {

  it('auth/login se bloquea antes que eventos generales cuando loginMax < maxEvents', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),   // loginMax
        fc.integer({ min: 1, max: 50 }),   // extra events above loginMax for general
        fc.string({ minLength: 1, maxLength: 15 }),
        (loginMax, extra, socketId) => {
          const maxEvents = loginMax + extra; // general limit is always higher
          process.env.APP_RATE_LIMIT_MAX_EVENTS = String(maxEvents);
          process.env.APP_RATE_LIMIT_WINDOW_MS = '60000';
          process.env.APP_RATE_LIMIT_LOGIN_MAX = String(loginMax);
          process.env.APP_RATE_LIMIT_LOGIN_WINDOW_MS = '60000'; // same window for fair comparison

          const limiter = new RateLimiter();

          // Send exactly loginMax login events — all should be allowed
          for (let i = 0; i < loginMax; i++) {
            if (!limiter.checkLimit(socketId, 'auth/login')) return false;
          }

          // The next login event should be blocked (login limit reached)
          return limiter.checkLimit(socketId, 'auth/login') === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('general events are still allowed after login limit is exhausted', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),   // loginMax
        fc.integer({ min: 1, max: 20 }),   // extra above loginMax
        fc.string({ minLength: 1, maxLength: 15 }),
        (loginMax, extra, socketId) => {
          const maxEvents = loginMax + extra + 50; // general limit well above login limit
          process.env.APP_RATE_LIMIT_MAX_EVENTS = String(maxEvents);
          process.env.APP_RATE_LIMIT_WINDOW_MS = '60000';
          process.env.APP_RATE_LIMIT_LOGIN_MAX = String(loginMax);
          process.env.APP_RATE_LIMIT_LOGIN_WINDOW_MS = '60000';

          const limiter = new RateLimiter();

          // Exhaust login limit
          for (let i = 0; i < loginMax; i++) {
            limiter.checkLimit(socketId, 'auth/login');
          }
          // Login is now blocked
          if (limiter.checkLimit(socketId, 'auth/login') !== false) return false;

          // But a non-login event should still be allowed (general counter not exhausted)
          return limiter.checkLimit(socketId, 'user/getUsers') === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('default login limit (10) is less than default general limit (200)', () => {
    // Reset to defaults
    delete process.env.APP_RATE_LIMIT_MAX_EVENTS;
    delete process.env.APP_RATE_LIMIT_WINDOW_MS;
    delete process.env.APP_RATE_LIMIT_LOGIN_MAX;
    delete process.env.APP_RATE_LIMIT_LOGIN_WINDOW_MS;

    const limiter = new RateLimiter();
    const socketId = 'default-limits-test';

    // Default loginMax is 10 — exhaust it
    for (let i = 0; i < 10; i++) {
      expect(limiter.checkLimit(socketId, 'auth/login')).toBe(true);
    }
    // 11th login should be blocked
    expect(limiter.checkLimit(socketId, 'auth/login')).toBe(false);

    // But general events (counted separately) should still be allowed
    // (only 10 events counted so far against general limit of 200)
    expect(limiter.checkLimit(socketId, 'user/getUsers')).toBe(true);
  });
});

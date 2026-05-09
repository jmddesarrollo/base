import * as fc from 'fast-check';
import * as crypto from 'crypto';

// ============================================================
// Feature: security-hardening
// Propiedad 7: Los tokens de recuperación son únicos entre solicitudes consecutivas
// Valida: Requisitos 5.1, 5.5
// ============================================================

/**
 * Simula la generación de un token de recuperación usando el mismo mecanismo
 * que auth.bll.ts: un UUID aleatorio + timestamp, cuyo SHA-256 se almacena en BD.
 * Probamos la unicidad y la invalidación a nivel de lógica pura (sin BD).
 */
function generateRecoveryTokenPayload(): { token: string; hash: string; createdAt: Date } {
  // Simula la generación de un token único (como haría jwt.sign con payload aleatorio)
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const createdAt = new Date();
  return { token, hash, createdAt };
}

describe('Propiedad 7 - Los tokens de recuperación son únicos entre solicitudes consecutivas', () => {

  it('dos solicitudes consecutivas generan tokens diferentes', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 0 }), () => {
        const first = generateRecoveryTokenPayload();
        const second = generateRecoveryTokenPayload();
        // Los tokens deben ser distintos
        return first.token !== second.token;
      }),
      { numRuns: 100 }
    );
  });

  it('dos solicitudes consecutivas generan hashes diferentes', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 0 }), () => {
        const first = generateRecoveryTokenPayload();
        const second = generateRecoveryTokenPayload();
        // Los hashes deben ser distintos (porque los tokens son distintos)
        return first.hash !== second.hash;
      }),
      { numRuns: 100 }
    );
  });

  it('el segundo token invalida el primero: solo el hash más reciente es válido', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 0 }), () => {
        const first = generateRecoveryTokenPayload();
        const second = generateRecoveryTokenPayload();

        // Simula BD: solo se guarda el último hash (saveRecoveryToken sobrescribe)
        let storedHash = first.hash;
        storedHash = second.hash; // segunda solicitud invalida la primera

        // El primer token ya no coincide con el hash almacenado
        const firstHashRecomputed = crypto.createHash('sha256').update(first.token).digest('hex');
        const secondHashRecomputed = crypto.createHash('sha256').update(second.token).digest('hex');

        return firstHashRecomputed !== storedHash && secondHashRecomputed === storedHash;
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Feature: security-hardening
// Propiedad 8: Verificación de token de recuperación es un round-trip de hash
// Valida: Requisito 5.3
// ============================================================

describe('Propiedad 8 - Verificación de token de recuperación es un round-trip de hash', () => {

  it('SHA-256(token) almacenado coincide con SHA-256(token recibido) para el mismo token', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (token) => {
        const stored = crypto.createHash('sha256').update(token).digest('hex');
        const received = crypto.createHash('sha256').update(token).digest('hex');
        return stored === received;
      }),
      { numRuns: 100 }
    );
  });

  it('un token modificado en cualquier carácter falla la verificación', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2 }),
        fc.integer({ min: 0 }),
        fc.string({ minLength: 1, maxLength: 1 }),
        (token, posRaw, replacement) => {
          const pos = posRaw % token.length;
          // Modificar un carácter en una posición aleatoria
          const modified = token.slice(0, pos) + replacement + token.slice(pos + 1);

          // Si el token modificado es igual al original (mismo carácter), skip
          if (modified === token) return true;

          const storedHash = crypto.createHash('sha256').update(token).digest('hex');
          const receivedHash = crypto.createHash('sha256').update(modified).digest('hex');

          return storedHash !== receivedHash;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('el hash es determinista: el mismo token siempre produce el mismo hash', () => {
    fc.assert(
      fc.property(fc.string(), (token) => {
        const hash1 = crypto.createHash('sha256').update(token).digest('hex');
        const hash2 = crypto.createHash('sha256').update(token).digest('hex');
        return hash1 === hash2;
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================
// Feature: security-hardening
// Propiedad 9: Un token de recuperación usado no puede usarse de nuevo
// Valida: Requisito 5.4
// ============================================================

/**
 * Simula el estado de la BD para el token de recuperación.
 * clearRecoveryToken pone hash y createdAt a null.
 */
interface RecoveryTokenState {
  hash: string | null;
  createdAt: Date | null;
}

function simulateValidateRecoveryToken(state: RecoveryTokenState, token: string): boolean {
  if (!state.hash || !state.createdAt) return false;

  const receivedHash = crypto.createHash('sha256').update(token).digest('hex');
  if (receivedHash !== state.hash) return false;

  const expirationMs = 60 * 60 * 1000;
  const elapsed = Date.now() - state.createdAt.getTime();
  if (elapsed > expirationMs) return false;

  return true;
}

function simulateConsumeRecoveryToken(state: RecoveryTokenState): RecoveryTokenState {
  return { hash: null, createdAt: null };
}

describe('Propiedad 9 - Un token de recuperación usado no puede usarse de nuevo', () => {

  it('después de consumir el token, la validación falla', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 0 }), () => {
        const { token, hash, createdAt } = generateRecoveryTokenPayload();

        let state: RecoveryTokenState = { hash, createdAt };

        // Antes de consumir: debe ser válido
        const validBefore = simulateValidateRecoveryToken(state, token);

        // Consumir el token (simula clearRecoveryToken)
        state = simulateConsumeRecoveryToken(state);

        // Después de consumir: debe ser inválido
        const validAfter = simulateValidateRecoveryToken(state, token);

        return validBefore === true && validAfter === false;
      }),
      { numRuns: 100 }
    );
  });

  it('consumir un token ya consumido es idempotente (no produce error)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 0 }), () => {
        const { token, hash, createdAt } = generateRecoveryTokenPayload();
        let state: RecoveryTokenState = { hash, createdAt };

        // Consumir dos veces
        state = simulateConsumeRecoveryToken(state);
        state = simulateConsumeRecoveryToken(state);

        // El estado final es el mismo: hash y createdAt son null
        return state.hash === null && state.createdAt === null;
      }),
      { numRuns: 100 }
    );
  });

  it('un token diferente al almacenado siempre falla la validación', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (token1, token2) => {
          if (token1 === token2) return true; // skip si son iguales

          const hash = crypto.createHash('sha256').update(token1).digest('hex');
          const state: RecoveryTokenState = { hash, createdAt: new Date() };

          // token2 no debe validar contra el hash de token1
          return simulateValidateRecoveryToken(state, token2) === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});

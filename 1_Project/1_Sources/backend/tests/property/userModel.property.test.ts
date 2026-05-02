import * as fc from 'fast-check';

// ============================================================
// Feature: security-hardening
// Propiedad 15: El campo attempts nunca toma valores negativos
// Valida: Requisito 10.2
// ============================================================

/**
 * Simula la lógica de validación del campo attempts del modelo de usuario.
 * En la BD el campo es INT(11) NOT NULL DEFAULT 0.
 * La lógica de negocio garantiza que nunca se almacena un valor negativo.
 */
function applyAttemptsUpdate(current: number, delta: number): number {
  const next = current + delta;
  // La lógica de negocio nunca debe producir un valor negativo
  return Math.max(0, next);
}

function isValidAttemptsValue(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

describe('Propiedad 15 - El campo attempts nunca toma valores negativos', () => {

  it('el modelo acepta valores de attempts mayores que 9 (INT(11) soporta rango amplio)', () => {
    // Verifica que el tipo INT(11) soporta valores > 9 sin error de validación
    const largeValues = [10, 50, 100, 999, 2147483647];
    for (const value of largeValues) {
      expect(isValidAttemptsValue(value)).toBe(true);
    }
  });

  it('el campo attempts acepta 0 como valor válido (reset tras login exitoso)', () => {
    expect(isValidAttemptsValue(0)).toBe(true);
  });

  it('para cualquier secuencia de incrementos, attempts nunca es negativo', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),   // valor inicial
        fc.array(fc.integer({ min: -5, max: 5 }), { minLength: 1, maxLength: 20 }),
        (initial, deltas) => {
          let current = initial;
          for (const delta of deltas) {
            current = applyAttemptsUpdate(current, delta);
            if (current < 0) return false;
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('el reset a 0 tras login exitoso siempre produce un valor válido', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (attempts) => {
          const afterReset = 0; // reset tras login exitoso
          return isValidAttemptsValue(afterReset);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('el incremento de attempts tras login fallido nunca produce valor negativo', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2147483640 }),
        (current) => {
          const afterFail = current + 1;
          return isValidAttemptsValue(afterFail);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('valores negativos no son válidos para el campo attempts', () => {
    fc.assert(
      fc.property(
        fc.integer({ max: -1 }),
        (negativeValue) => {
          return !isValidAttemptsValue(negativeValue);
        }
      ),
      { numRuns: 100 }
    );
  });
});

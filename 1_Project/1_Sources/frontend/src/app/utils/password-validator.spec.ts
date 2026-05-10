import * as fc from 'fast-check';
import { PASSWORD_REGEX, validatePassword } from './password-validator';

describe('Propiedad 11 - Validación de contraseña frontend equivalente al backend', () => {

  it('validar con regex debe dar resultado equivalente a validatePassword', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        const regexResult = PASSWORD_REGEX.test(password);
        const validationResult = validatePassword(password);

        expect(validationResult.valid).toBe(regexResult);
      }),
      { numRuns: 200 }
    );
  });

  it('contraseñas válidas según regex deben pasar validatePassword', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 6, maxLength: 15 }), (password) => {
        if (PASSWORD_REGEX.test(password)) {
          const result = validatePassword(password);
          expect(result.valid).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('contraseñas sin número deben fallar validación', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 6, maxLength: 15 }), (password) => {
        if (!/[0-9]/.test(password) && PASSWORD_REGEX.test(password) === false) {
          const result = validatePassword(password);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.includes('número'))).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('contraseñas sin mayúscula deben fallar validación', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 6, maxLength: 15 }), (password) => {
        if (!/[A-ZÑ]/.test(password) && PASSWORD_REGEX.test(password) === false) {
          const result = validatePassword(password);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.includes('mayúscula'))).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('contraseñas sin minúscula deben fallar validación', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 6, maxLength: 15 }), (password) => {
        if (!/[a-zñ]/.test(password) && PASSWORD_REGEX.test(password) === false) {
          const result = validatePassword(password);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.includes('minúscula'))).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('contraseñas sin carácter especial deben fallar validación', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 6, maxLength: 15 }), (password) => {
        if (!/[$€#%&_-]/.test(password) && PASSWORD_REGEX.test(password) === false) {
          const result = validatePassword(password);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.includes('carácter especial'))).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('contraseñas fuera de rango de longitud deben fallar', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ maxLength: 5 }),
          fc.string({ minLength: 16 })
        ),
        (password) => {
          const result = validatePassword(password);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.includes('6 y 15'))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('contraseñas con espacios en blanco deben fallar', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 6, maxLength: 15 }), (password) => {
        if (/\s/.test(password)) {
          const result = validatePassword(password);
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.includes('espacios'))).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});
import * as fc from 'fast-check';
import { InputSanitizer } from '../../utils/inputSanitizer';
import ControlException from '../../utils/controlException';

// Caracteres HTML peligrosos en su forma literal (sin escapar)
const HTML_LITERAL_CHARS = ['<', '>', '"', "'"];
// Entidades HTML escapadas que NO deben aparecer como literales en el output
const HTML_ENTITIES_RAW = ['&lt;', '&gt;', '&quot;', '&#x27;'];

// ============================================================
// Feature: security-hardening
// Propiedad 13: El InputSanitizer escapa todos los caracteres HTML peligrosos
// Valida: Requisito 9.1
// ============================================================

describe('Propiedad 13 - sanitizeString escapa caracteres HTML peligrosos', () => {

  it('el resultado no contiene < > " \' como caracteres literales sin escapar', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = InputSanitizer.sanitizeString(input);
        for (const char of HTML_LITERAL_CHARS) {
          if (result.includes(char)) return false;
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('el & solo aparece como inicio de entidad HTML válida (&amp; &lt; &gt; &quot; &#x27;)', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = InputSanitizer.sanitizeString(input);
        // Reemplazar todas las entidades válidas y verificar que no queda ningún &
        const withoutEntities = result
          .replace(/&amp;/g, '')
          .replace(/&lt;/g, '')
          .replace(/&gt;/g, '')
          .replace(/&quot;/g, '')
          .replace(/&#x27;/g, '');
        return !withoutEntities.includes('&');
      }),
      { numRuns: 100 }
    );
  });

  it('sanitizeString es idempotente: aplicarla dos veces produce el mismo resultado que una', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const once = InputSanitizer.sanitizeString(input);
        const twice = InputSanitizer.sanitizeString(once);
        return once === twice;
      }),
      { numRuns: 100 }
    );
  });

  it('escapa correctamente cada carácter HTML peligroso individualmente', () => {
    const cases: [string, string][] = [
      ['<', '&lt;'],
      ['>', '&gt;'],
      ['"', '&quot;'],
      ["'", '&#x27;'],
      ['&', '&amp;'],
    ];
    for (const [input, expected] of cases) {
      expect(InputSanitizer.sanitizeString(input)).toBe(expected);
    }
  });

  it('strings sin caracteres HTML no se modifican', () => {
    fc.assert(
      fc.property(
        fc.string().map(s => s.replace(/[<>"'&]/g, 'x')),
        (input) => {
          const result = InputSanitizer.sanitizeString(input);
          return result === input;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('entidades ya escapadas no se re-escapan (idempotencia con entidades)', () => {
    const alreadyEscaped = ['&lt;', '&gt;', '&quot;', '&#x27;', '&amp;'];
    for (const entity of alreadyEscaped) {
      const once = InputSanitizer.sanitizeString(entity);
      const twice = InputSanitizer.sanitizeString(once);
      expect(once).toBe(twice);
    }
  });
});

// ============================================================
// Feature: security-hardening
// Propiedad 14: El InputSanitizer hace cumplir los límites de longitud y tipos
// Valida: Requisitos 9.2, 9.3, 9.4
// ============================================================

describe('Propiedad 14 - sanitizeString respeta maxLength', () => {

  it('el resultado tiene longitud <= maxLength para cualquier input y maxLength positivo', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer({ min: 1, max: 200 }),
        (input, maxLength) => {
          const result = InputSanitizer.sanitizeString(input, maxLength);
          return result.length <= maxLength;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('sin maxLength, devuelve siempre un string', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = InputSanitizer.sanitizeString(input);
        return typeof result === 'string';
      }),
      { numRuns: 100 }
    );
  });
});

describe('Propiedad 14 - validatePositiveInt lanza ControlException para valores no válidos', () => {

  it('lanza ControlException con código 400 para enteros negativos o cero', () => {
    fc.assert(
      fc.property(fc.integer({ max: 0 }), (value) => {
        try {
          InputSanitizer.validatePositiveInt(value, 'campo');
          return false;
        } catch (e) {
          return e instanceof ControlException && (e as ControlException).code === 400;
        }
      }),
      { numRuns: 100 }
    );
  });

  it('lanza ControlException con código 400 para strings no numéricos', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => isNaN(Number(s))),
        (value) => {
          try {
            InputSanitizer.validatePositiveInt(value, 'campo');
            return false;
          } catch (e) {
            return e instanceof ControlException && (e as ControlException).code === 400;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('acepta enteros positivos y devuelve el número', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100000 }), (value) => {
        const result = InputSanitizer.validatePositiveInt(value, 'campo');
        return result === value;
      }),
      { numRuns: 100 }
    );
  });
});

describe('Propiedad 14 - requireField lanza ControlException para campos vacíos/nulos', () => {

  it('lanza ControlException con código 400 para null, undefined y cadena vacía', () => {
    const emptyValues: any[] = [null, undefined, ''];
    for (const value of emptyValues) {
      expect(() => InputSanitizer.requireField(value, 'campo')).toThrow(ControlException);
      try {
        InputSanitizer.requireField(value, 'campo');
      } catch (e) {
        expect((e as ControlException).code).toBe(400);
      }
    }
  });

  it('lanza ControlException con código 400 para cualquier valor vacío (property)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<any>(null, undefined, ''),
        (value) => {
          try {
            InputSanitizer.requireField(value, 'campo');
            return false;
          } catch (e) {
            return e instanceof ControlException && (e as ControlException).code === 400;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('no lanza excepción para strings no vacíos', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (value) => {
        try {
          InputSanitizer.requireField(value, 'campo');
          return true;
        } catch {
          return false;
        }
      }),
      { numRuns: 100 }
    );
  });

  it('no lanza excepción para números y booleanos', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.integer(), fc.boolean()),
        (value) => {
          try {
            InputSanitizer.requireField(value, 'campo');
            return true;
          } catch {
            return false;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

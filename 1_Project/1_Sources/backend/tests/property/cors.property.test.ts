import * as fc from 'fast-check';
import { parseCorsOrigins } from '../../server/server';

// ============================================================
// Feature: security-hardening
// Propiedad 1: Validación de CORS es exhaustiva y correcta
// Valida: Requisitos 1.1, 1.2
// ============================================================

// Generador de URLs de origen válidas
const originArb = fc.oneof(
    fc.constant('http://localhost:4200'),
    fc.constant('https://example.com'),
    fc.constant('http://192.168.1.1:3000'),
    fc.string({ minLength: 3, maxLength: 15 })
        .map((s: string) => `https://${s.replace(/[^a-z0-9]/gi, 'x')}.com`)
);

describe('Propiedad 1 - parseCorsOrigins: validación exhaustiva y correcta', () => {

    it('lanza Error en producción cuando APP_CORS_ORIGINS no está definida', () => {
        expect(() => parseCorsOrigins(undefined, 'production')).toThrow(Error);
        expect(() => parseCorsOrigins('', 'production')).toThrow(Error);
        expect(() => parseCorsOrigins('   ', 'production')).toThrow(Error);
    });

    it('no lanza Error en desarrollo cuando APP_CORS_ORIGINS no está definida', () => {
        expect(() => parseCorsOrigins(undefined, 'development')).not.toThrow();
        expect(() => parseCorsOrigins('', 'development')).not.toThrow();
    });

    it('devuelve localhost:4200 por defecto en desarrollo sin APP_CORS_ORIGINS', () => {
        const result = parseCorsOrigins(undefined, 'development');
        expect(result).toContain('http://localhost:4200');
    });

    it('un origen incluido en APP_CORS_ORIGINS siempre aparece en el resultado', () => {
        // Propiedad: para cualquier lista de orígenes, cada origen de la lista
        // debe estar presente en el array devuelto
        fc.assert(
            fc.property(
                fc.array(originArb, { minLength: 1, maxLength: 5 }),
                (origins) => {
                    const originsStr = origins.join(',');
                    const result = parseCorsOrigins(originsStr, 'production');
                    return origins.every(o => result.includes(o));
                }
            ),
            { numRuns: 100 }
        );
    });

    it('un origen NO incluido en APP_CORS_ORIGINS nunca aparece en el resultado', () => {
        fc.assert(
            fc.property(
                fc.array(originArb, { minLength: 1, maxLength: 5 }),
                fc.string({ minLength: 5, maxLength: 30 }).map(s => `https://notallowed-${s}.com`),
                (allowedOrigins, forbiddenOrigin) => {
                    // Asegurar que el origen prohibido no está en la lista permitida
                    const cleanAllowed = allowedOrigins.filter(o => o !== forbiddenOrigin);
                    if (cleanAllowed.length === 0) return true; // skip si la lista queda vacía

                    const originsStr = cleanAllowed.join(',');
                    const result = parseCorsOrigins(originsStr, 'production');
                    return !result.includes(forbiddenOrigin);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('el resultado nunca contiene strings vacíos aunque haya comas extra', () => {
        fc.assert(
            fc.property(
                fc.array(originArb, { minLength: 1, maxLength: 5 }),
                (origins) => {
                    // Añadir comas extra y espacios
                    const originsStr = origins.join(',,') + ',';
                    const result = parseCorsOrigins(originsStr, 'production');
                    return result.every(o => o.length > 0);
                }
            ),
            { numRuns: 100 }
        );
    });

    it('los orígenes se recortan de espacios en blanco', () => {
        const originsWithSpaces = '  http://localhost:4200  ,  https://example.com  ';
        const result = parseCorsOrigins(originsWithSpaces, 'production');
        expect(result).toContain('http://localhost:4200');
        expect(result).toContain('https://example.com');
        expect(result.every(o => o === o.trim())).toBe(true);
    });

    it('un único origen produce un array de un elemento', () => {
        fc.assert(
            fc.property(originArb, (origin) => {
                const result = parseCorsOrigins(origin, 'production');
                return result.length === 1 && result[0] === origin;
            }),
            { numRuns: 100 }
        );
    });

    it('N orígenes distintos producen exactamente N elementos en el resultado', () => {
        fc.assert(
            fc.property(
                fc.uniqueArray(originArb, { minLength: 1, maxLength: 5 }),
                (origins) => {
                    const originsStr = origins.join(',');
                    const result = parseCorsOrigins(originsStr, 'production');
                    return result.length === origins.length;
                }
            ),
            { numRuns: 100 }
        );
    });
});

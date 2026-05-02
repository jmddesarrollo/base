import * as fc from 'fast-check';
import { validateAppSeed } from '../../server/server';

// ============================================================
// Feature: security-hardening
// Propiedad 10: La validación de APP_SEED rechaza cualquier secreto débil en producción
// Valida: Requisitos 6.1, 6.2, 6.3
// ============================================================

/** Comprueba si un seed cumple todos los requisitos de fortaleza */
function isStrongSeed(seed: string): boolean {
    return (
        seed.length >= 32 &&
        /[a-zA-Z]/.test(seed) &&
        /[0-9]/.test(seed) &&
        /[^a-zA-Z0-9]/.test(seed)
    );
}

describe('Propiedad 10 - validateAppSeed rechaza secretos débiles en producción', () => {

    it('lanza Error para undefined en producción', () => {
        expect(() => validateAppSeed(undefined, 'production')).toThrow(Error);
    });

    it('lanza Error para cadena vacía en producción', () => {
        expect(() => validateAppSeed('', 'production')).toThrow(Error);
    });

    it('lanza Error para cualquier seed que no cumpla todos los requisitos en producción', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => !isStrongSeed(s)),
                (weakSeed) => {
                    try {
                        validateAppSeed(weakSeed, 'production');
                        return false; // No debe llegar aquí
                    } catch (e) {
                        return e instanceof Error;
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('acepta cualquier seed que cumpla todos los requisitos en producción', () => {
        // Generador de seeds fuertes: >= 32 chars, con letra, número y especial
        const strongSeedArb = fc.string({ minLength: 28, maxLength: 60 })
            .map(s => s + 'aA1!')  // garantiza letra, mayúscula, número y especial
            .filter(s => isStrongSeed(s));

        fc.assert(
            fc.property(strongSeedArb, (strongSeed) => {
                try {
                    validateAppSeed(strongSeed, 'production');
                    return true;
                } catch {
                    return false;
                }
            }),
            { numRuns: 100 }
        );
    });

    it('no lanza Error en desarrollo aunque el seed sea débil (solo warn)', () => {
        fc.assert(
            fc.property(
                fc.string({ maxLength: 10 }), // seeds cortos y débiles
                (weakSeed) => {
                    try {
                        validateAppSeed(weakSeed, 'development');
                        return true; // No debe lanzar
                    } catch {
                        return false;
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('no lanza Error en desarrollo para undefined (solo warn)', () => {
        expect(() => validateAppSeed(undefined, 'development')).not.toThrow();
    });

    it('la validación es determinista: el mismo seed produce siempre el mismo resultado', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 80 }),
                (seed) => {
                    let result1: boolean;
                    let result2: boolean;

                    try { validateAppSeed(seed, 'production'); result1 = true; }
                    catch { result1 = false; }

                    try { validateAppSeed(seed, 'production'); result2 = true; }
                    catch { result2 = false; }

                    return result1 === result2;
                }
            ),
            { numRuns: 100 }
        );
    });
});

describe('Validación de requisitos individuales de APP_SEED', () => {

    it('rechaza seeds con menos de 32 caracteres en producción', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 31 })
                    .map(s => {
                        // Asegurar que tiene letra, número y especial para aislar el fallo de longitud
                        return s.substring(0, Math.max(1, s.length - 3)) + 'aA1!';
                    })
                    .filter(s => s.length < 32),
                (shortSeed) => {
                    try {
                        validateAppSeed(shortSeed, 'production');
                        return false;
                    } catch (e) {
                        return e instanceof Error;
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    it('rechaza seeds sin letras en producción', () => {
        // Seed largo con números y especiales pero sin letras
        const noLettersSeed = '1234567890!@#$%^&*()_+1234567890!@#';
        expect(() => validateAppSeed(noLettersSeed, 'production')).toThrow(Error);
    });

    it('rechaza seeds sin números en producción', () => {
        const noNumbersSeed = 'abcdefghijklmnopqrstuvwxyz!@#$ABCDE';
        expect(() => validateAppSeed(noNumbersSeed, 'production')).toThrow(Error);
    });

    it('rechaza seeds sin caracteres especiales en producción', () => {
        const noSpecialSeed = 'abcdefghijklmnopqrstuvwxyz1234ABCDE';
        expect(() => validateAppSeed(noSpecialSeed, 'production')).toThrow(Error);
    });

    it('acepta un seed que cumple todos los requisitos exactamente en el límite (32 chars)', () => {
        // Exactamente 32 chars: 28 letras + 1 número + 1 especial + 2 más
        const borderSeed = 'abcdefghijklmnopqrstuvwxyz1!AB';  // 30 chars
        const validSeed32 = 'abcdefghijklmnopqrstuvwxyz1!ABCD'; // 32 chars
        expect(() => validateAppSeed(validSeed32, 'production')).not.toThrow();
    });
});

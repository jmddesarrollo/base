import * as fc from 'fast-check';
import AuthService from '../../services/user/auth.bll';

// ============================================================
// Feature: security-hardening
// Propiedad 4: El payload JWT contiene exactamente los campos mínimos requeridos
// Valida: Requisitos 3.1, 3.2
// ============================================================

const jwt = require('jsonwebtoken');

// Seed de prueba para firmar tokens en los tests
const TEST_SEED = 'test-seed-for-property-tests-only-not-production';

describe('Propiedad 4 - Payload JWT contiene exactamente los campos mínimos', () => {
    let authService: AuthService;

    beforeAll(() => {
        // Configurar APP_SEED para los tests
        process.env.APP_SEED = TEST_SEED;
        process.env.APP_EXPIRATION_TOKEN = '1h';
        process.env.APP_EXPIRATION_TOKEN_RECOVERY = '15m';
        authService = new AuthService();
    });

    it('buildMinimalPayload contiene exactamente id, username y role_id', () => {
        fc.assert(
            fc.property(
                fc.record({
                    id: fc.integer({ min: 1, max: 99999 }),
                    username: fc.string({ minLength: 1, maxLength: 45 }),
                    role_id: fc.integer({ min: 1, max: 100 }),
                    password: fc.string({ minLength: 6, maxLength: 100 }),
                    email: fc.emailAddress(),
                    attempts: fc.integer({ min: 0, max: 10 }),
                    active: fc.boolean(),
                }),
                (user) => {
                    const payload = authService.buildMinimalPayload(user);

                    // Debe contener los campos requeridos
                    const hasRequired =
                        payload.id === user.id &&
                        payload.username === user.username &&
                        payload.role_id === user.role_id;

                    // No debe contener campos sensibles
                    const noSensitive =
                        !('password' in payload) &&
                        !('email' in payload) &&
                        !('attempts' in payload) &&
                        !('active' in payload);

                    // Exactamente 3 campos
                    const exactFields = Object.keys(payload).length === 3;

                    return hasRequired && noSensitive && exactFields;
                }
            ),
            { numRuns: 100 }
        );
    });

    it('el token JWT generado no contiene campos sensibles en el payload', () => {
        fc.assert(
            fc.property(
                fc.record({
                    id: fc.integer({ min: 1, max: 99999 }),
                    username: fc.string({ minLength: 1, maxLength: 45 }),
                    role_id: fc.integer({ min: 1, max: 100 }),
                    password: fc.string({ minLength: 6, maxLength: 100 }),
                    email: fc.emailAddress(),
                    attempts: fc.integer({ min: 0, max: 10 }),
                    active: fc.boolean(),
                }),
                (user) => {
                    const payload = authService.buildMinimalPayload(user);
                    const token = jwt.sign({ user: payload }, TEST_SEED, { expiresIn: '1h' });
                    const decoded = jwt.decode(token) as any;

                    return (
                        decoded.user.id !== undefined &&
                        decoded.user.username !== undefined &&
                        decoded.user.role_id !== undefined &&
                        decoded.user.password === undefined &&
                        decoded.user.email === undefined &&
                        decoded.user.attempts === undefined &&
                        decoded.user.active === undefined
                    );
                }
            ),
            { numRuns: 100 }
        );
    });

    it('el payload mínimo preserva fielmente los valores de id, username y role_id', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 99999 }),
                fc.string({ minLength: 1, maxLength: 45 }),
                fc.integer({ min: 1, max: 100 }),
                (id, username, role_id) => {
                    const user = { id, username, role_id, password: 'secret', email: 'a@b.com', attempts: 0 };
                    const payload = authService.buildMinimalPayload(user);
                    return payload.id === id && payload.username === username && payload.role_id === role_id;
                }
            ),
            { numRuns: 100 }
        );
    });
});

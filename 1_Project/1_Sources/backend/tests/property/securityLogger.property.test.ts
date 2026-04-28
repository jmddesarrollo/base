import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import SecurityLogger, { SecurityEventType, SecurityLogEntry } from '../../utils/securityLogger';

// ============================================================
// Feature: security-hardening
// Propiedad 12: Cada entrada del SecurityLogger contiene todos los campos requeridos
// Valida: Requisitos 8.1, 8.8
// ============================================================

// Todos los valores válidos del enum SecurityEventType
const ALL_EVENT_TYPES = Object.values(SecurityEventType);

// Generador de entradas de seguridad válidas
const securityEntryArb = fc.record({
  event: fc.constantFrom(...ALL_EVENT_TYPES),
  result: fc.constantFrom<'SUCCESS' | 'FAILURE'>('SUCCESS', 'FAILURE'),
  username: fc.option(fc.string({ minLength: 1, maxLength: 45 }), { nil: undefined }),
  ip: fc.option(fc.string({ minLength: 7, maxLength: 45 }), { nil: undefined }),
  details: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
}) as fc.Arbitrary<Omit<SecurityLogEntry, 'timestamp'>>;

describe('Propiedad 12 - SecurityLogger genera entradas con todos los campos requeridos', () => {

  let logger: SecurityLogger;
  let logFilePath: string;

  beforeEach(() => {
    logger = new SecurityLogger();
    // Ruta al archivo de log generado por el Logger base
    logFilePath = path.join(__dirname, '../../data/logs/security.log');
  });

  afterEach(() => {
    // Limpiar el archivo de log tras cada test para no contaminar
    if (fs.existsSync(logFilePath)) {
      fs.unlinkSync(logFilePath);
    }
  });

  it('el timestamp generado es siempre una fecha ISO 8601 válida', () => {
    fc.assert(
      fc.property(securityEntryArb, (entry) => {
        const before = Date.now();
        logger.log(entry as SecurityLogEntry);
        const after = Date.now();

        const content = fs.readFileSync(logFilePath, 'utf8').trim();
        const lastLine = content.split('\n').pop() || '';
        // El logger base añade [timestamp] al inicio — extraemos el JSON
        const jsonMatch = lastLine.match(/\{.*\}$/);
        if (!jsonMatch) return false;

        const parsed: SecurityLogEntry = JSON.parse(jsonMatch[0]);
        const ts = new Date(parsed.timestamp).getTime();

        // El timestamp debe ser una fecha válida dentro del rango de ejecución del test
        return !isNaN(ts) && ts >= before && ts <= after;
      }),
      { numRuns: 100 }
    );
  });

  it('el campo event siempre es un valor válido de SecurityEventType', () => {
    fc.assert(
      fc.property(securityEntryArb, (entry) => {
        logger.log(entry as SecurityLogEntry);

        const content = fs.readFileSync(logFilePath, 'utf8').trim();
        const lastLine = content.split('\n').pop() || '';
        const jsonMatch = lastLine.match(/\{.*\}$/);
        if (!jsonMatch) return false;

        const parsed: SecurityLogEntry = JSON.parse(jsonMatch[0]);
        return ALL_EVENT_TYPES.includes(parsed.event);
      }),
      { numRuns: 100 }
    );
  });

  it('el campo result siempre es SUCCESS o FAILURE', () => {
    fc.assert(
      fc.property(securityEntryArb, (entry) => {
        logger.log(entry as SecurityLogEntry);

        const content = fs.readFileSync(logFilePath, 'utf8').trim();
        const lastLine = content.split('\n').pop() || '';
        const jsonMatch = lastLine.match(/\{.*\}$/);
        if (!jsonMatch) return false;

        const parsed: SecurityLogEntry = JSON.parse(jsonMatch[0]);
        return parsed.result === 'SUCCESS' || parsed.result === 'FAILURE';
      }),
      { numRuns: 100 }
    );
  });

  it('ningún campo obligatorio (timestamp, event, result) es undefined o null', () => {
    fc.assert(
      fc.property(securityEntryArb, (entry) => {
        logger.log(entry as SecurityLogEntry);

        const content = fs.readFileSync(logFilePath, 'utf8').trim();
        const lastLine = content.split('\n').pop() || '';
        const jsonMatch = lastLine.match(/\{.*\}$/);
        if (!jsonMatch) return false;

        const parsed: SecurityLogEntry = JSON.parse(jsonMatch[0]);
        return (
          parsed.timestamp !== undefined && parsed.timestamp !== null &&
          parsed.event !== undefined && parsed.event !== null &&
          parsed.result !== undefined && parsed.result !== null
        );
      }),
      { numRuns: 100 }
    );
  });

  it('cada llamada a log() escribe exactamente una línea nueva en el archivo', () => {
    fc.assert(
      fc.property(
        fc.array(securityEntryArb, { minLength: 1, maxLength: 10 }),
        (entries) => {
          // Limpiar antes de este sub-test
          if (fs.existsSync(logFilePath)) fs.unlinkSync(logFilePath);

          for (const entry of entries) {
            logger.log(entry as SecurityLogEntry);
          }

          const content = fs.readFileSync(logFilePath, 'utf8');
          const lines = content.split('\n').filter(l => l.trim().length > 0);
          return lines.length === entries.length;
        }
      ),
      { numRuns: 50 }
    );
  });
});

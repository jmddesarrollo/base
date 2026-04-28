import ControlException from './controlException';

export interface SanitizeSchema {
  [field: string]: {
    type: 'string' | 'number' | 'boolean';
    maxLength?: number;
    required?: boolean;
  };
}

export class InputSanitizer {
  /**
   * Escapa caracteres HTML peligrosos y trunca si supera maxLength.
   * La función es idempotente: aplicarla dos veces produce el mismo resultado que una.
   * Para garantizar idempotencia, primero des-escapa entidades HTML existentes
   * y luego re-escapa desde cero.
   */
  static sanitizeString(value: string, maxLength?: number): string {
    // Paso 1: des-escapar entidades HTML ya presentes para evitar doble escape
    let normalized = value
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");

    // Paso 2: escapar todos los caracteres peligrosos desde cero
    let result = normalized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    if (maxLength !== undefined && result.length > maxLength) {
      result = result.substring(0, maxLength);
    }

    return result;
  }

  /**
   * Valida que el valor es un entero positivo. Lanza ControlException 400 si no lo es.
   */
  static validatePositiveInt(value: any, fieldName: string): number {
    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0) {
      throw new ControlException(`El campo '${fieldName}' debe ser un número entero positivo`, 400);
    }
    return num;
  }

  /**
   * Valida que el campo no es null, undefined ni cadena vacía. Lanza ControlException 400 si falla.
   */
  static requireField(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new ControlException(`El campo '${fieldName}' es obligatorio`, 400);
    }
  }

  /**
   * Sanitiza un objeto completo según el schema proporcionado.
   * Aplica sanitizeString a campos string, valida numéricos y campos requeridos.
   */
  static sanitizeObject(
    obj: Record<string, any>,
    schema: SanitizeSchema
  ): Record<string, any> {
    const result: Record<string, any> = { ...obj };

    for (const [field, rules] of Object.entries(schema)) {
      const value = obj[field];

      if (rules.required) {
        InputSanitizer.requireField(value, field);
      }

      if (value === null || value === undefined) {
        continue;
      }

      if (rules.type === 'string') {
        if (typeof value !== 'string') {
          throw new ControlException(`El campo '${field}' debe ser una cadena de texto`, 400);
        }
        result[field] = InputSanitizer.sanitizeString(value, rules.maxLength);
      } else if (rules.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          throw new ControlException(`El campo '${field}' debe ser un número`, 400);
        }
        result[field] = num;
      }
    }

    return result;
  }
}

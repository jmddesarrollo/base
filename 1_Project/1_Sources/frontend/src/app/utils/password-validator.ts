export const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[A-ZÑ])(?=.*[a-zñ])(?=.*[$€#%&_-])\S{6,15}$/;

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password || password.length === 0) {
    errors.push('La contraseña es obligatoria');
    return { valid: false, errors };
  }

  if (password.length < 6 || password.length > 15) {
    errors.push('La contraseña debe tener entre 6 y 15 caracteres');
  }

  if (!/(?=.*[0-9])/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (!/(?=.*[A-ZÑ])/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (!/(?=.*[a-zñ])/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (!/(?=.*[$€#%&_-])/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial ($ € # % & _ -)');
  }

  if (/\s/.test(password)) {
    errors.push('La contraseña no puede contener espacios en blanco');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
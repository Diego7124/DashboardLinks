import { useState } from 'react';
import { login, register } from '../lib/auth';
import { VALIDATION, UI, AUTH_ERROR_MESSAGES, DEFAULT_AUTH_ERROR } from '../lib/constants';

/**
 * Pagina de autenticacion (login / registro).
 *
 * Alterna entre modo login y registro con un toggle.
 * Validaciones del lado cliente:
 * - Correo y contraseña requeridos.
 * - Las contraseñas deben coincidir (modo registro).
 * - Contraseña minima de `UI.MIN_PASSWORD_LENGTH` caracteres.
 *
 * Los errores de Firebase se mapean a mensajes en español
 * mediante `AUTH_ERROR_MESSAGES`.
 *
 * @returns {JSX.Element}
 */
export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(VALIDATION.EMAIL_PASSWORD_REQUIRED);
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError(VALIDATION.PASSWORDS_MISMATCH);
      return;
    }

    if (password.length < UI.MIN_PASSWORD_LENGTH) {
      setError(VALIDATION.PASSWORD_TOO_SHORT);
      return;
    }

    try {
      setIsSubmitting(true);
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      const code = err.code || '';
      setError(AUTH_ERROR_MESSAGES[code] || err.message || DEFAULT_AUTH_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleMode() {
    setIsRegister((prev) => !prev);
    setError('');
    setConfirmPassword('');
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <h1>{isRegister ? 'Crear cuenta' : 'Dashboard Links'}</h1>
          <p className="login-subtitle">
            {isRegister
              ? 'Registra una cuenta para administrar tus clientes y links.'
              : 'Inicia sesión para acceder al panel de administración.'}
          </p>
        </div>

        {error && <div className="status-banner is-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </label>

          {isRegister && (
            <label>
              Confirmar contraseña
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>
          )}

          <button type="submit" className="primary-button login-submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Procesando...'
              : isRegister
                ? 'Crear cuenta'
                : 'Iniciar sesión'}
          </button>
        </form>

        <div className="login-footer">
          <button type="button" className="link-button" onClick={toggleMode}>
            {isRegister
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * @module AuthContext
 * @description Contexto de autenticacion de React.
 *
 * Provee el estado del usuario actual de Firebase y la funcion `logout`
 * a todos los componentes hijos. Mientras se resuelve el estado inicial
 * de auth, muestra un spinner de carga.
 *
 * Uso:
 * ```jsx
 * // En el arbol de componentes:
 * <AuthProvider><App /></AuthProvider>
 *
 * // En cualquier hijo:
 * const { user, logout } = useAuth();
 * ```
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, logout as firebaseLogout } from '../lib/auth';
import { getMyProfile } from '../lib/userStore';

const AuthContext = createContext(null);

/**
 * Proveedor de autenticacion. Envuelve el arbol de componentes.
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    return onAuthChange((firebaseUser) => {
      if (!firebaseUser) return setUser(null);
      getMyProfile()
        .then((profile) => {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: profile?.role || 'user',
          });
        })
        .catch((err) => {
          if (err.status === 401 || err.status === 403) {
            firebaseLogout().catch(() => {});
            setUser(null);
          } else {
            // 404, red, etc: usar info basica sin cerrar sesion
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'user',
            });
          }
        });
    });
  }, []);

  async function handleLogout() {
    await firebaseLogout();
  }

  const isLoading = user === undefined;

  return (
    <AuthContext.Provider value={{ user: isLoading ? null : user, logout: handleLogout, isLoading }}>
      {isLoading ? (
        <div className="auth-loading">
          <div className="spinner" />
          <p>Cargando...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticacion.
 * Debe usarse dentro de un `<AuthProvider>`.
 *
 * @returns {{ user: import('firebase/auth').User|null, logout: () => Promise<void> }}
 * @throws {Error} Si se llama fuera de `AuthProvider`.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

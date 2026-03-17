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
import { getDoc, doc } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

const AuthContext = createContext(null);

/**
 * Proveedor de autenticacion. Envuelve el arbol de componentes.
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    return onAuthChange((firebaseUser) => {
      const loadRol = async () =>{
      const userDoc = await getDoc(doc(firestore, 'users',firebaseUser.uid));
             
       if (userDoc.exists()) {
        setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: userDoc.data().role,
      });
      }else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'user',
          });
        }
      }
      return firebaseUser ? loadRol() : setUser(null);
    });
  }, []);

  async function handleLogout() {
    await firebaseLogout();
  }

  if (user === undefined) {
    return (
      <div className="auth-loading">
        <div className="spinner" />
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout: handleLogout }}>
      {children}
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

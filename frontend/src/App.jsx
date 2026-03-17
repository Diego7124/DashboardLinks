/**
 * @module App
 * @description Componente raiz de la aplicacion.
 *
 * Estructura:
 * - `AuthProvider` envuelve todo para proveer estado de auth.
 * - `AppRouter` decide que pagina mostrar segun el usuario.
 *
 * Nota: no se usa React Router ya que solo hay dos vistas
 * (Login y Dashboard), la navegacion se basa en si hay usuario.
 */

import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

function AppRouter() {
  const { user } = useAuth();
  if(!user){
    return <LoginPage />;
  } else if (user.role === 'admin') {
    return <AdminPage />;
  } else {
    return <DashboardPage />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
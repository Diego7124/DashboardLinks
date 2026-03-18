import React from 'react';
import { useEffect, useState } from 'react';
import { getUsers, updateUser, deleteUser as removeUser } from '../lib/userStore';



const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error al cargar usuarios');
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const promoteToAdmin = async (userId) => {
    try {
      await updateUser(userId, { role: 'admin' });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: 'admin' } : u)));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al actualizar el rol');
    }
  };

  const demoteToUser = async (userId) => {
    try {
      await updateUser(userId, { role: 'user' });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: 'user' } : u)));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al actualizar el rol');
    }
  };

  const deleteUser = async (userId) => {
    try {
      await removeUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al eliminar usuario');
    }
  };
  return (
    <div>
      <h1>Panel de Administración</h1>
      <h2>Usuarios ({users.length})</h2>
      {isLoading && <div>Cargando usuarios...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {!isLoading && !error && (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button onClick={()=>promoteToAdmin(u.id, u.role == 'admin')}>Promover a admin</button>
                  <button onClick={()=>demoteToUser(u.id)}>Degradar a usuario</button>
                  <button onClick={() => deleteUser(u.id)}>Eliminar usuario</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPage
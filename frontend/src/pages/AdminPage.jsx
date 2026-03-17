import React from 'react';
import { useEffect, useState} from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { updateDoc, doc } from 'firebase/firestore';



const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const ref = collection(firestore, 'users');
        const snapshot = await getDocs(ref);
        setUsers(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
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
    try{
        const useRef = doc(firestore, 'users', userId);
        await updateDoc(useRef, { role: 'admin' });
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? { ...u, role: 'admin' } : u))
        );
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error al actualizar el rol');
      }
    }

    const demoteToUser = async (userId) => {
        try {
            const useRef = doc(firestore, 'users', userId)
            await updateDoc(useRef, {role: 'user'})
            setUsers((prevUsers)=>{
                prevUsers.map((u) => u.id == userId ? { ...u, role: 'user' } : u)
            })
            
        } catch (error) {
            console.error(err);
            setError(err.message || 'Error al actualizar el rol'); 
        }
    }
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
                  <button onClick={() => {}}>Eliminar usuario</button>
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
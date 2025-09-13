'use client';

import { useState, useEffect } from 'react';
import '../../styles/admin.css';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

export default function AdminPage() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Si no hay token, el usuario no ha iniciado sesión.
    if (!token) {
      router.push('/login');
      return;
    }

    //verificar si es un administrador
    try {
      const decodedToken = jwt.decode(token);
      if (!decodedToken || !decodedToken.admin) {
        router.push('/');
        return;
      }
    } catch (e) {
      localStorage.removeItem('token'); // Borra token inválido
      router.push('/login');
      return;
    }

    const fetchCitas = async () => {
      try {
        const response = await fetch('/api/auth/citas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 403) {
            router.push('/login');
            return;
          }
          throw new Error('Error al obtener las citas');
        }

        const { citas } = await response.json();
        setCitas(citas);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, [router]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return <div className="text-center mt-8 text-lg font-semibold">Cargando citas...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500 font-bold">Error: {error}</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Panel de Administrador</h1>
        <button onClick={handleLogout} className="admin-logout-button">
          Cerrar Sesión
        </button>
      </div>

      <h2 className="citas-subtitle">Todas las Citas Agendadas</h2>
      
      <ul className="citas-list">
        {citas.length === 0 ? (
          <li className="citas-empty-message">No hay citas agendadas en este momento.</li>
        ) : (
          citas.map((cita) => (
            <li key={cita._id} className="cita-item">
              <div className="cita-details-grid">
                <p className="cita-detail">
                  <span className="detail-label">ID de Cita:</span> {cita._id.substring(18)}
                </p>
                <p className="cita-detail">
                  <span className="detail-label">Fecha:</span> {new Date(cita.fecha).toLocaleDateString()}
                </p>
                <p className="cita-detail full-width">
                  <span className="detail-label">Usuario:</span>{" "}
                  {cita.nombreUsuario ? `${cita.nombreUsuario} ${cita.apellidoUsuario || ''}` : 'Sin usuario'}
                </p>
                <p className="cita-detail full-width">
                  <span className="detail-label">Mascota:</span>{" "}
                  {cita.mascotaNombre} ({cita.tipoAnimal}, {cita.edad} años)
                </p>
                <p className="cita-detail full-width">
                  <span className="detail-label">Motivo:</span>{" "}
                  {cita.motivoTexto}
                </p>
                <p className="cita-detail full-width">
                  <span className="detail-label">Teléfono:</span>{" "}
                  {cita.telefono}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
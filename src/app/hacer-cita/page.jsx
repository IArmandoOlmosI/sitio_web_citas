'use client';

import { useState, useEffect } from 'react';
import '../../styles/cita.css';
import { useRouter } from 'next/navigation';

export default function HacerCitaPage() {
  const [formData, setFormData] = useState({
    mascotaNombre: '',
    tipoAnimal: '',
    edad: '',
    motivo: '',
    fecha: '',
    telefono: ''
  });
  const [motivos, setMotivos] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    //verifica si el usuario está logueado
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }

    const fetchMotivos = async () => {
      try {
        const response = await fetch('/api/auth/motivos');
        const data = await response.json();
        setMotivos(data.motivos);
      } catch (e) {
        console.error('Error al cargar motivos:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMotivos();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Agendando cita...');

    //
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Datos a enviar
    const dataToSend = isLoggedIn ? {
      mascotaNombre: formData.mascotaNombre,
      tipoAnimal: formData.tipoAnimal,
      edad: formData.edad,
      motivo: formData.motivo,
      fecha: formData.fecha
    } : {
      ...formData
    };

    const response = await fetch('/api/auth/citas', {
      method: 'POST',
      headers,
      body: JSON.stringify(dataToSend),
    });

    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      alert(`Cita agendada para la mascota ${formData.mascotaNombre}.`);
      setFormData({
        mascotaNombre: '',
        tipoAnimal: '',
        edad: '',
        motivo: '',
        fecha: '',
        telefono: ''
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };

  if (loading) {
    return <div className="text-center mt-8">Cargando formulario...</div>;
  }

  return (
    <div className="cita-container">
      <h1 className="cita-title">Agendar Nueva Cita</h1>
      <form onSubmit={handleSubmit} className="cita-form">
        <input type="text" name="mascotaNombre" placeholder="Nombre de la mascota" value={formData.mascotaNombre} onChange={handleChange} required className="cita-input" />
        <input type="text" name="tipoAnimal" placeholder="Tipo de animal" value={formData.tipoAnimal} onChange={handleChange} required className="cita-input" />
        <input type="number" name="edad" placeholder="Edad de la mascota" value={formData.edad} onChange={handleChange} required className="cita-input" />
        <select name="motivo" value={formData.motivo} onChange={handleChange} required className="cita-select">
          <option value="">Selecciona un motivo</option>
          {motivos.map(motivo => (<option key={motivo._id} value={motivo._id}>{motivo.nombre}</option>))}
        </select>
        <input type="date" name="fecha" placeholder="Fecha" value={formData.fecha} onChange={handleChange} required className="cita-input" />
        {!isLoggedIn && (
          <input type="tel" name="telefono" placeholder="Número de teléfono" value={formData.telefono} onChange={handleChange} required className="cita-input" />
        )}
        <button type="submit" className="cita-button-agendar">
          Agendar Cita
        </button>
      </form>
      {message && <p className="cita-message">{message}</p>}

      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="cita-button-logout">Cerrar Sesión</button>
      )}

    </div>
  );
}
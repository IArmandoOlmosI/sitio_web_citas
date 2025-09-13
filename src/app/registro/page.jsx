'use client';

import { useState } from 'react';
import '../../styles/registro.css';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

export default function RegistroPage() {
  const [formData, setFormData] = useState({ 
    nombre: '', 
    apellido: '', 
    telefono: '', 
    contrasena: '' 
  });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Registrando usuario...');

    const response = await fetch('/api/auth/registro', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      //guarda el token y redirige al usuario
      localStorage.setItem('token', data.token);

      const decodedToken = jwt.decode(data.token);
      
      if (decodedToken && decodedToken.admin) {
        router.push('/admin');
      } else {
        router.push('/hacer-cita');
      }
    }
  };

  return (
    <div className="registro-container">
      <h1 className="registro-title">Registro de Usuario</h1>
      <form onSubmit={handleSubmit} className="registro-form">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="registro-input"
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={formData.apellido}
          onChange={handleChange}
          required
          className="registro-input"
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono (10 dígitos)"
          value={formData.telefono}
          onChange={handleChange}
          required
          className="registro-input"
        />
        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={formData.contrasena}
          onChange={handleChange}
          required
          className="registro-input"
        />
        <button type="submit" className="registro-button">
          Registrarse
        </button>
      </form>
      {message && <p className="registro-message">{message}</p>}
    </div>
  );
}
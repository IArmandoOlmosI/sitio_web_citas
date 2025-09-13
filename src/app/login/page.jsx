'use client';

import { useState } from 'react';
import '../../styles/login.css';
import { useRouter } from 'next/navigation';
import jwt from 'jsonwebtoken';

export default function LoginPage() {
  const [formData, setFormData] = useState({ telefono: '', contrasena: '' });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Verificando credenciales...');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    setMessage(data.message);

    if (response.ok) {
      //guarda el token en localStorage
      localStorage.setItem('token', data.token);

      //obtener los datos del usuario 
      const decodedToken = jwt.decode(data.token);

      if (decodedToken && decodedToken.admin) {
        router.push('/admin');
      } else {
        router.push('/hacer-cita');
      }
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Iniciar Sesión</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          required
          className="login-input"
        />
        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={formData.contrasena}
          onChange={handleChange}
          required
          className="login-input"
        />
        <button type="submit" className="login-button">
          Iniciar Sesión
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
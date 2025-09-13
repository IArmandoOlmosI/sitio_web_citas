import React from 'react';
import '../styles/principal.css';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <img src="/portada.jpeg" alt="Imagen principal" className="main-image"/>
      <section className="text-section">
        <h1>Clínica Veterinaria</h1>
        <p>
          Atendemos unicamente con cita con diversos tipos de consulta o en caso extremo urgencias.
        </p>
        <p>
          Nuestros trabajadores egresados de las UNAM brindaran un excelente servicio.
        </p>
        <p>
          Agenda tu cita o registrate en el siguiente apartado.
        </p>
      </section>
      <div className="button-container">
        <Link href="/login"><button className="button primary">Iniciar Sesión</button></Link>
        <Link href="/registro"><button className="button secondary">Registrarse</button></Link>
      </div>
    </main>
  );
}
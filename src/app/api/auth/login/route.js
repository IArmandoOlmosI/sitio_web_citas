

import clientPromise from '@/utils/mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const { telefono, contrasena } = await req.json();
    
    if (!telefono || !contrasena) {
      return NextResponse.json({ message: 'Todos los campos son requeridos.' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("Cita");
    const usuariosCollection = db.collection("usuarios");
    
    const usuario = await usuariosCollection.findOne({ telefono });
    
    if (!usuario) {
      return NextResponse.json({ message: 'Teléfono o contraseña incorrectos.' }, { status: 401 });
    }

    // Comparar la contraseña hasheada
    const passwordMatch = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Teléfono o contraseña incorrectos.' }, { status: 401 });
    }

    // Crea el token con los datos del usuario
    const token = jwt.sign(
      { userId: usuario._id, admin: usuario.admin || false, nombre: usuario.nombre },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      message: 'Inicio de sesión exitoso.',
      token,
    });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
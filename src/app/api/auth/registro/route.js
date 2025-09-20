import clientPromise from '@/utils/mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const { nombre, apellido, contrasena, telefono} = await req.json();

    
    const contraRegu = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; 

    
    if (!nombre || !apellido || !contrasena || !telefono) {
      return NextResponse.json({ message: 'Todos los campos son requeridos.' }, { status: 400 });
    }
    if (!contraRegu.test(contrasena)) {
      return NextResponse.json({ 
          message: 'La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas y números.' 
      }, { status: 400 });
    }
    if (telefono.length !== 10) {
      return NextResponse.json({ message: 'El teléfono debe ser de 10 dígitos.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("Cita");
    const usuariosCollection = db.collection("usuarios");

    const usuarioExistente = await usuariosCollection.findOne({ telefono });
    if (usuarioExistente) {
      return NextResponse.json({ message: 'El teléfono ya está registrado.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = {
      nombre,
      apellido,
      contrasena: hashedPassword,
      telefono,
      admin: false,
    };

    const result = await usuariosCollection.insertOne(nuevoUsuario);

    const token = jwt.sign(
      { userId: result.insertedId, admin: false, nombre: nuevoUsuario.nombre },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      message: 'Registro exitoso.',
      token,
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
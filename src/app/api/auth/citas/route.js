import clientPromise from '@/utils/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; 

//verificar y decodificar el token
function verifyToken(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Error al verificar el token:', error.message);
    return null;
  }
}

//obtener citas
export async function GET(req) {
  //verifica
  const user = verifyToken(req);
  if (!user || !user.admin) {
    return NextResponse.json(
      { message: 'Acceso denegado. Se requiere rol de administrador.' },
      { status: 403 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("Cita");
    const citasCollection = db.collection("consultas");

    //obtener datos
    const citas = await citasCollection.aggregate([
      // Une con la colección de usuarios
      {
        $lookup: {
          from: "usuarios",
          localField: "usuarioId",
          foreignField: "_id",
          as: "datosUsuario"
        }
      },
  
      {
        $unwind: { path: "$datosUsuario", preserveNullAndEmptyArrays: true }
      },
      // Une con la colección de motivos
      {
        $lookup: {
          from: "motivos",
          localField: "motivo",
          foreignField: "_id",
          as: "datosMotivo"
        }
      },
      
      {
        $unwind: "$datosMotivo"
      },
      //muestra los datos
      {
        $project: {
          _id: 1,
          mascotaNombre: 1,
          tipoAnimal: 1,
          edad: 1,
          telefono: 1,
          fecha: 1,
          motivoTexto: "$datosMotivo.nombre",
          nombreUsuario: "$datosUsuario.nombre",
          apellidoUsuario: "$datosUsuario.apellido"
        }
      },
      
      {
        $sort: { fechaCreacion: -1 }
      }
    ]).toArray();

    return NextResponse.json({ citas }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}

// crear cita
export async function POST(req) {
  const user = verifyToken(req);

  try {
    const client = await clientPromise;
    const db = client.db("Cita");
    const citasCollection = db.collection("consultas");
    const usuariosCollection = db.collection("usuarios");
    const body = await req.json();

    const citaData = {
      mascotaNombre: body.mascotaNombre,
      tipoAnimal: body.tipoAnimal,
      edad: parseInt(body.edad),
      motivo: new ObjectId(body.motivo),
      fecha: body.fecha,
    };

    //si hay un token válido, busca al usuario y añade su ID y teléfono a la cita
    if (user && user.userId) {
      const usuario = await usuariosCollection.findOne(
        { _id: new ObjectId(user.userId) },
        { projection: { telefono: 1 } }
      );

      if (!usuario) {
        return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
      }

      citaData.usuarioId = new ObjectId(user.userId);
      citaData.telefono = usuario.telefono; // Añade el teléfono del usuario
    } else {
      
      if (!body.telefono) {
        return NextResponse.json({ message: 'El número de teléfono es requerido.' }, { status: 400 });
      }
      citaData.telefono = body.telefono;
    }

    const result = await citasCollection.insertOne(citaData);

    return NextResponse.json({
      message: 'Cita agendada exitosamente',
      citaId: result.insertedId
    }, { status: 201 });

  } catch (error) {
    console.error('Error al agendar cita:', error);
    return NextResponse.json({ message: 'Error interno del servidor.' }, { status: 500 });
  }
}
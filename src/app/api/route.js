
import clientPromise from '@/utils/mongodb';

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("Cita");

    //coleccion de consultas
    const consultasCollection = db.collection("consultas");
    const consultas = await consultasCollection.find({}).toArray();

    //coleccion de motivos
    const motivosCollection = db.collection("motivos");
    const motivos = await motivosCollection.find({}).toArray();

    //coleccion de usuarios
    const usuariosCollection = db.collection("usuarios");
    const usuarios = await usuariosCollection.find({}).toArray();

    return new Response(JSON.stringify({ consultas, motivos, usuarios }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ message: 'Error al conectar o la base de datos.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
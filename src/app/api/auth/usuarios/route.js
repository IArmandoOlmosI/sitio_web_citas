import clientPromise from '@/utils/mongodb';

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("Cita");
    const usuariosCollection = db.collection("usuarios");

    const body = await req.json();

    // Inserta el nuevo usuario en la colección
    const result = await usuariosCollection.insertOne(body);

    return new Response(JSON.stringify({
      message: 'Usuario creado exitosamente',
      usuarioId: result.insertedId
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return new Response(JSON.stringify({ message: 'Error interno del servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
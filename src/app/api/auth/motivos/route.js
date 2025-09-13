import clientPromise from '@/utils/mongodb';



export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Cita");
    const motivosCollection = db.collection("motivos");

    const motivos = await motivosCollection.find({}).toArray();
    
    return new Response(JSON.stringify({ motivos }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener motivos:', error);
    return new Response(JSON.stringify({ message: 'Error interno del servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
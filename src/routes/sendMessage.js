import redisClient from '../databases/redis.js';

export async function sendMessage(req, res) {
  try {
    const { texto, idAutor } = req.body;
    const { conversationID } = req.params;

    if (!texto || !idAutor || !conversationID) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const mensaje = { texto, idAutor, fecha: Date.now() };
    await redisClient.rPush(`conversaciones:id:${conversationID}`, JSON.stringify(mensaje));
    return res.status(201).json(mensaje);
  } catch (err) {
    console.error("Error al guardar mensaje:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export default sendMessage;


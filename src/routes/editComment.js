import redisClient from "../../databases/redis.js";

export async function editComment(req, res) {
  try {
    const { postId, commentId } = req.params;
    const { texto } = req.body;

    if (!texto) return res.status(400).json({ error: "Missing new text" });

    const raw = await redisClient.lRange(`comentarios:post:${postId}`, 0, -1);

    for (let i = 0; i < raw.length; i++) {
      const c = JSON.parse(raw[i]);
      if (c.id === commentId) {
        c.texto = texto.trim();
        c.fecha_editado = Date.now();

        await redisClient.lSet(
          `comentarios:post:${postId}`,
          i,
          JSON.stringify(c)
        );

        return res.json({ msg: "comentario editado", comentario: c });
      }
    }

    return res.status(404).json({ error: "Comentario no encontrado" });
  } catch (err) {
    console.error("error al editar comentario:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default editComment;
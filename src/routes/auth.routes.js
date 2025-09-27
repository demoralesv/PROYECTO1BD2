//Aqui van a ir los routes, basicamente la logica de las rutas, lo mismo que está en index.js pero para que quede mas ordenado
import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const [scheme, token] = auth.split(" ");
  if (!token || scheme !== "Bearer") {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.userId = decoded.id;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

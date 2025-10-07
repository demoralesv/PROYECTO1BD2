import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "TOken Required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findById(payload.id).select("username role");
    if (!user) return res.status(401).json({ error: "User not Valid" });
    req.user = { id: user._id.toString(), username: user.username, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid Token" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admins ONLY" });
  next();
}
// Middleware para rutas que requieren autenticación y rol admin
// Uso: router.get("/ruta", requireAuth, requireAdmin, controlador);
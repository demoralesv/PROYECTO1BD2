// Correr: node Scripts/clear-chat-assets.js
// Para borrar todos los archivos, videos e imágenes que se
// han guardado en Cassandra
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { cassandraClient } = await import("../src/databases/cassandra.js");
const KS = (process.env.CASSANDRA_KEYSPACE || "appks").trim();

async function main() {
  try {
    await cassandraClient.connect();
    console.log("⚠️  Deleting all rows in", `${KS}.chat_assets`, "…");
    await cassandraClient.execute(`TRUNCATE ${KS}.chat_assets`);
    console.log("✅ All chat_assets erased.");
  } catch (err) {
    console.error("Error clearing chat_assets:", err);
  } finally {
    await cassandraClient.shutdown();
    process.exit(0);
  }
}
main();

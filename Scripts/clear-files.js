// Correr: node Scripts/clear-files.js
// Para borrar todos los archivos y videos que se han guardado en Cassandra
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { cassandraClient } = await import("../src/databases/cassandra.js");

const KS = process.env.CASSANDRA_KEYSPACE || "appks";

async function main() {
  try {
    await cassandraClient.connect();

    console.log("⚠️ Deleting all rows in", KS + ".files ...");

    await cassandraClient.execute(`TRUNCATE ${KS}.files`);

    console.log("✅ All files erased.");
  } catch (err) {
    console.error("Error clearing files:", err);
  } finally {
    await cassandraClient.shutdown();
    process.exit(0);
  }
}

main();

// Correr: node Scripts/describe-cassandra.js
// Para revisar las tablas que se han guardado en Cassandra
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { cassandraClient } = await import("../src/databases/cassandra.js");

const KS = (process.env.CASSANDRA_KEYSPACE || "appks").trim();

async function main() {
  await cassandraClient.connect();

  const tables = await cassandraClient.execute(
    "SELECT table_name FROM system_schema.tables WHERE keyspace_name = ?",
    [KS],
    { prepare: true }
  );
  console.log(
    `Tables in keyspace ${KS}:`,
    tables.rows.map((r) => r.table_name)
  );

  const cols = await cassandraClient.execute(
    "SELECT column_name, type FROM system_schema.columns WHERE keyspace_name = ? AND table_name = ?",
    [KS, "files"],
    { prepare: true }
  );
  console.log("files columns:");
  cols.rows.forEach((r) => console.log(" -", r.column_name, r.type));

  const cols2 = await cassandraClient.execute(
    "SELECT column_name, type FROM system_schema.columns WHERE keyspace_name = ? AND table_name = ?",
    [KS, "chat_assets"],
    { prepare: true }
  );
  console.log("chat_assets columns:");
  cols2.rows.forEach((r) => console.log(" -", r.column_name, r.type));

  await cassandraClient.shutdown();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

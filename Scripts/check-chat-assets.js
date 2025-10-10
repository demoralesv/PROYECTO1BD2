// Correr: node Scripts/check-chat-assets.js
// Para revisar todos los archivos, videos e imágenes que se
// han guardado en Cassandra
import dotenv from "dotenv";
dotenv.config();
const { cassandraClient } = await import("../src/databases/cassandra.js");

const KS = (process.env.CASSANDRA_KEYSPACE || "appks").trim();

await cassandraClient.connect();
const rs = await cassandraClient.execute(
  `SELECT chat_id, id, kind, name, content_type, bytes, created_at
   FROM ${KS}.chat_assets LIMIT 50`
);
if (!rs.rows.length) {
  console.log("No rows in chat_assets.");
} else {
  console.log("Sample chat_assets rows:");
  rs.rows.forEach((r) => {
    console.log(
      r.chat_id,
      r.id.toString(),
      r.kind,
      r.name,
      r.content_type,
      r.bytes && r.bytes.toString ? r.bytes.toString() : r.bytes,
      r.created_at
    );
  });
}
await cassandraClient.shutdown();

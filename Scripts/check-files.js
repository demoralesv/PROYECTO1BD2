// Correr: node Scripts/check-files.js
// Para revisar todos los archivos y videos que se han guardado en Cassandra
import dotenv from "dotenv";
dotenv.config();
const { cassandraClient } = await import("../src/databases/cassandra.js");

const KS = (process.env.CASSANDRA_KEYSPACE || "appks").trim();

await cassandraClient.connect();
const rs = await cassandraClient.execute(
  `SELECT dataset_id, id, kind, name, amount_of_bytes, creation_date
   FROM ${KS}.files LIMIT 50`
);
if (!rs.rows.length) {
  console.log("No rows in files table.");
} else {
  console.log("Sample rows:");
  rs.rows.forEach((r) => {
    console.log(
      r.dataset_id.toString(),
      r.kind,
      r.name,
      r.amount_of_bytes?.toString?.() || r.amount_of_bytes,
      r.creation_date
    );
  });
}
await cassandraClient.shutdown();

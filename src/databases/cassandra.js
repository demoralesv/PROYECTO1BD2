import dotenv from "dotenv";
import { Client, types as cassTypes } from "cassandra-driver";

dotenv.config();

const CASSANDRA_CONTACT_POINTS = process.env.CASSANDRA_CONTACT_POINTS;
const CASSANDRA_PORT = process.env.CASSANDRA_PORT;
const CASSANDRA_DATACENTER = process.env.CASSANDRA_DATACENTER;
const CASSANDRA_KEYSPACE = process.env.CASSANDRA_KEYSPACE;

export const cassandraClient = new Client({
  contactPoints: CASSANDRA_CONTACT_POINTS.split(",").map((s) => s.trim()),
  localDataCenter: CASSANDRA_DATACENTER,
  protocolOptions: { port: Number(CASSANDRA_PORT) },
  keyspace: CASSANDRA_KEYSPACE,
});

export async function initCassandra() {
  await cassandraClient.connect();

  // Keyspace
  await cassandraClient.execute(`
    CREATE KEYSPACE IF NOT EXISTS ${CASSANDRA_KEYSPACE}
    WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
  `);

  await cassandraClient.execute(`USE ${CASSANDRA_KEYSPACE}`);

  // Tabla de archivos y videos
  // Tabla de videos e imágenes en chats
  await cassandraClient.execute(`
  CREATE TABLE IF NOT EXISTS files (
    dataset_id uuid,
    id timeuuid,
    kind text,
    name text,
    creation_date timestamp,
    amount_of_bytes bigint,
    blob_data blob,
    PRIMARY KEY ((dataset_id), id)
  ) WITH CLUSTERING ORDER BY (id ASC)
`);

  await cassandraClient.execute(`
  CREATE TABLE IF NOT EXISTS chat_assets (
    chat_id text,
    id timeuuid,
    kind text,
    name text,
    content_type text,
    bytes bigint,
    blob_data blob,
    created_at timestamp,
    PRIMARY KEY ((chat_id), id)
  ) WITH CLUSTERING ORDER BY (id ASC)
`);

  console.log("✅ Cassandra connected and keyspace ready");
}


import dotenv from "dotenv";
import { Client } from "cassandra-driver";
dotenv.config();

  const CASSANDRA_CONTACT_POINTS = process.env.CASSANDRA_CONTACT_POINTS;
  const CASSANDRA_PORT = process.env.CASSANDRA_PORT;
  const CASSANDRA_DATACENTER = process.env.CASSANDRA_DATACENTER;
  const CASSANDRA_KEYSPACE = process.env.CASSANDRA_KEYSPACE;

export const cassandraClient = new Client({
  contactPoints: CASSANDRA_CONTACT_POINTS.split(",").map(s => s.trim()),
  localDataCenter: CASSANDRA_DATACENTER,
  protocolOptions: { port: Number(CASSANDRA_PORT) },
  
});

export async function initCassandra() {
  await cassandraClient.connect();

 
  await cassandraClient.execute(`
    CREATE KEYSPACE IF NOT EXISTS ${CASSANDRA_KEYSPACE}
    WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
  `);

  await cassandraClient.execute(`USE ${CASSANDRA_KEYSPACE}`);

  // tabla ejemplo (auditoría logins)
  await cassandraClient.execute(`
    CREATE TABLE IF NOT EXISTS login_events (
      username TEXT,
      event_date DATE,
      event_time TIMESTAMP,
      success BOOLEAN,
      ip TEXT,
      user_agent TEXT,
      PRIMARY KEY ((username, event_date), event_time)
    ) WITH CLUSTERING ORDER BY (event_time DESC);
  `);

  console.log("✅ Cassandra connected and keyspace ready");
}

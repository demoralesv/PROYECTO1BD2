
import dotenv from "dotenv";
import neo4j from "neo4j-driver";

dotenv.config();

const URI = process.env.NEO4J_URI;
const USER = process.env.NEO4J_USER;
const PASSWORD = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

export async function initNeo4j() {
  try {
    const serverInfo = await driver.getServerInfo();
    console.log("✅ Neo4j Connection established");
  } catch (err) {
    console.error("❌ Error connecting to Neo4j", err);
    process.exit(1);
  }
}

export default driver;

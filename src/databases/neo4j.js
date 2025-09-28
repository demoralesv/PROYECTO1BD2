import dotenv from "dotenv";
dotenv.config();
import neo4j from "neo4j-driver";


const connectNeo = async () => {
  
  const URI = process.env.NEO4J_URI
  const USER = process.env.NEO4J_USER
  const PASSWORD = process.env.NEO4J_PASSWORD
  let driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))
  const serverInfo = await driver.getServerInfo()
  console.log('✅ Neo4j Connection established')

  await driver.close()
};

export default connectNeo;
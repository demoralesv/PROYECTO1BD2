// neo-follow-counts.js
import driver from "../databases/neo4j.js";

// Normaliza posibles enteros de Neo4j a número JS
const toNum = (v) => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v.toNumber === "function") return v.toNumber(); // neo4j-int
  if (typeof v.low === "number") return v.low;               // neo4j-int {low,high}
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Obtiene { followers, following } para un username (User.ID = username en Neo4j)
 */
export async function getFollowCounts(username) {
  const session = driver.session({ defaultAccessMode: "READ" });
  try {
    const cypher = `
      MATCH (me:User {ID: $u})
      OPTIONAL MATCH (f:User)-[:Friends]->(me)
      WITH me, count(f) AS followers
      OPTIONAL MATCH (me)-[:Friends]->(t:User)
      RETURN followers, count(t) AS following
    `;
    const result = await session.executeRead((tx) =>
      tx.run(cypher, { u: String(username).trim() })
    );

    const rec = result.records[0];
    if (!rec) return { followers: 0, following: 0 };

    return {
      followers: toNum(rec.get("followers")),
      following: toNum(rec.get("following")),
    };
  } finally {
    await session.close();
  }
}

import pkg from "pg";
const { Pool } = pkg;

/**
 * ============================================
 * POOL BI / REPORTING / AUDITORÍA
 * (CONEXIÓN ACTUAL - NO SE TOCA)
 * ============================================
 */
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Recomendado para Aurora
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  console.log("🔥 Conectado a PostgreSQL Cluster BI");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL BI error:", err);
  process.exit(1);
});

/**
 * ============================================
 * POOL ORIGEN / PRODUCCIÓN
 * (NUEVA CONEXIÓN)
 * ============================================
 */
export const originPool = new Pool({
  host: process.env.ORIGIN_DB_HOST,
  port: Number(process.env.ORIGIN_DB_PORT),
  user: process.env.ORIGIN_DB_USER,
  password: process.env.ORIGIN_DB_PASSWORD,
  database: process.env.ORIGIN_DB_NAME,

  // Menor carga, lectura principalmente
  max: Number(process.env.ORIGIN_DB_POOL_MAX || 5),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

originPool.on("connect", () => {
  console.log("🔥 Conectado a PostgreSQL ORIGEN (Producción)");
});

originPool.on("error", (err) => {
  console.error("❌ PostgreSQL ORIGEN error:", err);
  process.exit(1);
});

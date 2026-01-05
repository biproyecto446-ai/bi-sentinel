import pkg from "pg";
const { Pool } = pkg;

/* ============================================================
   POOL BI (NORMAL)
   ============================================================ */
export const biPool = new Pool({
  host: process.env.BI_DB_HOST,
  port: Number(process.env.BI_DB_PORT),
  user: process.env.BI_DB_USER,
  password: process.env.BI_DB_PASSWORD,
  database: process.env.BI_DB_NAME,
  max: Number(process.env.BI_DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

biPool.on("connect", () => {
  console.log("🔥 Conectado a BI");
});

biPool.on("error", (err) => {
  console.error("❌ BI pool error:", err);
});


/* ============================================================
   PROD – PARAMETROS
   ============================================================ */
export const prodParametrosPool = new Pool({
  host: process.env.PROD_DB_HOST,
  port: Number(process.env.PROD_DB_PORT),
  user: process.env.PROD_DB_USER,
  password: process.env.PROD_DB_PASSWORD,
  database: process.env.PROD_DB_NAME_PARAMETERS,
  max: Number(process.env.PROD_DB_POOL_MAX || 5),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

prodParametrosPool.on("connect", () => {
  console.log("🔥 Conectado a PROD – PARAMETROS");
});

prodParametrosPool.on("error", (err) => {
  console.error("❌ PROD PARAMETROS pool error:", err);
});


/* ============================================================
   PROD – WITNESS (TESTIGOS)
   ============================================================ */
export const prodWitnessPool = new Pool({
  host: process.env.PROD_DB_HOST,
  port: Number(process.env.PROD_DB_PORT),
  user: process.env.PROD_DB_USER,
  password: process.env.PROD_DB_PASSWORD,
  database: process.env.PROD_DB_NAME_WITNESS,
  max: Number(process.env.PROD_WITNESS_DB_POOL_MAX || 5),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

prodWitnessPool.on("connect", () => {
  console.log("🔥 Conectado a PROD – WITNESS");
});

prodWitnessPool.on("error", (err) => {
  console.error("❌ PROD WITNESS pool error:", err);
});


/* ============================================================
   PROD – DOCUMENTS
   ============================================================ */
export const prodUsersPool = new Pool({
  host: process.env.PROD_DB_HOST,
  port: Number(process.env.PROD_DB_PORT),
  user: process.env.PROD_DB_USER,
  password: process.env.PROD_DB_PASSWORD,
  database: process.env.PROD_DB_NAME_DOCUMENTS,
  max: Number(process.env.PROD_USERS_DB_POOL_MAX || 5),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

prodUsersPool.on("connect", () => {
  console.log("🔥 Conectado a PROD – USERS");
});

prodUsersPool.on("error", (err) => {
  console.error("❌ PROD USERS pool error:", err);
});

import { biPool, prodParametrosPool, prodWitnessPool, prodDocumentsPool } from "../config/db.js";

export const getElections = async () => {
  try {
    const elections = await prodParametrosPool.query(`SELECT * FROM public."TBL_TEEL_Eleccion"`);
    return elections.rows;
  } catch (error) {
    console.error("Error en getElecciones:", error);
    throw error;
  }
};

export const getCountTestigosMesa = async (idEleccion) => {
  try {
    const resultPrincipales = await prodWitnessPool.query(
      `SELECT count(*) FROM public."TBL_TEEL_Testigo_Mesa" WHERE "ID_Eleccion" = $1
      AND "Tipo_Testigo" = 'PRINCIPAL'`,
      [idEleccion]
    );
    const resultRemanentes = await prodWitnessPool.query(
      `SELECT count(*) FROM public."TBL_TEEL_Testigo_Mesa" WHERE "ID_Eleccion" = $1
      AND "Tipo_Testigo" = 'REMANENTE'`,
      [idEleccion]
    );
    const principales = parseInt(resultPrincipales.rows[0].count)
    const remanentes = parseInt(resultRemanentes.rows[0].count)

    return {
      total: principales + remanentes,
      principales,
      remanentes,
    };
  } catch (error) {
    console.error("Error en getCountTestigosMesa:", error);
    throw error;
  }
};

export const getCountCredenciales = async (idEleccion) => {
  try {
    const result = await prodDocumentsPool.query(
      `SELECT count(*) FROM public."TBL_TEEL_Credencial" WHERE "ID_Eleccion" = $1`,
      [idEleccion]
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error("Error en getCountTestigosMesa:", error);
    throw error;
  }
};

export const getCountResolutions = async (idEleccion) => {
  try {
    const result = await prodDocumentsPool.query(
      `SELECT count(*) FROM public."TBL_TEEL_Resolution" WHERE "ID_Eleccion" = $1`,
      [idEleccion]
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error("Error en getCountResolutions:", error);
    throw error;
  }
};

export const getCountsTestigoComision = async (idEleccion) => {
  try {
    // Query 1: Obtener tipos de comisión de prodParametrosPool
    const tiposResult = await prodParametrosPool.query(
      `SELECT "ID_Tipo_Comision", "Des_Tipo_Comision" FROM public."TBL_TEEL_Tipo_Comision"`
    );
    
    // Crear mapa de ID -> descripción
    const tiposMap = {};
    tiposResult.rows.forEach(row => {
      tiposMap[row.ID_Tipo_Comision] = row.Des_Tipo_Comision;
    });

    // Query 2: Obtener conteos de prodWitnessPool
    const conteosResult = await prodWitnessPool.query(
      `SELECT "ID_Tipo_Comision", COUNT(*) AS total
       FROM public."TBL_TEEL_Testigo_Comision"
       WHERE "ID_Eleccion" = $1
       GROUP BY "ID_Tipo_Comision"`,
      [idEleccion]
    );

    // Convertir filas a objeto por tipo de comisión
    const counts = {
      auxiliar: 0,
      zonal: 0,
      municipal: 0,
      general: 0,
      cne: 0,
      total: 0
    };

    conteosResult.rows.forEach(row => {
      const tipo = tiposMap[row.ID_Tipo_Comision]?.toLowerCase().trim();
      const cantidad = parseInt(row.total) || 0;
      counts.total += cantidad;

      if (tipo?.includes('auxiliar')) counts.auxiliar = cantidad;
      else if (tipo?.includes('zonal')) counts.zonal = cantidad;
      else if (tipo?.includes('municipal')) counts.municipal = cantidad;
      else if (tipo?.includes('general')) counts.general = cantidad;
      else if (tipo?.includes('cne')) counts.cne = cantidad;
    });

    console.log(counts);
    
    return counts;
  } catch (error) {
    console.error("Error en getCountsTestigoComision:", error);
    throw error;
  }
};

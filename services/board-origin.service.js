import { prodParametrosPool, prodWitnessPool, prodDocumentsPool } from "../config/db.js";

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
    const result = await prodWitnessPool.query(
      `SELECT count(*) FROM public."TBL_TEEL_Testigo_Mesa" WHERE "ID_Eleccion" = $1`,
      [idEleccion]
    );
    return parseInt(result.rows[0].count);
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
    console.error("Error en getCountTestigosMesa:", error);
    throw error;
  }
};

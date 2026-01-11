import { biPool } from "../config/db.js";
import { humanizeCron } from '../utils/cronHumanizer.js';

/**
 * Obtiene todos los cron jobs con su estado
 */
export const getCrons = async (page = 1) => {
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const total = await biPool.query(
      `SELECT COUNT(*) FROM cron.job`
    );

    const data = await biPool.query(
      `SELECT * FROM cron.job
      ORDER BY jobid
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Último estado por job
    const runs = await biPool.query(
      `
      SELECT DISTINCT ON (jobid)
        jobid,
        status
      FROM cron.job_run_details
      ORDER BY jobid, runid DESC
      `
    );

    // Mapa jobid -> status
    const runStatusMap = new Map(
      runs.rows.map(r => [String(r.jobid), r.status])
    );

    // Enriquecer jobs
    const jobs = data.rows.map(job => {
      const lastStatus = runStatusMap.get(String(job.jobid));

      return {
        ...job,
        schedule_human: humanizeCron(job.schedule),
        running: lastStatus === 'running',
        last_status: lastStatus || 'unknown',
      };
    });

    return {
      jobs,
      pagination: {
        page,
        totalRecords: Number(total.rows[0].count)
      }
    };

  } catch (error) {
    console.error('Service getCrons error:', error.message);
    throw error;
  }
};

/**
 * Obtiene un job específico por ID
 */
export const getJobById = async (jobId) => {
  try {
    const result = await biPool.query(
      `SELECT * FROM cron.job WHERE jobid = $1`,
      [jobId]
    );

    if (result.rows.length === 0) {
      throw new Error('JOB_NOT_FOUND');
    }

    const job = result.rows[0];
    return {
      ...job,
      schedule_human: humanizeCron(job.schedule)
    };

  } catch (error) {
    console.error('Service getJobById error:', error.message);
    throw error;
  }
};

/**
 * Actualiza el schedule de un cron job
 * Usa UPDATE directo en lugar de cron.alter_job para evitar problemas de permisos
 */
export const updateJobSchedule = async (jobId, newSchedule) => {
  try {
    // Validar que el job existe
    const jobExists = await biPool.query(
      `SELECT jobid FROM cron.job WHERE jobid = $1`,
      [jobId]
    );

    if (jobExists.rows.length === 0) {
      throw new Error('JOB_NOT_FOUND');
    }

    // Actualizar el schedule usando UPDATE directo
    await biPool.query(
      `UPDATE cron.job SET schedule = $1 WHERE jobid = $2`,
      [newSchedule, jobId]
    );

    // Obtener el job actualizado
    const updated = await getJobById(jobId);
    
    return {
      success: true,
      message: 'Schedule actualizado correctamente',
      job: updated
    };

  } catch (error) {
    console.error('Service updateJobSchedule error:', error.message);
    throw error;
  }
};

/**
 * Activa o desactiva un cron job
 */
export const toggleJobActive = async (jobId, active) => {
  try {
    // Validar que el job existe
    const jobExists = await biPool.query(
      `SELECT jobid, active FROM cron.job WHERE jobid = $1`,
      [jobId]
    );

    if (jobExists.rows.length === 0) {
      throw new Error('JOB_NOT_FOUND');
    }

    // Actualizar el estado active
    await biPool.query(
      `UPDATE cron.job SET active = $1 WHERE jobid = $2`,
      [active, jobId]
    );

    // Obtener el job actualizado
    const updated = await getJobById(jobId);

    return {
      success: true,
      message: active ? 'Job activado correctamente' : 'Job desactivado correctamente',
      job: updated
    };

  } catch (error) {
    console.error('Service toggleJobActive error:', error.message);
    throw error;
  }
};

/**
 * Actualiza múltiples propiedades de un job
 * Usa UPDATE directo para evitar problemas de permisos con cron.alter_job
 */
export const updateJob = async (jobId, updates) => {
  try {
    const { schedule, active } = updates;

    // Validar que el job existe
    const jobExists = await biPool.query(
      `SELECT * FROM cron.job WHERE jobid = $1`,
      [jobId]
    );

    if (jobExists.rows.length === 0) {
      throw new Error('JOB_NOT_FOUND');
    }

    // Construir la actualización dinámica
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (schedule !== undefined) {
      setClauses.push(`schedule = $${paramIndex}`);
      values.push(schedule);
      paramIndex++;
    }

    if (active !== undefined) {
      setClauses.push(`active = $${paramIndex}`);
      values.push(active);
      paramIndex++;
    }

    // Si hay algo que actualizar
    if (setClauses.length > 0) {
      values.push(jobId);
      await biPool.query(
        `UPDATE cron.job SET ${setClauses.join(', ')} WHERE jobid = $${paramIndex}`,
        values
      );
    }

    // Obtener el job actualizado
    const updated = await getJobById(jobId);

    return {
      success: true,
      message: 'Job actualizado correctamente',
      job: updated
    };

  } catch (error) {
    console.error('Service updateJob error:', error.message);
    throw error;
  }
};

/**
 * Obtiene los detalles de ejecución de un job
 */
export const getCronsDetails = async (jobId, page = 1) => {
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const total = await biPool.query(
      `SELECT COUNT(*) FROM cron.job_run_details WHERE jobid = $1`,
      [jobId]
    );

    const data = await biPool.query(
      `SELECT * FROM cron.job_run_details
      WHERE jobid = $1
      ORDER BY runid DESC
      LIMIT $2 OFFSET $3`,
      [jobId, limit, offset]
    );

    // Obtener info del job
    const job = await getJobById(jobId);

    return {
      job,
      runs: data.rows,
      pagination: {
        page,
        totalRecords: Number(total.rows[0].count)
      }
    };

  } catch (error) {
    console.error('Service getCronsDetails error:', error.message);
    throw error;
  }
};

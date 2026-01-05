import { biPool } from "../config/db.js";
import { humanizeCron } from '../utils/cronHumanizer.js';

export const getCrons = async (page = 1) => {
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    console.log('flag aaaaa')

    const total = await biPool.query(
      `SELECT COUNT(*) FROM cron.job`
    );
    console.log('flag uno')


    const data = await biPool.query(
      `SELECT * FROM cron.job
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // 2. Último estado por job
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

    // Re-lanzamos el error para que el controller decida cómo responder
    throw error;
  }
};

export const getCronsDetails = async (page = 1) => {
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const total = await biPool.query(
      `SELECT COUNT(*) FROM cron.job_run_details`
    );

    const data = await biPool.query(
      `SELECT * FROM cron.job_run_details
      WHERE jobid = '1'
      ORDER BY runid DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return {
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
import { biPool } from "../config/db.js";

export const getRefreshCron = async (page, limit) => {
  try { // res
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    // 1️⃣ Total de registros
    const countResult = await biPool.query(`
            SELECT COUNT(*) FROM public.audit_cron_teel_witnessv2will
        `);
    const totalRecords = parseInt(countResult.rows[0].count);

    const totalPages = Math.ceil(totalRecords / limit);
    const dataResult = await biPool.query(`
            SELECT *
            FROM public.audit_cron_teel_witnessv2will
            ORDER BY id DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

    const job_detail = await biPool.query(`
            SELECT * FROM cron.job_run_details
            ORDER BY runid DESC LIMIT 10
        `);

    console.log(job_detail);

    return {
      titulo: "Refresh Cron",
      testigos: dataResult.rows,
      job_detail: job_detail[0],
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prevPage: page - 1,
        nextPage: page + 1
      }
    };

  } catch (error) {
    console.error("Error en DB:", error);
    res.render("refresh_cron", {
      titulo: "Refresh Cron",
      error: "Error get refresh Cron"
    });
  }

};

export const getDetalleById = async (id) => {
  const result = await biPool.query(
    `SELECT * FROM public.audit_cron_teel_witnessv2will WHERE id=$1`,
    [id]
  );

  if (!result.rows.length) throw new Error();

  const row = result.rows[0];
  return {
    row,
    json: JSON.parse(row.message || "{}")
  };
};

export const compareByIds = async (id1, id2) => {
  const parseRow = (row) => {
    try {
      return { ...row, json: JSON.parse(row.message) };
    } catch {
      return { ...row, json: {} };
    }
  };

  const result = await biPool.query(
    `
    SELECT *
    FROM public.audit_cron_teel_witnessv2will
    WHERE id = ANY($1)
    `,
    [[id1, id2]]
  );

  if (result.rows.length < 2) {
    throw new Error("IDS_NOT_FOUND");
  }

  const a = parseRow(result.rows.find(r => r.id == id1));
  const b = parseRow(result.rows.find(r => r.id == id2));

  const viewsSet = new Set();

  a?.json?.details?.forEach(d => viewsSet.add(d.view));
  b?.json?.details?.forEach(d => viewsSet.add(d.view));

  const compareViews = [...viewsSet].map(view => {
    const A = a.json.details.find(d => d.view === view) || {};
    const B = b.json.details.find(d => d.view === view) || {};

    return {
      view,

      a_duration: A.duration_seconds || 0,
      b_duration: B.duration_seconds || 0,
      diff_duration: (B.duration_seconds || 0) - (A.duration_seconds || 0),

      a_rows: A.rows || 0,
      b_rows: B.rows || 0,
      diff_rows: (B.rows || 0) - (A.rows || 0)
    };
  });

  return {
    a,
    b,
    compareViews
  };
};


import { biPool } from "../config/db.js";

/**
 * Obtiene las ejecuciones del cron con filtros y paginación
 */
export const getRefreshCron = async (filters = {}) => {
  try {
    // Parámetros de paginación
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;

    // Construir cláusulas WHERE dinámicamente
    const whereClauses = [];
    const values = [];
    let paramIndex = 1;

    // Filtro por status
    if (filters.status) {
      whereClauses.push(`status = $${paramIndex}`);
      values.push(filters.status);
      paramIndex++;
    }

    // Filtro por fecha desde
    if (filters.dateFrom) {
      whereClauses.push(`start_time >= $${paramIndex}`);
      values.push(filters.dateFrom);
      paramIndex++;
    }

    // Filtro por fecha hasta
    if (filters.dateTo) {
      whereClauses.push(`start_time <= ($${paramIndex}::date + interval '1 day')`);
      values.push(filters.dateTo);
      paramIndex++;
    }

    // Filtro por duración mínima (en segundos)
    if (filters.minDuration) {
      whereClauses.push(`EXTRACT(EPOCH FROM (end_time - start_time)) >= $${paramIndex}`);
      values.push(parseInt(filters.minDuration));
      paramIndex++;
    }

    // Filtro por duración máxima (en segundos)
    if (filters.maxDuration) {
      whereClauses.push(`EXTRACT(EPOCH FROM (end_time - start_time)) <= $${paramIndex}`);
      values.push(parseInt(filters.maxDuration));
      paramIndex++;
    }

    // Filtro por ID específico
    if (filters.executionId) {
      whereClauses.push(`id = $${paramIndex}`);
      values.push(parseInt(filters.executionId));
      paramIndex++;
    }

    // Construir WHERE clause
    const whereSQL = whereClauses.length > 0 
      ? `WHERE ${whereClauses.join(' AND ')}` 
      : '';

    // Ordenamiento
    const validSortColumns = ['id', 'start_time', 'end_time', 'status'];
    const sortBy = validSortColumns.includes(filters.sortBy) ? filters.sortBy : 'id';
    const sortOrder = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Caso especial: ordenar por duración
    let orderBySQL;
    if (filters.sortBy === 'duration') {
      orderBySQL = `ORDER BY EXTRACT(EPOCH FROM (end_time - start_time)) ${sortOrder}`;
    } else {
      orderBySQL = `ORDER BY ${sortBy} ${sortOrder}`;
    }

    // 1️⃣ Total de registros con filtros
    const countQuery = `
      SELECT COUNT(*) 
      FROM public.audit_cron_teel_witnessv2will
      ${whereSQL}
    `;
    const countResult = await biPool.query(countQuery, values);
    const totalRecords = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    // 2️⃣ Datos con filtros, ordenamiento y paginación
    const dataQuery = `
      SELECT *
      FROM public.audit_cron_teel_witnessv2will
      ${whereSQL}
      ${orderBySQL}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataResult = await biPool.query(dataQuery, [...values, limit, offset]);

    // Determinar si hay filtros activos
    const hasActiveFilters = !!(
      filters.status || 
      filters.dateFrom || 
      filters.dateTo || 
      filters.minDuration || 
      filters.maxDuration || 
      filters.executionId ||
      (filters.sortBy && filters.sortBy !== 'id') ||
      (filters.sortOrder && filters.sortOrder !== 'DESC')
    );

    return {
      titulo: "Refresh Cron",
      testigos: dataResult.rows,
      total: totalRecords,
      filters: {
        status: filters.status || '',
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || '',
        minDuration: filters.minDuration || '',
        maxDuration: filters.maxDuration || '',
        executionId: filters.executionId || '',
        sortBy: filters.sortBy || 'id',
        sortOrder: filters.sortOrder || 'DESC'
      },
      hasActiveFilters,
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
    console.error("Error en getRefreshCron:", error);
    throw error;
  }
};

/**
 * Obtiene el detalle de una ejecución por ID
 */
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

/**
 * Compara dos ejecuciones por sus IDs
 */
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

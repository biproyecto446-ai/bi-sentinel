// ================================================
// 🚀 EXPRESS + HANDLEBARS + POSTGRES
// ================================================

import express from "express";
import { engine } from "express-handlebars";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import ExcelJS from 'exceljs';

const { Pool } = pkg;
const app = express();
app.use(express.json());

// Necesario para ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// 🟦 CONFIGURAR HANDLEBARS
// ======================================================

app.engine("hbs", engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
    helpers: {
        eq: (a, b) => a === b,
        lt: (a, b) => a < b,
        gt: (a, b) => a > b,

        add: (a, b) => Number(a) + Number(b),
        subtract: (a, b) => Number(a) - Number(b),
        multiply: (a, b) => Number(a) * Number(b),

        uniqueViews: (detailsA, detailsB) => {
            const set = new Set();
            detailsA?.forEach(d => set.add(d.view));
            detailsB?.forEach(d => set.add(d.view));
            return [...set];
        },

        lookupDuration: (details, viewName) => {
            const found = details?.find(d => d.view === viewName);
            return found ? found.duration_seconds : "-";
        },

        keys: (obj) => Object.keys(obj || {}),

        formatDuration: (seconds) => {
            if (seconds === null || seconds === undefined) return '—';

            const totalMilliseconds = Math.round(Number(seconds) * 1000);

            const hrs = Math.floor(totalMilliseconds / 3600000);
            const mins = Math.floor((totalMilliseconds % 3600000) / 60000);
            const secs = Math.floor((totalMilliseconds % 60000) / 1000);
            const ms = totalMilliseconds % 1000;

            const parts = [];

            if (hrs > 0) parts.push(`${hrs}h`);
            if (mins > 0 || hrs > 0) parts.push(`${mins} min`);
            if (secs > 0 || mins > 0 || hrs > 0) parts.push(`${secs} seg`);
            parts.push(`${ms} ms`);

            return parts.join(' ');
        }

    }
}));




app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// ======================================================
// 🟩 CONFIGURAR POSTGRES
// ======================================================
const pool = new Pool({
    host: "44.205.8.177",
    port: 5436,
    user: "powerbi_user",
    password: "fP?|?SQIdX,#u{N;K[17B:y1.y~Lf",
    database: "db_mirror_witness_v2"
    // database: "db_mirror_actors_electorals"
});

pool.connect()
    .then(() => console.log("🔥 Conectado a PostgreSQL"))
    .catch((err) => console.error("❌ PostgreSQL error:", err));


// ======================================================
// 🟨 SERVIR ARCHIVOS ESTÁTICOS
// ======================================================
app.use(express.static(path.join(__dirname, "public")));


// ======================================================
// 🟦 RUTA PRINCIPAL (Renderizar tu HTML con Handlebars)
// ======================================================
app.get("/", (req, res) => {
    res.render("index", {
        titulo: "Visualizer JSON TEEL",
        mensajeBienvenida: "Pega tu JSON de refresh para visualizarlo."
    });
});

app.get("/refresh_cron", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        // 1️⃣ Total de registros
        const countResult = await pool.query(`
            SELECT COUNT(*) FROM public.audit_cron_teel_witnessv2will
        `);
        const totalRecords = parseInt(countResult.rows[0].count);

        const totalPages = Math.ceil(totalRecords / limit);

        // 2️⃣ Datos paginados
        const dataResult = await pool.query(`
            SELECT *
            FROM public.audit_cron_teel_witnessv2will
            ORDER BY id DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const job_detail = await pool.query(`
            SELECT * FROM cron.job_run_details
            ORDER BY runid DESC LIMIT 10
        `);

        console.log(job_detail);

        res.render("refresh_cron", {
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
        });

    } catch (error) {
        console.error("Error en DB:", error);
        res.render("refresh_cron", {
            titulo: "Refresh Cron",
            error: "No se pudo obtener información"
        });
    }
});


app.get("/detalle/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT *
            FROM public.audit_cron_teel_witnessv2will
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.render("detalle", { error: "No existe un registro con ese ID." });
        }

        const row = result.rows[0];

        // Convertimos el JSON del campo message
        let jsonData = {};
        try {
            jsonData = JSON.parse(row.message);
        } catch (err) {
            console.error("Error parseando JSON:", err);
        }

        res.render("detalle", {
            titulo: `Detalle del registro ${id}`,
            row,
            json: jsonData
        });

    } catch (err) {
        console.error(err);
        res.render("detalle", { error: "Error cargando el detalle." });
    }
});

app.get("/compare", async (req, res) => {
    try {
        const { id1, id2 } = req.query;

        if (!id1 || !id2) {
            return res.render("compare", { error: "Debes enviar id1 e id2 para comparar." });
        }

        const sql = `
            SELECT *
            FROM public.audit_cron_teel_witnessv2will
            WHERE id = ANY($1)
        `;

        const result = await pool.query(sql, [[id1, id2]]);

        if (result.rows.length < 2) {
            return res.render("compare", { error: "Uno o ambos IDs no existen." });
        }

        // Convertir JSON desde el campo message
        const parseRow = (row) => {
            try {
                return { ...row, json: JSON.parse(row.message) };
            } catch (e) {
                return { ...row, json: {} };
            }
        };

        const a = parseRow(result.rows.find(r => r.id == id1));
        const b = parseRow(result.rows.find(r => r.id == id2));

        // ===============================================
        // 🔥 ARMAR TABLA DE COMPARACIÓN (Duración + Rows)
        // ===============================================

        const viewsSet = new Set();

        a?.json?.details?.forEach(d => viewsSet.add(d.view));
        b?.json?.details?.forEach(d => viewsSet.add(d.view));

        const compareViews = [...viewsSet].map(viewName => {
            const A = a.json.details.find(d => d.view === viewName) || {};
            const B = b.json.details.find(d => d.view === viewName) || {};

            return {
                view: viewName,

                // tiempos
                a_duration: A.duration_seconds || 0,
                b_duration: B.duration_seconds || 0,
                diff_duration: (B.duration_seconds || 0) - (A.duration_seconds || 0),

                // filas
                a_rows: A.rows || 0,
                b_rows: B.rows || 0,
                diff_rows: (B.rows || 0) - (A.rows || 0)
            };
        });

        // ===============================================

        console.log(compareViews);
        res.render("compare", {
            titulo: `Comparación entre ejecuciones #${id1} y #${id2}`,
            a,
            b,
            compareViews
        });

    } catch (err) {
        console.error(err);
        res.render("compare", { error: "Error cargando la comparación." });
    }
});

app.get("/elections", async (req, res) => {
    try {
        const query = `SELECT "ID_Eleccion", "Des_Eleccion" FROM public."MV_TBL_TEEL_Eleccion" ORDER BY 1`;
        const result = await pool.query(query);

        if (!result.rows || result.rows.length === 0) {
            return res.render("elections", {
                error: "No se encontraron elecciones registradas",
                elections: []
            });
        }

        const elections = result.rows;
        const headers = Object.keys(elections[0] || {});

        res.render("elections", {
            titulo: "Listado de Elecciones",
            elections,
            headers
        });

    } catch (err) {
        console.error(err);
        res.render("elections", {
            error: "Error cargando elecciones",
            elections: []
        });
    }
});


app.get("/export_divipole", async (req, res) => {
    try {
        const electionId = req.query.id;
        const electionDesc = req.query.desc;

        // Validar que se envió ID_Eleccion
        if (!electionId) {
            return res.status(400).json({
                message: "Debe enviar ?id=<ID_Eleccion>"
            });
        }
        if (!electionDesc) {
            return res.status(400).json({
                message: "Debe enviar electionDesc"
            });
        }

        // 1. Consultar datos en PostgreSQL
        const query = `
            SELECT *
            FROM public."MV_TBL_TEEL_Divipole"
            WHERE "ID_Eleccion" = $1
        `;
        const result = await pool.query(query, [electionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No hay datos en Divipola" });
        }

        // 2. Crear Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('DIVIPOLE');

        // Crear encabezados dinámicamente según columnas del query
        const columns = Object.keys(result.rows[0]).map(col => ({
            header: col,
            key: col,
            width: 25
        }));

        worksheet.columns = columns;

        // Insertar filas
        result.rows.forEach(row => worksheet.addRow(row));

        // Formato opcional de encabezado
        worksheet.getRow(1).font = { bold: true };

        const fileName = `DIVIPOLE_${electionDesc}.xlsx`;


        // 3. Responder archivo para descarga
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generando Excel", error });
    }
});

app.get("/export_divipole_by_id", async (req, res) => {
    try {
        const electionId = req.query.id;

        // Validar que se envió ID de elección
        if (!electionId) {
            return res.status(400).json({
                message: "Debe enviar ?id=<ID_Eleccion>"
            });
        }

        // 1. Consultar datos en PostgreSQL
        const query = `
            SELECT *
            FROM public."MV_TBL_TEEL_Divipole"
            WHERE "ID_Eleccion" = $1
        `;
        const result = await pool.query(query, [electionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No hay datos en Divipola para esta elección" });
        }

        // 2. Crear Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('DIVIPOLE');

        // Crear encabezados dinámicos
        const columns = Object.keys(result.rows[0]).map(col => ({
            header: col,
            key: col,
            width: 25
        }));
        worksheet.columns = columns;

        // Insertar filas
        result.rows.forEach(row => worksheet.addRow(row));

        worksheet.getRow(1).font = { bold: true };

        const fileName = `DIVIPOLE_${electionId}.xlsx`;

        // 3. Enviar archivo Excel
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generando Excel", error });
    }
});

app.get("/budgets", async (req, res) => {
    try {
        res.render("budgets/index");

    } catch (err) {
        console.error(err);
        res.render("elections", {
            error: "Error cargando elecciones",
            elections: []
        });
    }
});

// ======================================================
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});

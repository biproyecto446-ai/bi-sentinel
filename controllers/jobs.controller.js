import * as service from "../services/jobs.service.js";

/**
 * Renderiza la página principal de jobs
 */
export const getCron = async (req, res) => {
  try {
    const data = await service.getCrons(req.query.page);
    res.render("jobs/index", data);
  } catch (e) {
    console.error("Error en getCron:", e);
    res.render("jobs/index", { error: "Error cargando cron jobs" });
  }
};

/**
 * Renderiza los detalles de ejecución de un job
 */
export const getCronsDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const runs = await service.getCronsDetails(id, req.query.page);
    res.render("jobs/details", runs);
  } catch (e) {
    console.error("Error en getCronsDetails:", e);
    res.render("jobs/details", { error: "Error cargando detalles del job" });
  }
};

/**
 * API: Obtiene un job por ID (para el modal)
 */
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await service.getJobById(id);
    res.json({ success: true, job });
  } catch (e) {
    console.error("Error en getJobById:", e);
    const message = e.message === 'JOB_NOT_FOUND' 
      ? 'Job no encontrado' 
      : 'Error al obtener el job';
    res.status(404).json({ success: false, error: message });
  }
};

/**
 * API: Actualiza el schedule de un job
 */
export const updateJobSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;

    if (!schedule) {
      return res.status(400).json({ 
        success: false, 
        error: 'El schedule es requerido' 
      });
    }

    const result = await service.updateJobSchedule(id, schedule);
    res.json(result);
  } catch (e) {
    console.error("Error en updateJobSchedule:", e);
    const message = e.message === 'JOB_NOT_FOUND' 
      ? 'Job no encontrado' 
      : 'Error al actualizar el schedule';
    res.status(400).json({ success: false, error: message });
  }
};

/**
 * API: Activa o desactiva un job
 */
export const toggleJobActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        error: 'El campo active debe ser true o false' 
      });
    }

    const result = await service.toggleJobActive(id, active);
    res.json(result);
  } catch (e) {
    console.error("Error en toggleJobActive:", e);
    const message = e.message === 'JOB_NOT_FOUND' 
      ? 'Job no encontrado' 
      : 'Error al cambiar el estado del job';
    res.status(400).json({ success: false, error: message });
  }
};

/**
 * API: Actualiza un job completo
 */
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule, active } = req.body;

    const result = await service.updateJob(id, { schedule, active });
    res.json(result);
  } catch (e) {
    console.error("Error en updateJob:", e);
    const message = e.message === 'JOB_NOT_FOUND' 
      ? 'Job no encontrado' 
      : 'Error al actualizar el job';
    res.status(400).json({ success: false, error: message });
  }
};

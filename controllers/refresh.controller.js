import * as service from "../services/refresh.service.js";

export const getRefreshCron = async (req, res) => {
  try {
    const data = await service.getRefreshCron(req.query.page, req.query.limit);
    res.render("refresh_cron", data);
  } catch (e) {
    res.render("refresh_cron", { error: "Error cargando refresh cron" });
  }
};

export const getDetalle = async (req, res) => {
  try {
    const row = await service.getDetalleById(req.params.id);
    res.render("detalle", row);
  } catch {
    res.render("detalle", { error: "No existe el registro" });
  }
};

export const compare = async (req, res) => {
  try {
    const { id1, id2 } = req.query;

    if (!id1 || !id2) {
      return res.render("compare", {
        error: "Debes enviar id1 e id2 para comparar."
      });
    }

    const data = await service.compareByIds(id1, id2);

    res.render("compare", {
      titulo: `Comparación entre ejecuciones #${id1} y #${id2}`,
      ...data
    });

  } catch (e) {
    res.render("compare", {
      error: e.message === "IDS_NOT_FOUND"
        ? "Uno o ambos IDs no existen."
        : "Error cargando la comparación."
    });
  }
};


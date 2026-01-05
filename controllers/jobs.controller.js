import * as service from "../services/jobs.service.js";

export const getCron = async (req, res) => {
  try {
    const data = await service.getCrons(req.query.page);
    res.render("jobs/index", data);
  } catch (e) {
    res.render("refresh_cron", { error: "Error cargando refresh cron" });
  }
};


export const getCronsDetails = async (req, res) => {
  try {
    const runs = await service.getCronsDetails(req.query.page);
    console.log('Runs details:', runs);
    res.render("jobs/details", runs);
  } catch (e) {
    res.render("refresh_cron", { error: "Error cargando jobs details cron" });
  }
};
import * as service from "../services/board-origin.service.js";

export const getBoardOrigin = async (req, res) => {
  try {
    const elections = await service.getElections();
    
    res.render("board-origin/index", {
      elections
    });
  } catch (e) {
    console.error("❌ Error en getBoardOrigin:", e);
  }
};

export const getInfoEleccion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const testigosMesa = await service.getCountTestigosMesa(id);
    
    res.json({
      success: true,
      data: {
        testigosMesa
      }
    });
  } catch (e) {
    console.error("❌ Error en getInfoEleccion:", e);
    res.status(500).json({ success: false, error: "Error al obtener información" });
  }
};

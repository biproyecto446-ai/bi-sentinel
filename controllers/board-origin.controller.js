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

export const getCardData = async (req, res) => {
  try {
    const { id, cardName } = req.params;

    switch (cardName) {
      case "testigos-mesa": {
        const count = await service.getCountTestigosMesa(id);
        return res.json({ success: true, data: { count } });
      }
      case "testigos-comision": {
        const count = await service.getCountsTestigoComision(id);
        return res.json({ success: true, data: { count } });
      }
      case "credenciales": {
        const count = await service.getCountCredenciales(id);
        return res.json({ success: true, data: { count } });
      }
      case "resolutions": {
        const count = await service.getCountResolutions(id);
        return res.json({ success: true, data: { count } });
      }
      default:
        return res.status(400).json({ success: false, error: "Unknown card" });
    }
  } catch (e) {
    console.error("❌ Error en getCardData:", e);
    res.status(500).json({ success: false, error: "Error al obtener información" });
  }
};

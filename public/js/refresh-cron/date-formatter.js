/**
 * Formatea las fechas en elementos con data-date
 * Convierte timestamps a formato legible en español (Colombia)
 */
(() => {
  const formatDates = () => {
    document.querySelectorAll("[data-date]").forEach(td => {
      const dateValue = td.dataset.date;
      if (!dateValue) return;
      
      td.textContent = new Date(dateValue).toLocaleString("es-CO", {
        timeZone: "America/Bogota",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", formatDates);
  } else {
    formatDates();
  }
})();

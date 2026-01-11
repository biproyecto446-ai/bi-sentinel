/**
 * Maneja la selección de ejecuciones para comparar
 * Permite seleccionar máximo 2 y redirige a la página de comparación
 */
(() => {
  const MAX_SELECTIONS = 2;

  const init = () => {
    const checks = document.querySelectorAll(".compare-check");
    const compareBtn = document.getElementById("compareBtn");
    const info = document.getElementById("selectionInfo");
    const selA = document.getElementById("selA");
    const selB = document.getElementById("selB");

    if (!compareBtn || !info) return;

    let selectedOrder = [];

    const updateUI = () => {
      info.textContent = `${selectedOrder.length} / ${MAX_SELECTIONS} seleccionadas`;
      selA.textContent = selectedOrder[0] ?? "–";
      selB.textContent = selectedOrder[1] ?? "–";

      const enabled = selectedOrder.length === MAX_SELECTIONS;
      compareBtn.disabled = !enabled;
      compareBtn.classList.toggle("opacity-50", !enabled);
      compareBtn.classList.toggle("cursor-not-allowed", !enabled);
    };

    checks.forEach(chk => {
      chk.addEventListener("change", () => {
        if (chk.checked) {
          if (selectedOrder.length >= MAX_SELECTIONS) {
            chk.checked = false;
            return;
          }
          selectedOrder.push(chk.value);
        } else {
          selectedOrder = selectedOrder.filter(id => id !== chk.value);
        }
        updateUI();
      });
    });

    compareBtn.addEventListener("click", () => {
      if (selectedOrder.length !== MAX_SELECTIONS) return;
      const [id1, id2] = selectedOrder;
      window.location.href = `/compare?id1=${id1}&id2=${id2}`;
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

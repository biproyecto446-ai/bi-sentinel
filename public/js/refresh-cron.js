document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       1. FORMATEO DE FECHAS (tabla)
       ========================================================= */

    document.querySelectorAll("[data-date]").forEach(td => {
        td.textContent = new Date(td.dataset.date).toLocaleString("es-CO", {
            timeZone: "America/Bogota",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    });

    /* =========================================================
       2. SELECCIÓN DE EJECUCIONES (comparar)
       ========================================================= */

    const checks = document.querySelectorAll(".compare-check");
    const compareBtn = document.getElementById("compareBtn");
    const info = document.getElementById("selectionInfo");
    const selA = document.getElementById("selA");
    const selB = document.getElementById("selB");

    let selectedOrder = [];

    checks.forEach(chk => {
        chk.addEventListener("change", () => {

            if (chk.checked) {
                if (selectedOrder.length >= 2) {
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

    function updateUI() {
        info.textContent = `${selectedOrder.length} / 2 seleccionadas`;
        selA.textContent = selectedOrder[0] ?? "–";
        selB.textContent = selectedOrder[1] ?? "–";

        const enabled = selectedOrder.length === 2;
        compareBtn.disabled = !enabled;
        compareBtn.classList.toggle("opacity-50", !enabled);
        compareBtn.classList.toggle("cursor-not-allowed", !enabled);
    }

    compareBtn?.addEventListener("click", () => {
        if (selectedOrder.length !== 2) return;
        const [id1, id2] = selectedOrder;
        window.location.href = `/compare?id1=${id1}&id2=${id2}`;
    });

    /* =========================================================
       3. EXTRAER DATOS DESDE LA TABLA
       ========================================================= */

    const rows = document.querySelectorAll("#tableBody tr");

    const ids = [];
    const durations = [];

    const statusCounters = {
        SUCCESS: 0,
        EN_PROCESO: 0,
        PARTIAL_ERROR: 0,
        OTHER: 0
    };

    rows.forEach(row => {
        const id = row.querySelector("td:nth-child(2)")?.innerText.replace("#", "");
        const start = row.querySelector("td:nth-child(3)")?.dataset.date;
        const end = row.querySelector("td:nth-child(4)")?.dataset.date;
        const statusText = row.querySelector("td:nth-child(5)")?.textContent || "";

        if (id && start && end) {
            const seconds = Math.round(
                (new Date(end) - new Date(start)) / 1000
            );
            ids.push(id);
            durations.push(seconds);
        }

        if (statusText.includes("SUCCESS")) statusCounters.SUCCESS++;
        else if (statusText.includes("EN_PROCESO")) statusCounters.EN_PROCESO++;
        else if (statusText.includes("PARTIAL_ERROR")) statusCounters.PARTIAL_ERROR++;
        else statusCounters.OTHER++;
    });

    /* =========================================================
       4. GRÁFICA: DURACIÓN DE EJECUCIONES (barras)
       ========================================================= */

    const durationCanvas = document.getElementById("durationChart");

    if (durationCanvas && ids.length) {
        new Chart(durationCanvas, {
            type: "bar",
            data: {
                labels: ids.reverse(),
                datasets: [{
                    label: "Duración (segundos)",
                    data: durations.reverse(),
                    backgroundColor: "#6366f1",
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.raw} s`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: v => `${v}s`
                        }
                    }
                }
            }
        });
    }

    /* =========================================================
       5. GRÁFICA: DISTRIBUCIÓN DE ESTADOS (donut)
       ========================================================= */

    const statusCanvas = document.getElementById("statusChart");

    if (statusCanvas) {
        new Chart(statusCanvas, {
            type: "doughnut",
            data: {
                labels: ["Éxito", "En proceso", "Error parcial", "Otros"],
                datasets: [{
                    data: [
                        statusCounters.SUCCESS,
                        statusCounters.EN_PROCESO,
                        statusCounters.PARTIAL_ERROR,
                        statusCounters.OTHER
                    ],
                    backgroundColor: [
                        "#22c55e",
                        "#3b82f6",
                        "#ef4444",
                        "#9ca3af"
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: "65%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            boxWidth: 14,
                            padding: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.label}: ${ctx.raw}`
                        }
                    }
                }
            }
        });
    }

});

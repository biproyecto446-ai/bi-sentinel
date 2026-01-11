/**
 * Actualiza las tarjetas de estado y genera el gráfico de barras horizontal
 */
(() => {
  const STATUS_COLORS = {
    SUCCESS: "#10b981",
    EN_PROCESO: "#3b82f6",
    PARTIAL_ERROR: "#f59e0b",
    ERROR: "#ef4444"
  };

  const init = () => {
    const rows = document.querySelectorAll("#tableBody tr");
    const statusCounts = {
      SUCCESS: 0,
      EN_PROCESO: 0,
      PARTIAL_ERROR: 0,
      ERROR: 0
    };

    let total = 0;

    rows.forEach(row => {
      const statusCell = row.querySelector("td:nth-child(5)");
      if (!statusCell) return;

      // Leer el data-status del span del badge
      const badge = statusCell.querySelector("[data-status]");
      const statusText = badge ? badge.dataset.status : "ERROR";
      
      if (statusCounts.hasOwnProperty(statusText)) {
        statusCounts[statusText]++;
      } else {
        statusCounts.ERROR++;
      }
      total++;
    });

    // Actualizar tarjetas
    document.querySelectorAll(".status-card").forEach(card => {
      const status = card.dataset.status;
      const count = statusCounts[status] || 0;
      const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

      card.querySelector(".status-count").textContent = count;
      card.querySelector(".status-bar").style.width = `${percent}%`;
      card.querySelector(".status-percent").textContent = `${percent}% del total`;
    });

    // Crear gráfico de barras horizontal
    const ctx = document.getElementById("statusBarChart");
    if (!ctx) return;

    const labels = ["Exitosos", "En Proceso", "Error Parcial", "Error"];
    const data = [
      statusCounts.SUCCESS,
      statusCounts.EN_PROCESO,
      statusCounts.PARTIAL_ERROR,
      statusCounts.ERROR
    ];
    const colors = [
      STATUS_COLORS.SUCCESS,
      STATUS_COLORS.EN_PROCESO,
      STATUS_COLORS.PARTIAL_ERROR,
      STATUS_COLORS.ERROR
    ];

    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const percent = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                return `${context.raw} ejecuciones (${percent}%)`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)"
            },
            ticks: {
              stepSize: 1
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                weight: "600"
              }
            }
          }
        }
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

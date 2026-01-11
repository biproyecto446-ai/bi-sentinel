/**
 * Genera el gráfico de duración de ejecuciones
 * Extrae datos de la tabla y crea un gráfico de barras con Chart.js
 */
(() => {
  const init = () => {
    const ctx = document.getElementById("durationChart");
    if (!ctx) return;

    const rows = document.querySelectorAll("#tableBody tr");
    const labels = [];
    const durations = [];

    rows.forEach(row => {
      const id = row.querySelector("td:nth-child(2)")?.innerText.replace("#", "");
      const start = row.querySelector("td:nth-child(3)")?.dataset.date;
      const end = row.querySelector("td:nth-child(4)")?.dataset.date;

      if (!id || !start || !end) return;

      const startDate = new Date(start);
      const endDate = new Date(end);
      const seconds = Math.round((endDate - startDate) / 1000);

      labels.push(id);
      durations.push(seconds);
    });

    if (labels.length === 0) return;

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels.reverse(),
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
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

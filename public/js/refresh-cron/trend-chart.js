/**
 * Genera el gráfico de tendencia de rendimiento
 * Muestra un gráfico de línea con la evolución del tiempo de ejecución
 */
(() => {
  const init = () => {
    const ctx = document.getElementById("trendChart");
    if (!ctx) return;

    const rows = document.querySelectorAll("#tableBody tr");
    const dataPoints = [];

    rows.forEach(row => {
      const id = row.querySelector("td:nth-child(2)")?.innerText.replace("#", "");
      const start = row.querySelector("td:nth-child(3)")?.dataset.date;
      const end = row.querySelector("td:nth-child(4)")?.dataset.date;
      const statusCell = row.querySelector("td:nth-child(5)");

      if (!id || !start || !end) return;

      const startDate = new Date(start);
      const endDate = new Date(end);
      const seconds = Math.round((endDate - startDate) / 1000);
      const badge = statusCell?.querySelector("[data-status]");
      const statusText = badge ? badge.dataset.status : "ERROR";

      dataPoints.push({
        id,
        date: startDate,
        duration: seconds,
        status: statusText
      });
    });

    if (dataPoints.length === 0) return;

    // Ordenar por fecha (más antiguo primero)
    dataPoints.sort((a, b) => a.date - b.date);

    const labels = dataPoints.map(d => `#${d.id}`);
    const durations = dataPoints.map(d => d.duration);

    // Calcular promedio móvil (ventana de 3)
    const movingAvg = durations.map((val, idx, arr) => {
      if (idx < 2) return val;
      return Math.round((arr[idx - 2] + arr[idx - 1] + val) / 3);
    });

    // Colores por estado
    const pointColors = dataPoints.map(d => {
      switch (d.status) {
        case "SUCCESS": return "#10b981";
        case "EN_PROCESO": return "#3b82f6";
        case "PARTIAL_ERROR": return "#f59e0b";
        default: return "#ef4444";
      }
    });

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Duración",
            data: durations,
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            borderWidth: 2,
            pointBackgroundColor: pointColors,
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
            tension: 0.3
          },
          {
            label: "Promedio móvil",
            data: movingAvg,
            borderColor: "#f59e0b",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          intersect: false,
          mode: "index"
        },
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              afterLabel: (context) => {
                if (context.datasetIndex === 0) {
                  const point = dataPoints[context.dataIndex];
                  return `Estado: ${point.status}`;
                }
                return "";
              },
              label: (context) => {
                return `${context.dataset.label}: ${context.raw}s`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)"
            },
            ticks: {
              callback: v => `${v}s`
            }
          },
          x: {
            grid: {
              display: false
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

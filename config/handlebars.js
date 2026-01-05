import { engine } from "express-handlebars";
import path from "path";

export const setupHandlebars = (app, __dirname) => {
  app.engine("hbs", engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: {
      eq: (a, b) => a === b,
      lt: (a, b) => a < b,
      gt: (a, b) => a > b,
      add: (a, b) => Number(a) + Number(b),
      subtract: (a, b) => Number(a) - Number(b),
      multiply: (a, b) => Number(a) * Number(b),
      keys: obj => Object.keys(obj || {}),
      formatDuration(seconds) {
        if (!seconds) return "—";
        const ms = Math.round(seconds * 1000);
        return `${Math.floor(ms / 1000)}s ${ms % 1000}ms`;
      }
    }
  }));

  app.set("view engine", "hbs");
  app.set("views", path.join(__dirname, "views"));
};

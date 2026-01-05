# 📊 PowerBI Ops

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
</p>

<p align="center">
  <strong>Sistema de monitoreo y operaciones para infraestructura de Business Intelligence</strong><br>
  Conectado a las bases de datos de producción del sistema electoral TEEL
</p>

---

## ⚠️ Advertencia

> **Este sistema consulta datos en VIVO desde las bases de datos de PRODUCCIÓN.**  
> Usar con precaución y solo personal autorizado.

---

## 🎯 Características

- **Refresh Cron** - Monitorea y audita procesos de actualización de vistas materializadas
- **Jobs** - Supervisa la ejecución de tareas programadas y su estado
- **Board Origin** - Consulta datos en tiempo real desde producción (elecciones, testigos, etc.)
- **Comparador** - Compara ejecuciones históricas para detectar variaciones
- **Exportación Excel** - Genera reportes en formato Excel

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express 5.x |
| **Base de datos** | PostgreSQL |
| **Template Engine** | Handlebars |
| **Estilos** | TailwindCSS (CDN) |
| **Gráficos** | Chart.js |

---

## 📋 Requisitos Previos

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- Acceso a las bases de datos PostgreSQL (BI y Producción)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd losgs_db_mirror
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales (ver sección de configuración).

### 4. Iniciar el servidor

```bash
# Producción
npm start

# Desarrollo (con hot-reload)
npm run dev
```

El servidor estará disponible en: **http://localhost:3000**

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# ============================================
# BASE DE DATOS BI (Auditoría/Logs)
# ============================================
BI_DB_HOST=localhost
BI_DB_PORT=5432
BI_DB_USER=usuario_bi
BI_DB_PASSWORD=password_bi
BI_DB_NAME=nombre_db_bi
BI_DB_POOL_MAX=10

# ============================================
# BASE DE DATOS PRODUCCIÓN
# ============================================
PROD_DB_HOST=localhost
PROD_DB_PORT=5432
PROD_DB_USER=usuario_prod
PROD_DB_PASSWORD=password_prod

# Nombres de las bases de datos
PROD_DB_NAME_PARAMETERS=db_parametros
PROD_DB_NAME_WITNESS=db_testigos
PROD_DB_NAME_DOCUMENTS=db_documentos

# Pool connections
PROD_DB_POOL_MAX=5
PROD_WITNESS_DB_POOL_MAX=5
PROD_USERS_DB_POOL_MAX=5
```

### Conexiones a Base de Datos

El sistema utiliza múltiples pools de conexión:

| Pool | Descripción | Variable DB Name |
|------|-------------|------------------|
| `biPool` | Base de datos de BI (auditoría) | `BI_DB_NAME` |
| `prodParametrosPool` | Catálogos y parámetros | `PROD_DB_NAME_PARAMETERS` |
| `prodWitnessPool` | Testigos de mesa | `PROD_DB_NAME_WITNESS` |
| `prodUsersPool` | Documentos y usuarios | `PROD_DB_NAME_DOCUMENTS` |

---

## 📁 Estructura del Proyecto

```
losgs_db_mirror/
├── config/
│   ├── db.js              # Configuración de conexiones PostgreSQL
│   └── handlebars.js      # Configuración del template engine
├── controllers/
│   ├── board-origin.controller.js
│   ├── jobs.controller.js
│   └── refresh.controller.js
├── routes/
│   ├── board-origin.routes.js
│   ├── graphics.routes.js
│   ├── jobs.routes.js
│   └── refresh.routes.js
├── services/
│   ├── board-origin.service.js
│   ├── jobs.service.js
│   └── refresh.service.js
├── utils/
│   ├── cronHumanizer.js   # Utilidad para humanizar expresiones cron
│   └── excel.utils.js     # Generación de archivos Excel
├── views/
│   ├── layouts/
│   │   └── main.hbs       # Layout principal
│   ├── board-origin/
│   ├── jobs/
│   └── ...
├── public/
│   └── js/
├── app.js                 # Configuración de Express
├── server.js              # Punto de entrada
├── package.json
└── .env                   # Variables de entorno (crear)
```

---

## 🌐 Rutas Disponibles

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/` | GET | Página de inicio |
| `/refresh_cron` | GET | Monitor de Refresh Cron |
| `/jobs` | GET | Lista de Jobs programados |
| `/jobs/:id` | GET | Detalle de un Job |
| `/board-origin` | GET | Dashboard de datos de producción |
| `/api/board-origin/:id` | GET | API: Info de elección por ID |

---

## 🧪 Scripts Disponibles

```bash
# Iniciar en producción
npm start

# Iniciar en desarrollo (con nodemon)
npm run dev
```

> **Nota:** Para usar `npm run dev`, agrega el script en `package.json`:
> ```json
> "scripts": {
>   "dev": "nodemon server.js",
>   "start": "node server.js"
> }
> ```

---

## 🔒 Seguridad

- ✅ Consultas parametrizadas (prevención de SQL Injection)
- ✅ Variables de entorno para credenciales
- ⚠️ Asegurar acceso solo a personal autorizado
- ⚠️ No exponer públicamente sin autenticación

---

## 📝 Licencia

ISC

---

## 👥 Autor

Desarrollado para operaciones de Business Intelligence

---

<p align="center">
  <sub>⚡ Powered by Node.js + Express + PostgreSQL</sub>
</p>

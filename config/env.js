const path = require('path');
// Carga el .env desde la carpeta del backend, independientemente del CWD de PM2
require('dotenv').config({ path: path.join(__dirname, '../.env') });

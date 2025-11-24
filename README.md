# CostoSmart Backend

Este proyecto es el servidor de la aplicación **CostoSmart**. Utiliza Express y Sequelize para exponer una API REST.

## Variables de entorno

El servidor utiliza variables de entorno que pueden declararse en un archivo `.env` en la raíz del proyecto:

- `PORT`: puerto en el que se ejecuta el servidor (por defecto `3010`).
- `CORS_ORIGIN`: lista de orígenes separados por coma (ej: `http://localhost:3000,http://localhost:5173,https://tu-dominio.com`). Usa `*` solo en desarrollo.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`: conexión a MySQL.
- `LOG_DB_NAME`: si se establece en `true`, muestra en consola el nombre de la base de datos utilizada.
- `JWT_SECRET`: secreto usado para firmar los tokens JWT.
- `RESET_SECRET_KEY`: (opcional) secreto para reset de contraseña; si se omite se usa `JWT_SECRET`.
- `EMAIL_USER`, `EMAIL_PASS`: credenciales SMTP (Gmail) para envío de mails de recuperación.
- `FRONTEND_URL`: URL base del frontend para construir el link de recuperación de contraseña.

Ejemplo de archivo `.env`:

```dotenv
PORT=3010
CORS_ORIGIN=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contrasena
DB_NAME=costo_smart
LOG_DB_NAME=false

JWT_SECRET=super-secreto
RESET_SECRET_KEY=otro-secreto
EMAIL_USER=tu_usuario@gmail.com
EMAIL_PASS=tu_password_app
FRONTEND_URL=http://localhost:3000
```

## Uso

Instala las dependencias y ejecuta el servidor con:

```bash
npm install
npm start
```

Esto levantará la API usando los valores de las variables de entorno que hayas configurado.

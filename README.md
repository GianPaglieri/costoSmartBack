# CostoSmart Backend

Este proyecto es el servidor de la aplicación **CostoSmart**. Utiliza Express y Sequelize para exponer una API REST.

## Variables de entorno

El servidor utiliza variables de entorno que pueden declararse en un archivo `.env` en la raíz del proyecto. Para configurar el CORS y el puerto del servidor se emplean las siguientes variables:

- `CORS_ORIGIN`: origen permitido para las solicitudes CORS. Si no se define, se permite cualquier origen (útil para desarrollo).
- `PORT`: puerto en el que se ejecuta el servidor. Por defecto `3001`.

Ejemplo de archivo `.env`:

```dotenv
CORS_ORIGIN=http://localhost:3000
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=tu_contrasena
DB_NAME=costo_smart
```

## Uso

Instala las dependencias y ejecuta el servidor con:

```bash
npm install
npm start
```

Esto levantará la API usando los valores de las variables de entorno que hayas configurado.

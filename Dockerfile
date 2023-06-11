# Establece la imagen base
FROM node:14-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /backend

# Copia los archivos necesarios
COPY package.json .
COPY package-lock.json .

# Instala las dependenciasdocker
RUN npm install

# Copia el resto del código fuente
COPY . .

# Expone el puerto en el que el backend está escuchando
EXPOSE 3000

# Comando para iniciar el backend
CMD [ "node", "server.js" ]


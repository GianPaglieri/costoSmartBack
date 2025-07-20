const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log('Multer: Destination called');
    cb(null, 'uploads/'); // Asegúrate de que 'uploads/' exista
  },
  filename: function (req, file, cb) {
    // console.log('Multer: Filename called');
    // console.log('File received:', file); // Agregar esta línea para ver detalles sobre el archivo recibido
    const ext = file.originalname.split('.').pop(); // Obtener la extensión del archivo original
    const uniqueSuffix = Date.now();
    cb(null, `imagen-${uniqueSuffix}.${ext}`); // Nuevo formato para el nombre del archivo
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
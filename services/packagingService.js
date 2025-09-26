const Ingrediente = require('../models/Ingrediente');

const PACKAGING_NAME = 'Packaging';
const PACKAGING_DEFAULTS = {
  nombre: PACKAGING_NAME,
  unidad_Medida: 'unidad',
  tamano_Paquete: 1,
  costo: 1000,
  CantidadStock: 0,
};

const ensurePackagingForUser = async (userId) => {
  if (!userId) {
    throw new Error('Se requiere un id de usuario para obtener el Packaging.');
  }

  const [packaging] = await Ingrediente.findOrCreate({
    where: { nombre: PACKAGING_NAME, id_usuario: userId },
    defaults: { ...PACKAGING_DEFAULTS, id_usuario: userId },
  });

  return packaging;
};

module.exports = { ensurePackagingForUser, PACKAGING_NAME };

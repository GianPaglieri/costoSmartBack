const { validationResult } = require('express-validator');

/**
 * Ejecuta validaciones y retorna errores en formato JSON si existen.
 * @param {Array} validations - Lista de validaciones de express-validator.
 */
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(400).json({ errors: errors.array() });
  };
};

module.exports = { validate };

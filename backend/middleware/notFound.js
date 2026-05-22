const notFound = (req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada.',
  });
};

module.exports = notFound;

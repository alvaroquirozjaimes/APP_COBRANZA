const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`Servidor backend de Cobranza corriendo en el puerto ${env.port}`);
});

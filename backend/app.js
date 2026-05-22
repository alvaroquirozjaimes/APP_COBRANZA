const express = require('express');
const configureSecurity = require('./middleware/securityMiddleware');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

configureSecurity(app);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'API de Cobranza Móvil está funcionando.',
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'app-cobranza-backend' });
});

app.use('/api/cobranza', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

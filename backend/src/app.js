const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/error-handler');

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiRoutes);
app.use(errorHandler);

module.exports = app;

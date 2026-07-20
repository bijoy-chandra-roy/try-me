const express = require('express');
const productRoutes = require('../features/products/product.routes');
const tryOnRoutes = require('../features/try-on/try-on.routes');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'TryMe API is running' });
});

router.use('/products', productRoutes);
router.use('/try-on', tryOnRoutes);

module.exports = router;

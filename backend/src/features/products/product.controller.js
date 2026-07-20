const productService = require('./product.service');

async function getProducts(req, res, next) {
  try {
    const { category, inStock } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (inStock !== undefined) filters.inStock = inStock === 'true';

    const products = await productService.getProducts(filters);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProducts, getProductById };
